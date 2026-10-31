import os, sqlite3, hashlib, hmac, secrets, time, csv, io, json
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse, Response, FileResponse
from pydantic import BaseModel, Field

app=FastAPI(docs_url=None,redoc_url=None)
P=Path(os.environ.get("DATA_DIR","/tmp/tassay-data"));P.mkdir(parents=True,exist_ok=True)
DB=P/"market.sqlite"
DAYS=["2026-04-29","2026-05-29","2026-07-13","2026-08-28","2026-10-19"]
PRICES={"Астана":{"Arbuz":[420,559,525,485,517],"SMALL":[560,499,519,519,519],"Galmart":[560,560,585,545,585]},"Алматы":{"Arbuz":[420,479,520,474,508],"SMALL":[560,449,479,479,479],"Galmart":[560,560,500,560,560]}}
def db():
 c=sqlite3.connect(DB);c.row_factory=sqlite3.Row
 return c
def init():
 c=db()
 c.executescript("""CREATE TABLE IF NOT EXISTS prices(id INTEGER PRIMARY KEY,day TEXT NOT NULL,city TEXT NOT NULL,shop TEXT NOT NULL,price INTEGER NOT NULL, status TEXT DEFAULT 'needs_review',discount TEXT DEFAULT '',channel TEXT DEFAULT 'online',source TEXT DEFAULT '',notes TEXT DEFAULT '',captured TEXT DEFAULT '', UNIQUE(day,city,shop));
 CREATE TABLE IF NOT EXISTS sources(id INTEGER PRIMARY KEY,title TEXT NOT NULL,url TEXT DEFAULT '',kind TEXT DEFAULT '',date TEXT DEFAULT '',claim TEXT DEFAULT '');
 CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY,at TEXT,action TEXT,data TEXT);
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,expires INTEGER);""")
 if not c.execute("SELECT COUNT(*) FROM prices").fetchone()[0]:
  for city,shops in PRICES.items():
   for shop,values in shops.items():
    for day,price in zip(DAYS,values):
     note="Кестеден енгізілген. Тауардың атауы мен көлемі алғашқы материалмен толық дәлелденбеген."
     if city=="Астана" and shop=="Galmart" and day=="2026-08-28":note+=" БШ2: 585 ₸ мәні 545 ₸ болып түзетілді."
     c.execute("INSERT INTO prices(day,city,shop,price,notes) VALUES(?,?,?,?,?)",(day,city,shop,price,note))
 # БШ2: түзету тек бастапқы 585 ₸ мәні тұрған жағдайда қолданылады.
 revised=c.execute("UPDATE prices SET price=545, notes='БШ2 түзетуі: 28.08.2026 Астана Galmart — 585 ₸ орнына 545 ₸ (автор растаған скриншот бойынша); өзге деректерді жеке тексеру қажет.' WHERE city='Астана' AND shop='Galmart' AND day='2026-08-28' AND price=585")
 if revised.rowcount:
  log(c,"km2_correction",{"day":"2026-08-28","city":"Астана","shop":"Galmart","old":585,"new":545,"reason":"Автордың бастапқы скриншотқа сүйенген түзетуі"})
 # 13.07.2026 Алматы Galmart: пайдаланушы растаған түзету — 560 ₸ → 500 ₸.
 # Түзету тек ескі 560 ₸ мәні сақталған жағдайда бір рет орындалады.
 galmart_july=c.execute("UPDATE prices SET price=500, status='needs_review', notes='13.07.2026 Алматы · Galmart · TASSAY: автор сұрауы бойынша 560 ₸ бағасы 500 ₸ болып түзетілді; 13 июль алматы.png скриншотында осы сома көрсетілген. Тауар атауын бастапқы дереккөзден тексеру қажет.' WHERE day='2026-07-13' AND city='Алматы' AND shop='Galmart' AND price=560")
 if galmart_july.rowcount:
  log(c,"tassay_price_correction",{"day":"2026-07-13","city":"Алматы","shop":"Galmart","old":560,"new":500,"evidence":"13 июль алматы.png"})
 new_prices={"2026-10-23":{"Arbuz":555,"SMALL":519,"Galmart":585},"2026-10-24":{"Arbuz":517,"SMALL":519,"Galmart":585},"2026-10-26":{"Arbuz":517,"SMALL":519,"Galmart":585}}
 for day,prices in new_prices.items():
  for shop,price in prices.items():
   cur=c.execute("INSERT OR IGNORE INTO prices(day,city,shop,price,status,notes) VALUES(?,?,?,?,?,?)",(day,"Астана",shop,price,"needs_review","БШ2: зерттеу авторы ұсынған баға. Дербес скриншот немесе чек әлі берілмеген."))
   if cur.rowcount:
    log(c,"km2_new_observation",{"day":day,"city":"Астана","shop":shop,"price":price,"verification":"needs_review"})
 # БШ2 толықтыруы: қыркүйектің ортақ күні және Алматының қазан айындағы бағалары.
 # Көрсетілген мәндер зерттеу авторынан алынды; скриншот/чек дербес тексеруді талап етеді.
 supplement={
  "Астана":{"2026-09-01":{"Arbuz":485,"SMALL":519,"Galmart":585}},
  "Алматы":{
   "2026-09-01":{"Arbuz":545,"SMALL":479,"Galmart":560},
   "2026-10-23":{"Arbuz":545,"SMALL":479,"Galmart":560},
   "2026-10-24":{"Arbuz":508,"SMALL":479,"Galmart":560},
   "2026-10-26":{"Arbuz":508,"SMALL":479,"Galmart":560}
  }
 }
 for city,days in supplement.items():
  for day,entries in days.items():
   for shop,price in entries.items():
    cur=c.execute("INSERT OR IGNORE INTO prices(day,city,shop,price,status,notes) VALUES(?,?,?,?,?,?)",(day,city,shop,price,"needs_review","БШ2 толықтыруы: автор берген баға; нақты скриншот/чек және акция мәртебесі қосымша тексеріледі."))
    if cur.rowcount:
     log(c,"km2_new_observation",{"day":day,"city":city,"shop":shop,"price":price,"verification":"needs_review","dataset":"2026-09-01-and-almaty-october"})

 # БШ3: жаңа кезең. Әр позиция күн/қала/дүкен бойынша бір рет енгізіледі;
 # бұрынғы админ енгізген жазбаларға тиіспейміз.
 km3_updates={
  "Астана":{
   "2026-10-25":{"Arbuz":517,"SMALL":519,"Galmart":585},
   "2026-10-29":{"Arbuz":517,"SMALL":519,"Galmart":585},
   "2026-10-30":{"Arbuz":555,"SMALL":519,"Galmart":585}},
  "Алматы":{
   "2026-10-28":{"Arbuz":508,"SMALL":479,"Galmart":560},
   "2026-10-30":{"Arbuz":545,"SMALL":479,"Galmart":560}}
 }
 for location,days in km3_updates.items():
  for day,prices in days.items():
   for shop,price in prices.items():
    cur=c.execute("INSERT OR IGNORE INTO prices(day,city,shop,price,status,notes) VALUES(?,?,?,?,?,?)",
      (day,location,shop,price,"needs_review","БШ3 · Автор жіберген кесте бойынша жаңа бақылау; дүкендегі түпнұсқа скриншот немесе чекпен растау қажет."))
    if cur.rowcount:
     log(c,"km3_author_observation",{"day":day,"city":location,"shop":shop,"price":price,"brand":"TASSAY","proof":"author table screenshot; pending store evidence"})
 if not c.execute("SELECT COUNT(*) FROM sources").fetchone()[0]:
  for t,u,k in [("ҚР Кәсіпкерлік кодексі","https://adilet.zan.kz/kaz/docs/K1500000375","заң"),("ҚР Бәсекелестікті қорғау агенттігі","https://www.gov.kz/memleket/entities/zk","ресми"),("TASSAY ресми каталогы","https://www.tassay.kz/en/catalog/gazirovannaya-vodak/","тауар")]:
   c.execute("INSERT INTO sources(title,url,kind) VALUES(?,?,?)",(t,u,k))
 c.commit();c.close()
