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
          ("/survey.js",b"downloadSurveyAggregate"),
          ("/modern.css",b"editorial-hero"),
          ("/premium.css",b"landing-hero"),
          ("/paper.css",b"paper-banner")]:
            status,body=request(path)
            assert status==200 and needle in body,(path,status,len(body))
        status,payload=request("/api/auto-prices")
        archive=json.loads(payload)
        assert isinstance(archive["observations"],list)
        _,gallery_data=request("/api/research-history-images")
        listing=json.loads(gallery_data)
        assert set(listing["stages"])=={"BSH1","BSH2","BSH3","BSH4"}
        for stage, filename in (
            ("BSH1", "первый вариант.png"),
            ("BSH2", "второй вариант.png"),
            ("BSH3", "третий вариант.png"),
            ("BSH4", "четвертый вариант.png"),
        ):
            assert any(item["name"] == filename for item in listing["stages"][stage]), (stage, listing)
            status, image = request("/history-legacy-image/" + stage)
            assert status == 200 and image.startswith(bytes.fromhex("89504e470d0a1a0a")), (stage, status, len(image))

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
                    assert page.locator("#nav > .nav").count()==8,lang
                    assert page.locator(".research-archive summary").count()==1,lang
                    assert page.locator("#content .feature-price-svg").count()==1,lang
                    # Clear, normal navigation: no city-comparison page.
                    labels=page.locator("#nav > .nav").all_text_contents()
                    if lang=="ru":
                        for label in ("Динамика","Цены","Рынок Астаны","Опрос",
                                      "Правовой анализ","Источники",
                                      "История БШ1–БШ4"):
                            assert any(label in title for title in labels),(lang,label,labels)
                        assert not any("Сравнение городов" in title for title in labels),labels
                    else:
                        for label in ("Динамика","Бағалар","Астана нарығы","Сауалнама",
                                      "Құқықтық талдау","Дереккөздер",
                                      "БШ1–БШ4 тарихы"):
                            assert any(label in title for title in labels),(lang,label,labels)
                        assert not any("Қалаларды салыстыру" in title for title in labels),labels
                    # Reference-style top navigation and rich landing page with real content.
                    assert page.locator(".landing-hero").count()==1,lang
                    assert page.locator(".landing-features .feature-card").count()==4,lang
                    assert page.locator(".landing-stats .landing-stat").count()==4,lang
                    assert page.locator(".landing-process .process-step").count()==5,lang
                    assert page.locator(".landing-conclusion").count()==3,lang
                    assert page.locator(".hero-product-card").count()==3,lang
                    assert page.locator(".landing-photo-stage img").count()==3,lang
                    assert page.locator(".hero-card-image img").count()==3,lang
                    for image in page.locator(".hero-card-image img").all():
                        image.evaluate("(img) => img.decode().catch(() => null)")
                        assert image.evaluate("(img) => img.naturalWidth")>0,lang
                        assert image.evaluate("(img) => getComputedStyle(img).mixBlendMode")=="multiply",lang
                    assert page.locator(".process-abstract .process-node").count()==3,lang
                    assert page.locator(".process-abstract .process-box").count()==3,lang
                    # Photos are retained as evidence elsewhere, not on the landing.
                    assert page.locator("#content img").count()==3,lang
                    # The preview illustration and labels must fit inside the card.
                    assert page.locator(".feature-price-legend span").count()==3,lang
                    geometry=page.locator(".feature-price").evaluate("""el => {
                      const outer=el.getBoundingClientRect();
                      const nodes=[...el.querySelectorAll('.feature-price-top, .feature-price-svg, .feature-price-legend')];
                      return {outerHeight:outer.height,overflow:nodes.some(node => {
                        const rect=node.getBoundingClientRect();
                        return rect.left<outer.left-2 || rect.right>outer.right+2
                          || rect.top<outer.top-2 || rect.bottom>outer.bottom+2;
                      })};
                    }""")
                    assert not geometry["overflow"],(lang,geometry)
                    # Main page: three brands remain visible without promotional photos.
                    q=page.locator(".research-question")
                    assert q.count()==1 and len(q.inner_text())>45,lang
                    assert page.locator(".product-overview-graphic").count()==3,lang
                    assert page.locator(".product-overview-description").count()==3,lang

                    # Price tab shows pure numeric tables without image evidence.
                    page.locator("#nav > .nav").nth(1).click()
                    assert page.locator("#brand-price-page").count()==0,lang # replaced by dedicated prices page
                    assert page.locator("main > .header").is_hidden(),lang
                    header_cells=page.locator("#study-price-table thead th").all_text_contents()
                    assert ("Доказательства" if lang=="ru" else "Дәлелдемелер") in header_cells,header_cells
                    assert not any("Статус" in h or "мәртебесі" in h for h in header_cells),header_cells
                    keys=page.locator("#study-price-table tbody tr[data-price-key]").evaluate_all(
                        "(rows) => rows.map(row => row.dataset.priceKey)")
                    assert len(keys)>20 and len(keys)==len(set(keys)),(lang,len(keys),len(set(keys)))
                    assert page.locator("#study-price-table .study-proof-link").count()>0,lang
                    assert page.locator("#study-price-table .study-proof-missing").count()>0,lang
                    assert page.locator("#study-price-table").get_attribute("id")=="study-price-table"
                    assert page.locator(".brand-tab").count()==4,lang
                    assert page.locator(".brand-tab[aria-selected=true]").count()==1
                    for label in ("TASSAY","TURAN","Ессентуки №4"):
                        page.get_by_role("tab",name=label,exact=True).click()
                        assert page.locator(".brand-tab[aria-selected=true]").inner_text()==label
                        assert page.locator("#content table").count()>=1,(lang,label)
                        rows=page.locator("#study-price-table tbody tr[data-price-key]").evaluate_all(
                            "(rs) => rs.map(r => r.dataset.priceKey)")
                        assert rows and len(rows)==len(set(rows)),(lang,label)
                        assert page.locator("#content img").count()==0,(lang,label)
                    page.get_by_role("tab",name="Все цены" if lang=="ru" else "Барлық бағалар").click()
                    assert page.locator("#content table tbody tr").count()>20,lang
                    page.locator("#study-price-city").select_option("Алматы")
                    keys_almaty=page.locator("#study-price-table tbody tr[data-price-key]").evaluate_all(
                        "(rs) => rs.map(r => r.dataset.priceKey)")
                    assert keys_almaty and len(keys_almaty)==len(set(keys_almaty)),lang
                    assert all("|Алматы|" in k for k in keys_almaty),lang
                    page.locator("#study-price-city").select_option("Астана")

                    # Dynamics must be preserved.
                    page.locator("#nav > .nav").nth(2).click()
                    assert page.locator("#brand-dynamics-page").count()==1,lang
                    assert page.locator("main > .header").is_hidden(),lang
                    assert page.locator("#content .overview-heading h2").first.is_visible(),lang
                    assert page.locator(".brand-tab").count()==4,lang
                    page.get_by_role("tab",name="Ессентуки №4").click()
                    assert page.locator("#brand-dynamics-page svg").count()>=1,lang

                    # Astana market: live calculator, formula and input validation.
                    page.locator("#nav > .nav").nth(3).click()
                    assert page.locator("main > .header").is_hidden(),lang
                    assert "Q" in page.locator(".market-formula").inner_text()
                    page.locator("#market-brand-sales").fill("200")
                    page.locator("#market-total-sales").fill("1000")
                    page.get_by_role("button",name="Рассчитать долю" if lang=="ru" else "Үлесті есептеу").click()
                    assert "20,00%" in page.locator("#market-calc-result").inner_text(),lang
                    page.locator("#market-brand-sales").fill("1200")
                    page.get_by_role("button",name="Рассчитать долю" if lang=="ru" else "Үлесті есептеу").click()
                    assert "20,00%" not in page.locator("#market-calc-result").inner_text(),lang

                    # Google Forms: 13 filtered buyers, 20 total, six substitution charts.
                    page.locator("#nav > .nav").nth(4).click()
                    assert page.locator(".survey-metric").count()==3,lang
                    assert page.locator(".survey-metric").first.locator("strong").inner_text()=="13",lang
                    assert page.locator(".survey-pair").count()==6,lang
                    assert page.locator(".survey-price-item").count()==3,lang
                    page.locator(".survey-filter").last.click()
                    assert page.locator(".survey-metric").first.locator("strong").inner_text()=="20",lang
                    with page.expect_download() as dl:
                        page.get_by_role("button",name="Скачать агрегированные данные CSV" if lang=="ru" else "Жиынтық деректерді CSV жүктеу").click()
                    assert dl.value.suggested_filename=="tassay_survey_aggregated_2026-11-13.csv"
                    # External factors remain available in the More menu.
                    page.locator(".research-archive summary").click()
                    page.locator('.research-archive button[onclick="nav(6)"]').click()
                    assert page.locator("#content .panel").count()>0,lang

                    # Dedicated evidence gallery: 3 brands, all screenshot thumbnails.
                    page.locator('.research-archive button[onclick="nav(7)"]').click()
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
                    page.locator("#nav > .nav").nth(7).click()
                    assert page.locator(".legal-source-grid .case-card").count()>=4,lang
                    assert page.locator("#content img").count()==0,lang
                    assert "169" in page.locator("#content").inner_text(),lang
                    assert "76" in page.locator("#content").inner_text(),lang

                    # EAEU cases still present.
                    page.locator(".research-archive summary").click()
                    page.locator('.research-archive button[onclick="nav(18)"]').click()
                    page.locator(".case-card").first.wait_for(timeout=5000)
                    assert page.locator(".case-card").count()==4,lang
                    # Four historic snapshots in one new public research section.
                    page.locator("#nav > .nav").nth(6).click()
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
                    fourth=page.locator('#history-gallery .history-image-card').filter(has_text='четвертый вариант.png')
                    fourth.wait_for(timeout=12000)
                    assert fourth.count()==1,lang
                    assert '/history-screenshots/BSH4/' in fourth.get_attribute('href'),lang
                    assert not errors,(lang,errors)
                    page.close()
                mobile=browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
                mobile.goto(ORIGIN+"/ru",wait_until="domcontentloaded",timeout=30000)
                mobile.locator(".editorial-hero").wait_for(timeout=30000)
                assert mobile.locator(".price-card").count()==3
                assert mobile.locator(".hero-product-card").count()==3
                assert mobile.locator(".process-abstract .process-node").count()==3
                assert mobile.locator("#content img").count()==3
                assert mobile.locator(".hero-card-image img").count()==3
                mobile_chart=mobile.locator(".feature-price").evaluate("""el => {
                    const outer=el.getBoundingClientRect();
                    return [...el.querySelectorAll('.feature-price-top, .feature-price-svg, .feature-price-legend')]
                       .every(item => {
                           const r=item.getBoundingClientRect();
                           return r.left>=outer.left-3 && r.right<=outer.right+3
                              && r.top>=outer.top-3 && r.bottom<=outer.bottom+3;
                       });
                }""")
                assert mobile_chart,"Mini price chart overflowing on mobile"
                mobile.locator(".menu").click()
                assert mobile.locator("#sidebar.open").count()==1
                assert mobile.locator(".menu").is_visible()
                mobile.close()
            finally:browser.close()
        print("PASS: hero products, unique price table, dated evidence links, single page headings, market calculator, survey and bilingual navigation")
    finally:
        proc.terminate()
        try:proc.wait(timeout=6)
        except subprocess.TimeoutExpired:proc.kill()

if __name__=="__main__":main()
