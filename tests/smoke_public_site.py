"""Local deployment smoke test: public pages, scripts, and key user flows."""
import json
from io import BytesIO
from PIL import Image
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
          ("/research-sections.js",b"calculateAstanaMarketShare"),
          ("/research-history.js",b"historyPage"),
          ("/modern.css",b"editorial-hero"),
          ("/paper.css",b"paper-banner")]:
            status,body=request(path)
            assert status==200 and needle in body,(path,status,len(body))
        status,payload=request("/api/auto-prices")
        archive=json.loads(payload)
        assert isinstance(archive["observations"],list)
        _,gallery_data=request("/api/research-history-images")
        listing=json.loads(gallery_data)
        assert set(listing["stages"])=={"BSH1","BSH2","BSH3","BSH4"}
        assert listing["origin"] in ("github","deployed_snapshot")
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
                    assert page.locator("#nav > .nav").count()==11,lang
                    assert page.locator(".research-archive summary").count()==1,lang
                    assert page.locator("#content .hero-chart").count()==1,lang
                    # Clear, normal navigation: no city-comparison page.
                    labels=page.locator("#nav > .nav").all_text_contents()
                    if lang=="ru":
                        for label in ("Динамика цен","Цены","Рынок Астаны",
                                      "Внешние факторы","Доказательства","Правовые источники",
                                      "История исследования"):
                            assert any(label in title for title in labels),(lang,label,labels)
                        assert not any("Сравнение городов" in title for title in labels),labels
                    else:
                        for label in ("Баға динамикасы","Бағалар","Астана нарығы",
                                      "Сыртқы факторлар","Дәлелдемелер","Құқықтық дереккөздер",
                                      "Зерттеу тарихы"):
                            assert any(label in title for title in labels),(lang,label,labels)
                        assert not any("Қалаларды салыстыру" in title for title in labels),labels
                    # Main page: research question, 3 actual product images and descriptions.
                    q=page.locator(".research-question")
                    assert q.count()==1 and len(q.inner_text())>45,lang
                    assert page.locator(".product-overview-image img").count()==3,lang
                    assert page.locator(".product-overview-description").count()==3,lang

                    # Price tab shows pure numeric tables without image evidence.
                    page.locator("#nav > .nav").nth(1).click()
                    assert page.locator("#brand-price-page").count()==0,lang # replaced by dedicated prices page
                    assert page.locator(".brand-tab").count()==4,lang
                    assert page.locator(".brand-tab[aria-selected=true]").count()==1
                    for label in ("TASSAY","TURAN","Ессентуки №4"):
                        page.get_by_role("tab",name=label,exact=True).click()
                        assert page.locator(".brand-tab[aria-selected=true]").inner_text()==label
                        assert page.locator("#content table").count()>=1,(lang,label)
                        assert page.locator("#content img").count()==0,(lang,label)
                    page.get_by_role("tab",name="Все цены" if lang=="ru" else "Барлық бағалар").click()
                    assert page.locator("#content table tbody tr").count()>20,lang

                    # Dynamics must be preserved.
                    page.locator("#nav > .nav").nth(2).click()
                    assert page.locator("#brand-dynamics-page").count()==1,lang
                    assert page.locator(".brand-tab").count()==4,lang
                    page.get_by_role("tab",name="Ессентуки №4").click()
                    assert page.locator("#brand-dynamics-page svg").count()>=1,lang

                    # Astana market: live calculator, formula and input validation.
                    page.locator("#nav > .nav").nth(3).click()
                    assert "Q" in page.locator(".market-formula").inner_text()
                    page.locator("#market-brand-sales").fill("200")
                    page.locator("#market-total-sales").fill("1000")
                    page.get_by_role("button",name="Рассчитать долю" if lang=="ru" else "Үлесті есептеу").click()
                    assert "20,00%" in page.locator("#market-calc-result").inner_text(),lang
                    page.locator("#market-brand-sales").fill("1200")
                    page.get_by_role("button",name="Рассчитать долю" if lang=="ru" else "Үлесті есептеу").click()
                    assert "20,00%" not in page.locator("#market-calc-result").inner_text(),lang

                    # External factors remain a normal top-level page.
                    page.locator("#nav > .nav").nth(4).click()
                    assert page.locator("#content .panel").count()>0,lang

                    # Dedicated evidence gallery: 3 brands, all screenshot thumbnails.
                    page.locator("#nav > .nav").nth(5).click()
                    assert page.locator(".research-proof").count()>10,lang
                    assert page.locator("#content img").count()>10,lang
                    first_image=page.locator(".research-proof-image img").first
                    first_image.scroll_into_view_if_needed()
                    first_image.evaluate("(img) => img.decode().catch(() => null)")
                    img_state=first_image.evaluate("(img) => ({url:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight,complete:img.complete})")
                    print("EVIDENCE_IMAGE_DIAGNOSTIC",lang,img_state,flush=True)
                    assert img_state["width"]>0 and img_state["height"]>0, (lang,img_state)
                    # Confirm the *rendered card*, not only the file, contains visible pixels.
                    card=page.locator(".research-proof-image").first
                    screenshot=Image.open(BytesIO(card.screenshot())).convert("RGB")
                    distinct=len(screenshot.quantize(colors=64).getcolors(maxcolors=100000) or [])
                    print("EVIDENCE_VISIBLE_CARD",lang,{"colors":distinct,"size":screenshot.size},flush=True)
                    assert distinct>=10,(lang,"Evidence rendered as an empty/flat placeholder",distinct)

                    samples=first_image.evaluate("""img => {
                      const canvas=document.createElement('canvas');
                      canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
                      const context=canvas.getContext('2d',{willReadFrequently:true});
                      context.drawImage(img,0,0);
                      const d=context.getImageData(0,0,canvas.width,canvas.height).data;
                      const colors=new Set();let transparent=0;
                      for(let i=0;i<d.length;i+=4){
                        colors.add([d[i],d[i+1],d[i+2],d[i+3]].join(','));
                        if(d[i+3]===0)transparent++;
                      }
                      return {unique:colors.size,transparent_pct:100*transparent/(d.length/4),
                              first:[...d.slice(0,20)]};
                    }""")
                    print("EVIDENCE_PIXELS",lang,samples,flush=True)

                    for brand in ("TASSAY","TURAN","Ессентуки №4"):
                        page.get_by_role("tab",name=brand,exact=True).click()
                        assert page.locator(".research-proof").count()>=6,(lang,brand)
                    page.locator(".research-proof").first.click()
                    assert page.locator("#evidenceDialog").is_visible(),lang
                    page.keyboard.press("Escape")

                    # Normative sources, not screenshots.
                    page.locator("#nav > .nav").nth(10).click()
                    assert page.locator(".legal-source-grid .case-card").count()>=4,lang
                    assert page.locator("#content img").count()==0,lang
                    assert "169" in page.locator("#content").inner_text(),lang
                    assert "76" in page.locator("#content").inner_text(),lang

                    # EAEU cases still present.
                    page.locator("#nav > .nav").nth(7).click()
                    page.locator(".case-card").first.wait_for(timeout=5000)
                    assert page.locator(".case-card").count()==4,lang
                    # Four historic snapshots in one new public research section.
                    page.locator("#nav > .nav").nth(9).click()
                    assert page.locator(".history-milestone").count()==4,lang
                    assert page.locator(".history-stage-detail").count()==1,lang
                    assert page.locator('.history-stage-detail a[href*="/tree/d5c5ce2b"]').count()==1,lang
                    for index,shortsha in [(1,"064de5a915"),(2,"70d4d862e9")]:
                        page.locator(".history-milestone").nth(index).click()
                        assert page.locator(".history-milestone.selected").count()==1
                        assert page.locator('.history-stage-detail a[href*="/tree/'+shortsha+'"]').count()==1,(lang,index)
                        assert page.locator("#history-gallery").count()==1
                        assert page.locator(".history-gallery-head a").get_attribute("href").endswith(
                            "history-screenshots/BSH"+str(index+1))
                    page.locator(".history-milestone").nth(3).click()
                    assert "14.11.2026" in page.locator(".history-stage-meta").inner_text()
                    assert page.locator('.history-stage-detail a[href$="/tree/main"]').count()==1
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
        print("PASS: product photos, research question, market calculator, price tabs, full evidence gallery, legal sources, bilingual navigation")
    finally:
        proc.terminate()
        try:proc.wait(timeout=6)
        except subprocess.TimeoutExpired:proc.kill()

if __name__=="__main__":main()
