"""Local deployment smoke test: public pages, scripts, and key user flows."""
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ORIGIN="http://127.0.0.1:8765"

def request(path):
    with urllib.request.urlopen(ORIGIN+path,timeout=20) as response:
        return response.status, response.read()

def main():
    proc=subprocess.Popen(["python","-m","uvicorn","app:app",
       "--host","127.0.0.1","--port","8765"],stdout=subprocess.DEVNULL,
       stderr=subprocess.STDOUT,env=dict(os.environ,ADMIN_PASSWORD="temporary-ci-password"))
    try:
        for attempt in range(70):
            try:
                status,_=request("/api/health")
                if status==200:break
            except (urllib.error.URLError,OSError):
                time.sleep(.3)
        else:raise RuntimeError("FastAPI did not start")
        for path,needle in [
          ("/ru",b"modern-ui.js"),
          ("/kk",b"modern.css"),
          ("/publication","Дельрус".encode()),
          ("/brochure","Атамекен".encode()),
          ("/modern-ui.js",b"modernSidebar"),
          ("/modern.css",b"editorial-hero"),
          ("/paper.css",b"paper-banner")]:
            status,body=request(path)
            assert status==200 and needle in body,(path,status,len(body))
        status,payload=request("/api/auto-prices")
        archive=json.loads(payload)
        assert isinstance(archive["observations"],list)
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            try:
                for lang in ("ru","kk"):
                    page=browser.new_page(viewport={"width":1280,"height":920})
                    errors=[]
                    page.on("pageerror",lambda e:errors.append(str(e)))
                    page.goto(ORIGIN+"/"+lang,wait_until="domcontentloaded",timeout=30000)
                    page.locator(".editorial-hero").wait_for(timeout=30000)
                    assert page.locator(".price-card").count()==3,lang
                    assert page.locator("#nav > .nav").count()==10,lang
                    assert page.locator(".research-archive summary").count()==1,lang
                    assert page.locator("#content .hero-chart").count()==1,lang
                    # Restore five requested sections in the ordinary, visible navigation.
                    labels=page.locator("#nav > .nav").all_text_contents()
                    if lang=="ru":
                        for text in ("Динамика цен","Цены и доказательства","Рынок Астаны",
                                     "Внешние факторы","Сравнение городов"):
                            assert any(text in label for label in labels),(text,labels)
                    else:
                        for text in ("Баға динамикасы","Бағалар және дәлелдемелер",
                                     "Астана нарығы","Сыртқы факторлар","Қалаларды салыстыру"):
                            assert any(text in label for label in labels),(text,labels)
                    page.locator("#nav > .nav").nth(1).click()
                    assert page.locator("#brand-price-page").count()==1,lang
                    assert page.locator(".brand-tab").count()==4,lang
                    assert page.locator(".brand-tab[aria-selected=true]").count()==1
                    for label,marker in [
                        ("TASSAY","TASSAY"),
                        ("TURAN","TURAN"),
                        ("Ессентуки №4","Ессентуки")
                    ]:
                        page.get_by_role("tab",name=label,exact=True).click()
                        assert page.locator(".brand-tab[aria-selected=true]").count()==1
                        assert marker in page.locator("#brand-price-page").inner_text(),(lang,label)
                        assert page.locator("#brand-price-page table").count()>=1,(lang,label)
                    page.get_by_role("tab",name="Все цены" if lang=="ru" else "Барлық бағалар").click()
                    assert page.locator("#brand-price-page table").count()>=1,lang
                    page.locator("#nav > .nav").nth(2).click()
                    assert page.locator("#brand-dynamics-page").count()==1,lang
                    assert page.locator(".brand-tab").count()==4,lang
                    page.get_by_role("tab",name="Ессентуки №4").click()
                    assert page.locator("#brand-dynamics-page svg").count()>=1
                    page.locator("#nav > .nav").nth(3).click() # Astana market
                    assert page.locator("#content .panel").count()>0
                    page.locator("#nav > .nav").nth(4).click() # external factors
                    assert page.locator("#content .panel").count()>0
                    page.locator("#nav > .nav").nth(5).click() # city comparison
                    assert page.locator("#content .panel").count()>0
                    page.locator("#nav > .nav").nth(7).click() # EAEU cases
                    page.locator(".case-card").first.wait_for(timeout=5000)
                    assert page.locator(".case-card").count()==4,lang
                    assert not errors,(lang,errors)
                    page.close()
                mobile=browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
                mobile.goto(ORIGIN+"/ru",wait_until="domcontentloaded",timeout=30000)
                mobile.locator(".editorial-hero").wait_for(timeout=30000)
                assert mobile.locator(".price-card").count()==3
                mobile.locator(".menu").click()
                assert mobile.locator("#sidebar.open").count()==1
                assert mobile.locator(".menu").is_visible()
                mobile.close()
            finally:browser.close()
        print("PASS: Public HTTP routes, bilingual interactive navigation, responsive homepage, four case-law cards")
    finally:
        proc.terminate()
        try:proc.wait(timeout=6)
        except subprocess.TimeoutExpired:proc.kill()

if __name__=="__main__":main()