PASSWORD=os.getenv("ADMIN_PASSWORD","")
def access(req):
 token=req.cookies.get("tassay_token","")
 if not token:return False
 c=db();row=c.execute("SELECT 1 FROM sessions WHERE hash=? AND expires>?",(hashlib.sha256(token.encode()).hexdigest(),int(time.time()))).fetchone();c.close()
 return bool(row)
def protect(req):
 if not access(req):raise HTTPException(401,"Әкімші ретінде кіріңіз")
 if req.headers.get("X-Tassay-Request")!="1":raise HTTPException(403,"Қорғаныс тақырыбы жоқ")
 origin=req.headers.get("origin","")
 if origin and origin.split("://")[-1]!=req.headers.get("host"):raise HTTPException(403,"Origin rejected")
def log(c,action,data):c.execute("INSERT INTO history(at,action,data) VALUES(?,?,?)",(datetime.utcnow().isoformat(),action,json.dumps(data,ensure_ascii=False)))
init()
class Login(BaseModel):password:str
class Price(BaseModel):
 day:str;city:str;shop:str;price:int=Field(ge=0);status:str="needs_review";discount:str="";channel:str="online";source:str="";notes:str="";captured:str=""
class Source(BaseModel):title:str;url:str="";kind:str="";date:str="";claim:str=""
@app.get("/",response_class=HTMLResponse)
def home():return Path(__file__).with_name("index.html").read_text()
@app.get("/kk",response_class=HTMLResponse)
def kazakh_home():return Path(__file__).with_name("index.html").read_text()
@app.get("/ru",response_class=HTMLResponse)
def russian_home():return Path(__file__).with_name("ru.html").read_text()
@app.get("/ru.js")
def russian_script():return FileResponse(Path(__file__).with_name("ru.js"),media_type="application/javascript",headers={"Cache-Control":"public, max-age=300"})
@app.get("/km3.js")
def km3_script():return FileResponse(Path(__file__).with_name("km3.js"),media_type="application/javascript",headers={"Cache-Control":"public, max-age=120"})
EVIDENCE_FILES = [
 "1 сент астана.png",
 "1  сентябрь алматы.png",
 "10 июль алматы.png",
 "10 июль астана.png",
 "13 июль алматы.png",
 "13 июль астана.png",
 "15 окт алматы.png",
 "15 окт астана.png",
 "19 окт алматы.jpg",
 "19 окт астана.png",
 "22 авг алматы.png",
 "23 авг астана.png",
 "23 октябрь алматы.png",
 "23 октябрь астана.png",
 "24 октябрь алматы.png",
 "24 октябрь астана.png",
 "24 сентябрь алматы.png",
 "26 октябрь алматы.png",
 "26 октябрь астана.png",
 "26 сентябрь астана.png",
 "28 авг алматы.png",
 "28 авг астана.png",
 "29 апрель алматы.png",
 "29 апрель астана.png",
 "29 июнь алматы.png",
 "29 июнь астана.png",
 "29 май алматы.png",
 "29 май астана.png",
 "30 апрель алматы.png",
 "7 сент алматы.png",
 "7 сентябрь астана.png",
 "turan-2026-04-29-astana.png",
 "turan-2026-05-29-astana.png",
 "turan-2026-09-01-astana.png",
 "turan-2026-05-29-almaty.png",
 "29 май астана.png",
 "29 июнь астана.png",
 "10 июль астана.png",
 "26 август астана.png",
 "5 сентябрь астана.png",
 "26 сентябрь астана.png",
 "13 октябрь астана.png",
 "30 октябрь астана.png"
]
@app.get("/evidence/{filename}")
def evidence(filename: str):
 if filename not in EVIDENCE_FILES:
  raise HTTPException(404, "Image not found")
 path = Path(__file__).parent / filename
 if not path.is_file():
  raise HTTPException(404, "Image missing on server")
 return FileResponse(path, media_type="image/jpeg" if filename.lower().endswith(".jpg") else "image/png", headers={"Cache-Control":"public, max-age=3600"})

