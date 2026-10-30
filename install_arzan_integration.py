"""Idempotent compatibility patch for an existing TASSAY Market Monitor checkout.

Keeps original research pages, screenshots, and historical observations intact.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = '/* ARZAN ASTANA DAILY PRICE INTEGRATION v1 */'
APP_MARKER = '# ARZAN ASTANA DAILY PRICE ENDPOINT v1'

APP_CODE = '''\n# ARZAN ASTANA DAILY PRICE ENDPOINT v1\n@app.get("/api/auto-prices")\ndef auto_prices():\n path = Path(__file__).parent / "data" / "daily-prices.json"\n if not path.is_file():\n  return JSONResponse({"schema_version":1,"observations":[],"runs":[]}, headers={"Cache-Control":"no-store"})\n try:\n  result = json.loads(path.read_text(encoding="utf-8"))\n except (OSError, ValueError):\n  raise HTTPException(503, "Daily price archive is unavailable")\n return JSONResponse(result, headers={"Cache-Control":"no-store"})\n'''

JS_CODE = r'''
/* ARZAN ASTANA DAILY PRICE INTEGRATION v1 */
const km3AutoArchive = {observations:[],runs:[]};
function km3InsertAutoPrices(){
 const brands={TASSAY:'A', TURAN:'B', ESSENTUKI4:'C'};
 for(const r of km3AutoArchive.observations){
  if(!r || r.city!=='Астана' || !brands[r.brand] ||
    !shops.includes(r.shop) || r.volume_ml!==1000 || r.currency!=='KZT' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(r.day) ||
    !Number.isInteger(r.price) || r.price<=0 || r.price>5000 ||
    r.status!=='auto_unverified' ||
    typeof r.source_url!=='string' || !r.source_url.startsWith('https://arzan.kz/ru/astana/'))continue;
  const target=r.brand==='TASSAY'?data:r.brand==='TURAN'?turanRows:essentukiRows;
  if(!target.some(x=>x.city==='Астана'&&x.day===r.day&&x.shop===r.shop)){
   target.push({day:r.day,city:'Астана',shop:r.shop,price:r.price,brand:r.brand,
    status:'auto_unverified',source:r.source_url,
    notes:km3t('Arzan.kz автоматты тексеру; дүкен чегімен расталмады',
               'Автоматическая проверка Arzan.kz; нет подтверждения чеком'),
    proof:km3t('Arzan.kz сілтемесі; скриншот кейін қосылады',
               'Ссылка на Arzan.kz; скриншот добавляется позже')});
  }
 }
 const days=[...new Set(km3AutoArchive.observations.map(x=>x.day))].sort();
 for(const day of days){
  if(KM3_PERIOD_CANDIDATES.some(p=>p.axis===day))continue;
  const all=shops.every(shop=>['A','B','C'].every(brand=>km3Get(brand,day,shop)));
  if(all){
   KM3_PERIOD_CANDIDATES.push({axis:day,label:day.slice(8)+'.'+day.slice(5,7),
      dates:{A:day,B:day,C:day}});
  }
 }
 KM3_PERIOD_CANDIDATES.sort((a,b)=>a.axis.localeCompare(b.axis));
}
function km3AutoPanel(){
 const rows=km3AutoArchive.observations.filter(r=>r.city==='Астана' &&
   ['TASSAY','TURAN','ESSENTUKI4'].includes(r.brand));
 const last=km3AutoArchive.runs.at(-1);
 const content='<p>'+km3t('Автоматты Arzan.kz бақылаулары: дүкен скриншотымен расталмаған.',
   'Автоматические наблюдения Arzan.kz: ожидают проверки скриншотом магазина.')+'</p>'+
  (last?'<p>'+km3t('Соңғы тексеру','Последняя проверка')+': '+esc(last.at)+'</p>':'')+
  '<div class="km2-table"><table><thead><tr><th>'+km3t('Күн','Дата')+'</th><th>'+km3t('Бренд','Бренд')+'</th><th>'+km3t('Дүкен','Магазин')+'</th><th>'+km3t('Баға','Цена')+'</th><th>'+km3t('Дереккөз','Источник')+'</th><th>'+km3t('Мәртебе','Статус')+'</th></tr></thead><tbody>'+
  rows.slice(-45).reverse().map(r=>'<tr><td>'+esc(r.day)+'</td><td>'+esc(r.brand)+'</td><td>'+esc(r.shop)+'</td><td>'+r.price+' ₸</td><td><a href="'+esc(r.source_url)+'" target="_blank" rel="noopener noreferrer">Arzan.kz ↗</a></td><td>'+km3t('Растауды күтеді','Ожидает проверки')+'</td></tr>').join('')+
  '</tbody></table></div>'+
  (!rows.length?'<p>'+km3t('Автоматты расталмаған бағалар әзірше жоқ.','Пока нет автоматически считанных цен.')+'</p>':'');
 return km3Panel(km3t('Астана: күнделікті баға жинау','Астана: ежедневная загрузка цен'),content);
}
const km3OriginalCompare=pages[22];
pages[22]=function(){return km3OriginalCompare()+km3AutoPanel()};
const km3OriginalRender=render;
render=function(){km3InsertAutoPrices();return km3OriginalRender()};
(async function km3LoadAutoPrices(){
 try{
  const res=await fetch('/api/auto-prices',{cache:'no-store'});
  if(!res.ok)return;
  const obj=await res.json();
  if(!obj || !Array.isArray(obj.observations))return;
  km3AutoArchive.observations=obj.observations;
  km3AutoArchive.runs=Array.isArray(obj.runs)?obj.runs:[];
  if(document.getElementById('content'))render();
 }catch(err){console.warn('Daily Arzan archive unavailable',err)}
})();
'''


def update_files() -> None:
    app = ROOT / 'app.py'
    km3 = ROOT / 'km3.js'
    for needed in (app, km3, ROOT / 'index.html', ROOT / 'ru.html'):
        if not needed.exists():
            raise SystemExit(f'Expected project file is missing: {needed}')
    text = app.read_text(encoding='utf-8')
    if APP_MARKER not in text:
        app.write_text(text.rstrip() + '\n' + APP_CODE + '\n', encoding='utf-8')
        print('Added /api/auto-prices endpoint')

    text = km3.read_text(encoding='utf-8')
    if MARKER not in text:
        km3.write_text(text.rstrip() + '\n' + JS_CODE + '\n', encoding='utf-8')
        print('Added automated price display and refresh')

    for name in ('index.html', 'ru.html'):
        path = ROOT / name
        html = path.read_text(encoding='utf-8')
        original = '<script src="/km3.js"></script>'
        versioned = '<script src="/km3.js?v=arzan-auto-1"></script>'
        if original in html:
            html = html.replace(original, versioned)
            path.write_text(html, encoding='utf-8')
            print(f'Versioned KM3 script in {name}')
        elif versioned not in html:
            # Existing project uses a custom script version. Do not break it silently.
            print(f'NOTICE: check km3.js script tag in {name}; not modified')


if __name__ == '__main__':
    update_files()
