"""Conservative daily Arzan.kz checker for the TASSAY Market Monitor.

No inferred prices: accepts only named store offers in the matching product's
own 'Цены по магазинам' section. Missing/unreadable sources are logged.
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


def verify_product(title: str, brand: str) -> bool:
    x = re.sub(r'\s+', ' ', title).casefold()
    brand_ok = {
        'TASSAY': bool(re.search(r'tassay|тассай', x)),
        'TURAN': bool(re.search(r'turan|туран', x)),
        'ESSENTUKI4': bool(re.search(r'ессентуки\s*(?:№\s*)?4\b|essentuki\s*(?:№\s*)?4\b', x)),
    }[brand]
    gas = bool(re.search(r'газированн', x)) and not bool(re.search(r'негазированн|без\s+газа', x))
    volume = bool(re.search(r'(?<!\d)1\s*(?:л|l)\b', x))
    return brand_ok and gas and volume


def parse_offers(html: str, brand: str) -> tuple[str, dict[str, int]]:
    soup = BeautifulSoup(html, 'html.parser')
    title_node = soup.find('h1')
    title = title_node.get_text(' ', strip=True) if title_node else ''
    if not title or not verify_product(title, brand):
        raise ValueError('Товар, газированность или объём 1 л не подтверждены заголовком страницы')
    text = ' '.join(soup.stripped_strings).replace('\xa0', ' ')
    section = re.search(r'Цены\s+по\s+магазинам\s*(.*?)\s*(?:История\s+цен|Похожие\s+товары|$)', text, re.I | re.S)
    if not section:
        raise ValueError('Раздел «Цены по магазинам» отсутствует (возможно, данные загружаются JavaScript)')
    offers = {}
    for shop, alias in SHOPS.items():
        # Arzan sometimes repeats the logo alt and store name, e.g. "SmallSmall 325 ₸".
        pattern = rf'(?<!\w)(?:{alias})(?:\s*(?:{alias}))?\s*(?:ARZN\s*)?(\d[\d ]{{0,7}})\s*₸'
        matches = [int(m.group(1).replace(' ', '')) for m in re.finditer(pattern, section.group(1), re.I)]
        if len(matches) == 1 and 50 <= matches[0] <= 5000:
            offers[shop] = matches[0]
        # Ambiguity means no record for this shop, not a guessed price.
    if not offers:
        raise ValueError('Не найдено однозначных цен SMALL / Arbuz / Galmart')
    return title, offers


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
            if '/ru/astana/' not in urlparse(res.url).path:
                raise ValueError('Страница перенаправила на другой город')
            title, offers = parse_offers(res.text, brand)
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
            item.update(status='collected', shops=offers, added=added)
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