@app.get("/product-image")
def product_image():
 path = Path(__file__).parent / "i (6).webp"
 if not path.is_file():
  raise HTTPException(404, "Product photo not found")
 return FileResponse(path, media_type="image/webp", headers={"Cache-Control":"public, max-age=3600"})

PRODUCT_MEDIA = {
 "mnu-logo": "Mnu_logo.jpg",
 "turan-card": "orig3.jpg",
 "tassay-card": "orig.png",
 "essentuki-card": "orig2.jpg",
}
@app.get("/media/{item}")
def product_media(item: str):
 filename = PRODUCT_MEDIA.get(item)
 if not filename:
  raise HTTPException(404, "Image not found")
 path = Path(__file__).parent / filename
 if not path.is_file():
  raise HTTPException(404, "Image missing")
 return FileResponse(path, media_type="image/png" if filename.endswith(".png") else "image/jpeg", headers={"Cache-Control":"public, max-age=3600"})

@app.get("/download/offline")
def download_offline():
 path=Path(__file__).with_name("offline.html")
 if not path.is_file():
  raise HTTPException(404, "Offline file not found")
 return FileResponse(path, media_type="text/html; charset=utf-8", filename="TASSAY_MARKET_MONITOR_OFFLINE.html", headers={"Cache-Control":"no-store"})

