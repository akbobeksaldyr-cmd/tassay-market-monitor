"""Conservative daily Arzan.kz checker for the TASSAY Market Monitor.

The three URLs identify the products. Only unambiguous named store prices
are recorded from the product page's current price section; no guesswork.
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'daily-prices.json'
CITY = 'Астана'
TZ = ZoneInfo('Asia/Almaty')
HEADERS = {'User-Agent': 'TassayAcademicMonitor/1.0 (+educational project; contact via repository)'}
TIMEOUT = 20
PRODUCTS = [
    ('TASSAY', os.environ.get('ARZAN_TASSAY_URL',
        'https://arzan.kz/ru/astana/p/voda-mineralnaya-tassay-gazirovannaya-1l-59532c36-90e0-4575-af62-aedb6e80b501')),
    ('TURAN', 'https://arzan.kz/ru/astana/p/voda-mineralnaya-gazirovannaya-turan-1l-57cf9489-44e3-403c-ac0c-4889305c0696'),
    ('ESSENTUKI4', 'https://arzan.kz/ru/astana/p/voda-mineralnaya-essentuki-4-gazirovannaya-1l-1f15b35a-08de-4cc9-b1bd-8745c1e35006'),
]
SHOPS = {'Arbuz': '(?:Arbuz|Арбуз)', 'SMALL': '(?:Small|Смолл)', 'Galmart': '(?:Galmart|Галмарт)'}


def parse_offers(html: str, brand: str) -> tuple[str, dict[str, int]]:
    """Use the user-selected product URL as identity, not the HTML page heading.

    Read only the current 'prices by store' section, never a guessed value,
    product recommendation, or unrelated price-history chart.
    """
    soup = BeautifulSoup(html, 'html.parser')
    h1 = soup.find('h1')
    title = h1.get_text(' ', strip=True) if h1 else brand
    text = ' '.join(soup.stripped_strings).replace('\xa0', ' ')
    section = re.search(
        r'(?:Цены\s+по\s+магазинам|Цены\s+в\s+магазинах|Предложения\s+магазинов)'
        r'\s*(.*?)\s*(?:История\s+цен|График\s+цен|Описание\s+товара|Похожие\s+товары|Отзывы|$)',
        text, re.I | re.S,
    )
    if not section:
        raise ValueError('Блок цен магазинов пока не найден (возможно, он загружается JavaScript)')
    offers: dict[str, int] = {}
    for shop, alias in SHOPS.items():
        pattern = rf'(?<!\w)(?:{alias})(?:\s*(?:{alias}))?\s*(?:ARZN\s*)?(\d[\d ]{{0,7}})\s*(?:₸|тенге\b)'
        prices = {
            int(m.group(1).replace(' ', ''))
            for m in re.finditer(pattern, section.group(1), re.I)
        }
        # Multiple different figures for one shop = ambiguity; do not write one.
        if len(prices) == 1:
            price = next(iter(prices))
            if 50 <= price <= 5000:
                offers[shop] = price
    if not offers:
        raise ValueError('Нет однозначных цен SMALL / Arbuz / Galmart в блоке магазинов')
    return title, offers


def render_dynamic_page(url: str) -> tuple[str, str]:
    """Render JavaScript-built public product pages without bypassing access controls."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            page = browser.new_page(locale='ru-RU', viewport={'width': 1360, 'height': 960})
            page.goto(url, wait_until='domcontentloaded', timeout=35000)
            try:
                page.get_by_text(
                    re.compile(r'Цены\s+(?:по\s+магазинам|в\s+магазинах)', re.I)
                ).first.wait_for(state='visible', timeout=10000)
            except Exception:
                # Let parse_offers provide a precise diagnostic if no store list appears.
                page.wait_for_timeout(1500)
            return page.url, page.content()
        finally:
            browser.close()


