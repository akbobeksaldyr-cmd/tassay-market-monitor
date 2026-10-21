import os, sqlite3, hashlib, hmac, secrets, time, csv, io, json
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse, Response
from pydantic import BaseModel, Field

app=FastAPI(docs_url=None,redoc_url=None)
P=Path(os.environ.get("DATA_DIR","/tmp/tassay-data"));P.mkdir(parents=True,exist_ok=True)
DB=P/"market.sqlite"
DAYS=["2026-04-29","2026-05-29","2026-07-13","2026-08-28","2026-10-19"]
PRICES={"Астана":{"Arbuz":[420,559,525,485,517],"SMALL":[560,499,519,519,519],"Galmart":[560,560,585,585,585]},"Алматы":{"Arbuz":[420,479,520,474,508],"SMALL":[560,449,479,479,479],"Galmart":[560,560,560,560,560]}}
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
     if city=="Астана" and shop=="Galmart" and day=="2026-08-28":note+=" ЕСКЕРТУ: кестеде 585 ₸, скриншотта 545 ₸."
     c.execute("INSERT INTO prices(day,city,shop,price,notes) VALUES(?,?,?,?,?)",(day,city,shop,price,note))
 if not c.execute("SELECT COUNT(*) FROM sources").fetchone()[0]:
  for t,u,k in [("ҚР Кәсіпкерлік кодексі","https://adilet.zan.kz/kaz/docs/K1500000375","заң"),("ҚР Бәсекелестікті қорғау агенттігі","https://www.gov.kz/memleket/entities/zk","ресми"),("TASSAY ресми каталогы","https://www.tassay.kz/en/catalog/gazirovannaya-vodak/","тауар")]:
   c.execute("INSERT INTO sources(title,url,kind) VALUES(?,?,?)",(t,u,k))
 c.commit();c.close()
init()
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
class Login(BaseModel):password:str
class Price(BaseModel):
 day:str;city:str;shop:str;price:int=Field(ge=0);status:str="needs_review";discount:str="";channel:str="online";source:str="";notes:str="";captured:str=""
class Source(BaseModel):title:str;url:str="";kind:str="";date:str="";claim:str=""
@app.get("/",response_class=HTMLResponse)
def home():return Path(__file__).with_name("index.html").read_text()
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