@app.get("/api/health")
def health():return {"ok":True,"app":"TASSAY Market Monitor"}
@app.get("/api/prices")
def prices():
 c=db();rows=[dict(r) for r in c.execute("SELECT * FROM prices ORDER BY day,city,shop")];c.close();return rows
@app.get("/api/sources")
def sources():
 c=db();r=[dict(x) for x in c.execute("SELECT * FROM sources ORDER BY id")];c.close();return r
@app.get("/api/session")
def session(req:Request):return {"admin":access(req),"configured":len(PASSWORD)>=12}
@app.post("/api/login")
def login(data:Login):
 if len(PASSWORD)<12 or not hmac.compare_digest(data.password,PASSWORD):raise HTTPException(401,"Құпиясөз қате")
 token=secrets.token_urlsafe(32);c=db();c.execute("INSERT INTO sessions(hash,expires) VALUES(?,?)",(hashlib.sha256(token.encode()).hexdigest(),int(time.time())+604800));c.commit();c.close()
 out=JSONResponse({"ok":True});out.set_cookie("tassay_token",token,httponly=True,secure=True,samesite="strict",max_age=604800);return out
@app.post("/api/logout")
def logout(req:Request):
 protect(req);c=db();c.execute("DELETE FROM sessions WHERE hash=?",(hashlib.sha256(req.cookies.get("tassay_token","").encode()).hexdigest(),));c.commit();c.close();out=JSONResponse({"ok":True});out.delete_cookie("tassay_token");return out
@app.post("/api/prices")
def add_price(data:Price,req:Request):
 protect(req)
 if data.status not in ("needs_review","verified","missing"):raise HTTPException(422,"Status")
 c=db()
 try:
  r=c.execute("INSERT INTO prices(day,city,shop,price,status,discount,channel,source,notes,captured) VALUES(?,?,?,?,?,?,?,?,?,?)",tuple(data.model_dump().values()))
  log(c,"add",data.model_dump());c.commit();return {"id":r.lastrowid}
 except sqlite3.IntegrityError:raise HTTPException(409,"Жазба бұрыннан бар")
 finally:c.close()
