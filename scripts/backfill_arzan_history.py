"""Backfill missing Nov 3–9, 2026 offers from recorded public Arzan history.

The backfill is conservative: it never overwrites daily snapshots and never
copies today's price onto past dates. It uses each store's dated price events,
marks its observations as reconstructed from the price-history series, and
refuses ambiguous multi-branch or out-of-stock data.
"""
from __future__ import annotations
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT=Path(__file__).resolve().parents[1]
PROBE=ROOT/"data"/"arzan-history-probe.json"
ARCHIVE=ROOT/"data"/"daily-prices.json"
DAYS=[f"2026-11-{n:02}" for n in range(3,10)]
MAP={"arbuz":"Arbuz","арбуз":"Arbuz","small":"SMALL","смолл":"SMALL",
     "galmart":"Galmart","галмарт":"Galmart"}
PRODUCTS={
 "TASSAY":"https://arzan.kz/ru/astana/p/voda-mineralnaya-tassay-gazirovannaya-1l-59532c36-90e0-4575-af62-aedb6e80b501",
 "TURAN":"https://arzan.kz/ru/astana/p/voda-mineralnaya-gazirovannaya-turan-1l-57cf9489-44e3-403c-ac0c-4889305c0696",
 "ESSENTUKI4":"https://arzan.kz/ru/astana/p/voda-mineralnaya-essentuki-4-gazirovannaya-1l-1f15b35a-08de-4cc9-b1bd-8745c1e35006",
}

def canonical(name):
    name=str(name or "").strip().lower()
    if name in MAP:return MAP[name]
    if name.startswith("small "):return "SMALL"
    return None

def as_of(events, day):
    """Last source-recorded, in-stock offer through that date, or None."""
    history=[x for x in events if isinstance(x,dict)
             and isinstance(x.get("date"),str) and x["date"]<=day]
    if not history:return None
    record=max(history,key=lambda x:(x["date"],str(x.get("datetime") or "")))
    if record.get("in_stock") is False:return None
    try:
        p=float(record.get("price"))
        if not p.is_integer() or not (50<=p<=5000):return None
        return int(p),str(record.get("date")),str(record.get("datetime") or "")
    except (ValueError,TypeError):return None

def candidates(history,day):
    offers=defaultdict(set)
    evidence=defaultdict(list)
    for st in history:
        if not isinstance(st,dict):continue
        city=str(st.get("city_name") or "").strip().lower()
        if city and city not in ("астана","astana"):continue
        shop=canonical(st.get("chain_name") or st.get("store_name"))
        if shop is None:continue
        record=as_of(st.get("prices") or [],day)
        if record is None:continue
        price,observed_date,observed_time=record
        offers[shop].add(price)
        evidence[shop].append((price,observed_date,observed_time))
    result={}
    for shop,prices in offers.items():
        if len(prices)==1:
            price=next(iter(prices))
            relevant=[x for x in evidence[shop] if x[0]==price]
            result[shop]=(price,max(relevant,key=lambda x:(x[1],x[2])))
    return result

def backfill(probe, archive):
    observations=archive.setdefault("observations",[])
    existing={(str(r.get("day")),str(r.get("brand")),str(r.get("shop")))
              for r in observations if r.get("city")=="Астана"}
    captured=datetime.now(ZoneInfo("Asia/Almaty")).isoformat(timespec="seconds")
    added=[]
    for product in probe.get("data",[]):
        brand=product.get("brand")
        if brand not in PRODUCTS:continue
        history=(product.get("history_api") or {}).get("stores")
        if not isinstance(history,list) or not history:continue
        for day in DAYS:
            for shop,(price,ev) in candidates(history,day).items():
                key=(day,brand,shop)
                if key in existing:continue
                observations.append({
                    "day":day,"captured_at":captured,"city":"Астана",
                    "brand":brand,"shop":shop,"price":price,"currency":"KZT",
                    "volume_ml":1000,"source":"Arzan.kz",
                    "source_url":PRODUCTS[brand],"status":"auto_unverified",
                    "evidence_url":None,
                    "source_method":"historical_price_history",
                    "source_price_record_date":ev[1],
                    "source_price_record_at":ev[2],
                    "notes":"Реконструкция по истории цен Arzan.kz: последнее известное предложение на указанную дату; не утренний снимок."
                })
                existing.add(key)
                added.append({"day":day,"brand":brand,"shop":shop,"price":price,
                              "source_price_record_date":ev[1]})
    observations.sort(key=lambda r:(str(r.get("day","")),str(r.get("brand","")),str(r.get("shop",""))))
    return added

def main():
    if not PROBE.is_file() or not ARCHIVE.is_file():
        print("No public price-history source to backfill");return
    probe=json.loads(PROBE.read_text(encoding="utf-8"))
    archive=json.loads(ARCHIVE.read_text(encoding="utf-8"))
    added=backfill(probe,archive)
    if added:
        ARCHIVE.write_text(json.dumps(archive,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"backfilled":len(added),"prices":added},ensure_ascii=False))

if __name__=="__main__":
    main()
