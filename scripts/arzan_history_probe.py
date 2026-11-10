"""One-time public Arzan price-history diagnostic: no logins or private data."""
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

import requests
from playwright.sync_api import sync_playwright
from scripts.arzan_daily import PRODUCTS, allowed_by_robots

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "arzan-history-probe.json"

def summary(data):
    if isinstance(data, dict):
        return {"keys": list(data)[:32], "arrays": {k:len(v) for k,v in list(data.items())[:30] if isinstance(v,list)}}
    if isinstance(data, list):
        return {"items":len(data), "first_keys":list(data[0])[:25] if data and isinstance(data[0],dict) else []}
    return {"kind":type(data).__name__}

def probe_one(browser, brand, url):
    entries=[]
    page=browser.new_page(locale="ru-RU", viewport={"width":1360,"height":960})
    def inspect(response):
        try:
            typ=response.headers.get("content-type","")
            if not ("json" in typ or "text" in typ) or response.status!=200:
                return
            if urlsplit(response.url).hostname not in ("arzan.kz","www.arzan.kz"):
                return
            body=response.text()
            if len(body)>400000:
                return
            needle=re.compile(r"2026[-./]11[-./](?:0[3-9]|10)|history|chart|histor|price",re.I)
            matches=list(needle.finditer(body))
            if not matches:
                return
            excerpts=[]
            for m in matches[:12]:
                lo=max(0,m.start()-85)
                excerpts.append(body[lo:min(len(body),m.end()+180)])
            try:
                meta=summary(json.loads(body))
            except Exception:
                meta={"kind":"text"}
            entries.append({"path":urlsplit(response.url).path,"type":typ[:60],
                            "size":len(body),"status":response.status,
                            "meta":meta,"excerpts":excerpts[:8]})
        except Exception:
            pass
    page.on("response",inspect)
    info={"brand":brand,"responses":[]}
    try:
        page.goto(url,wait_until="domcontentloaded",timeout=35000)
        page.wait_for_timeout(2500)
        if page.get_by_text("Выберите язык и город",exact=False).count():
            try:
                page.get_by_text("Астана",exact=True).last.click(timeout=2500)
                page.get_by_role("button",name=re.compile("Показать цены",re.I)).click(timeout=2500)
            except Exception:
                try:page.get_by_role("button",name=re.compile("Пока пропустить",re.I)).click(timeout=2500)
                except Exception:pass
        page.wait_for_timeout(2800)
        text=page.locator("body").inner_text(timeout=5000)
        info["page_text"]=text[:3500]
        info["history_words"]=[text[max(0,m.start()-120):min(len(text),m.end()+350)]
                               for m in list(re.finditer(r"истор|график|30 дней|90 дней|180 дней",text,re.I))[:8]]
        info["visible_buttons"]=page.locator("button").all_text_contents()[:45]
        for label in ["90 дней","180 дней","90","180","История цен","График цен"]:
            try:
                elt=page.get_by_text(label,exact=True)
                if elt.count() and elt.first.is_visible():
                    elt.first.click(timeout=2000)
                    page.wait_for_timeout(1500)
                    info.setdefault("clicked",[]).append(label)
            except Exception:
                pass
        info["responses"]=entries[-35:]
        info["url_path"]=urlsplit(page.url).path
    except Exception as e:
        info["error"]=str(e)[:400]
        info["responses"]=entries[-35:]
    finally:
        page.close()
    return info

def main():
    session=requests.Session()
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True)
        try:
            result={"scope":"Public product page and price-history UI only",
                    "data":[probe_one(b,name,url) if allowed_by_robots(session,url) else {"brand":name,"error":"robots"} for name,url in PRODUCTS]}
        finally:b.close()
    OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)[:180000]+"\n",encoding="utf-8")
    print("Arzan public price-history probe saved",[(x["brand"],len(x.get("responses",[])),x.get("error")) for x in result["data"]])

if __name__=="__main__":
    main()