@app.put("/api/prices/{id}")
def edit_price(id:int,data:Price,req:Request):
 protect(req)
 c=db()
 try:
  r=c.execute("UPDATE prices SET day=?,city=?,shop=?,price=?,status=?,discount=?,channel=?,source=?,notes=?,captured=? WHERE id=?",(*data.model_dump().values(),id))
  if not r.rowcount:raise HTTPException(404,"Not found")
  log(c,"edit",{"id":id,**data.model_dump()});c.commit();return {"ok":True}
 except sqlite3.IntegrityError:raise HTTPException(409,"Duplicate")
 finally:c.close()
@app.delete("/api/prices/{id}")
def delete_price(id:int,req:Request):
 protect(req);c=db();c.execute("DELETE FROM prices WHERE id=?",(id,));log(c,"delete",{"id":id});c.commit();c.close();return {"ok":True}
@app.post("/api/sources")
def add_source(data:Source,req:Request):
 protect(req);c=db();r=c.execute("INSERT INTO sources(title,url,kind,date,claim) VALUES(?,?,?,?,?)",tuple(data.model_dump().values()));c.commit();c.close();return {"id":r.lastrowid}
@app.get("/api/history")
def history(req:Request):
 protect(req);c=db();r=[dict(x) for x in c.execute("SELECT * FROM history ORDER BY id DESC LIMIT 100")];c.close();return r
@app.get("/api/export.csv")
def export_csv():
 c=db();rows=[dict(x) for x in c.execute("SELECT * FROM prices ORDER BY day,city,shop")];c.close()
 o=io.StringIO();w=csv.DictWriter(o,fieldnames=list(rows[0].keys()) if rows else ["day","city","shop","price"]);w.writeheader();w.writerows(rows)
 return Response("\ufeff"+o.getvalue(),media_type="text/csv",headers={"Content-Disposition":"attachment; filename=tassay-prices.csv"})

# ARZAN ASTANA DAILY PRICE ENDPOINT v2
# Read GitHub's public daily archive so GitHub Actions does not require a
# Render redeploy for each new observation. The deployed snapshot is a fallback.
@app.get("/api/auto-prices")
def auto_prices():
 from urllib.request import Request as URLRequest, urlopen
 from urllib.error import URLError
 raw_url="https://raw.githubusercontent.com/akbobeksaldyr-cmd/tassay-market-monitor/main/data/daily-prices.json"
 headers={"Cache-Control":"no-store, max-age=0"}
 try:
  request=URLRequest(raw_url,headers={"User-Agent":"TassayMarketMonitor/1.0","Cache-Control":"no-cache"})
  with urlopen(request,timeout=7) as upstream:
   payload=upstream.read(4000001)
  if len(payload)>4000000:raise ValueError("Archive too large")
  data=json.loads(payload.decode("utf-8"))
  if isinstance(data,dict) and data.get("schema_version")==1 and isinstance(data.get("observations"),list) and isinstance(data.get("runs"),list):
   return JSONResponse(data,headers=headers)
 except (URLError,OSError,ValueError,UnicodeError,TimeoutError):
  pass
 path=Path(__file__).parent / "data" / "daily-prices.json"
 if path.is_file():
  try:
   data=json.loads(path.read_text(encoding="utf-8"))
   if isinstance(data,dict) and isinstance(data.get("observations"),list):
    return JSONResponse(data,headers=headers)
  except (OSError,ValueError,UnicodeError):
   pass
 return JSONResponse({"schema_version":1,"observations":[],"runs":[]},headers=headers)

# ARZAN ASTANA DAILY PRICE ENDPOINT v1
@app.get("/api/auto-prices")
def auto_prices():
 path = Path(__file__).parent / "data" / "daily-prices.json"
 if not path.is_file():
  return JSONResponse({"schema_version":1,"observations":[],"runs":[]}, headers={"Cache-Control":"no-store"})
 try:
  result = json.loads(path.read_text(encoding="utf-8"))
 except (OSError, ValueError):
  raise HTTPException(503, "Daily price archive is unavailable")
 return JSONResponse(result, headers={"Cache-Control":"no-store"})