def same_product_card(requested_url: str, response_url: str) -> bool:
    """Trust the user's exact product URL; reject redirects to other cards/cities."""
    a, b = urlparse(requested_url), urlparse(response_url)
    uid_pattern = r'([0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})$'
    ua, ub = re.search(uid_pattern, a.path, re.I), re.search(uid_pattern, b.path, re.I)
    return (a.scheme == b.scheme == 'https'
            and a.netloc.lower() == b.netloc.lower() == 'arzan.kz'
            and a.path.startswith('/ru/astana/p/')
            and b.path.startswith('/ru/astana/p/')
            and ua is not None and ub is not None
            and ua.group(1).lower() == ub.group(1).lower())


def allowed_by_robots(session: requests.Session, url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.netloc.lower() != 'arzan.kz':
        return False
    rp = RobotFileParser()
    try:
        res = session.get('https://arzan.kz/robots.txt', headers=HEADERS, timeout=TIMEOUT)
        if res.status_code != 200:
            return False  # Safe default when usage rules cannot be read.
        rp.parse(res.text.splitlines())
        return rp.can_fetch(HEADERS['User-Agent'], url)
    except requests.RequestException:
        return False


def run() -> None:
    now = datetime.now(TZ)
    day = now.strftime('%Y-%m-%d')
    moment = now.isoformat(timespec='seconds')
    OUT.parent.mkdir(parents=True, exist_ok=True)
    archive = json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else {'schema_version': 1, 'observations': [], 'runs': []}
    observations = archive.setdefault('observations', [])
    existed = {(r['day'], r['brand'], r['shop']) for r in observations if r.get('city') == CITY}
    run_items = []
    session = requests.Session()
    for brand, url in PRODUCTS:
        item = {'brand': brand, 'url': url, 'status': 'not_checked'}
        try:
            if not allowed_by_robots(session, url):
                raise ValueError('robots.txt недоступен или не разрешает автоматический запрос')
            res = session.get(url, headers=HEADERS, timeout=TIMEOUT)
            res.raise_for_status()
            if not same_product_card(url, res.url):
                raise ValueError('Страница перенаправила на другой город')
            try:
                title, offers = parse_offers(res.text, brand)
                access_mode = 'html'
            except ValueError as html_error:
                # Arzan may render all price cards in the browser via JavaScript.
                # This is normal public-page rendering, not an anti-bot workaround.
                try:
                    rendered_url, rendered_html = render_dynamic_page(url)
                    if not same_product_card(url, rendered_url):
                        raise ValueError('Страница браузера перенаправила на другой город')
                    title, offers = parse_offers(rendered_html, brand)
                    access_mode = 'browser'
                except Exception as browser_error:
                    raise ValueError(
                        f'HTML: {html_error}; браузер: {str(browser_error)[:160]}'
                    ) from browser_error
            added = 0
            for shop, price in offers.items():
                key = (day, brand, shop)
                if key in existed:
                    continue  # Preserve the first daily snapshot (no silent overwrites).
                observations.append({
                    'day': day, 'captured_at': moment, 'city': CITY, 'brand': brand,
                    'shop': shop, 'price': price, 'currency': 'KZT', 'volume_ml': 1000,
                    'source': 'Arzan.kz', 'source_url': res.url, 'source_product_title': title,
                    'status': 'auto_unverified', 'evidence_url': None,
                })
                existed.add(key)
                added += 1
            item.update(status='collected', shops=offers, added=added, method=access_mode)
        except (ValueError, requests.RequestException) as exc:
            item.update(status='unavailable', reason=str(exc)[:300])
        run_items.append(item)
    archive['runs'] = (archive.get('runs') or [])[-89:] + [{'at': moment, 'city': CITY, 'sources': run_items}]
    observations.sort(key=lambda x: (x['day'], x['brand'], x['shop']))
    OUT.write_text(json.dumps(archive, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'day': day, 'results': run_items, 'total_saved': len(observations)}, ensure_ascii=False))
    # A collector that can't reach sources still writes an explicit run log; never fake prices.


if __name__ == '__main__':
    run()
