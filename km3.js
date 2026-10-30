/* KM3 extension: shared components and price data for both /kk and /ru.
   C and TURAN user-supplied historical observations are tagged as unverified.
   All dates below refer to 2026. */
const KM3_RU=document.documentElement.lang==='ru';
const km3t=(kk,ru)=>KM3_RU?ru:kk;
const KM3_EAEU={
 registration:"https://export.fppsk26.ru/exporters/obshhestvo-s-ogranichennoj-otvetstvennostju-holding-akva/",
 product:"https://www.holdingaqua.ru/essentuki",
 treaty:"https://eec.eaeunion.org/upload/medialibrary/222/bifmr5rkj91orf6wc3yg26olge6h0wej/Dogovor.pdf",
 criteria:"https://adilet.zan.kz/rus/docs/H12B0000029"
};
const essentukiRows=[
 ["2026-05-29",931,749,1075],
 ["2026-06-29",1035,665,1000],
 ["2026-07-10",965,749,1075],
 ["2026-08-26",905,779,1075],
 ["2026-09-05",1019,779,1075],
 ["2026-09-26",1019,779,1075],
 ["2026-10-13",1019,539,1075],
 ["2026-10-30",975,735,1075]
].flatMap(line=>shops.map((shop,i)=>({
 brand:"ESSENTUKI4",city:"Астана",day:line[0],shop,price:line[i+1],
 status:"needs_review",proof:"Ессентуки №4 · автордың кестесі; бастапқы дүкен скриншоты алынбаған"
})));

const essentukiEvidence=[
 ["2026-05-29","29 май астана.png",{Arbuz:931,SMALL:749,Galmart:1075}],
 ["2026-06-29","29 июнь астана.png",{Arbuz:1035,SMALL:665,Galmart:1000}],
 ["2026-07-10","10 июль астана.png",{Arbuz:965,SMALL:749,Galmart:1075}],
 ["2026-08-26","26 август астана.png",{Arbuz:905,SMALL:779,Galmart:1075}],
 ["2026-09-05","5 сентябрь астана.png",{Arbuz:1019,SMALL:779,Galmart:1075}],
 ["2026-09-26","26 сентябрь астана.png",{Arbuz:1019,SMALL:779,Galmart:1075}],
 ["2026-10-13","13 октябрь астана.png",{Arbuz:1019,SMALL:539,Galmart:1075}],
 ["2026-10-30","30 октябрь астана.png",{Arbuz:975,SMALL:735,Galmart:1030}]
].map(([day,file,shown])=>({day,file,shown,url:'/evidence/'+encodeURIComponent(file)}));
function essentukiEvidenceFor(day){
 const e=essentukiEvidence.find(x=>x.day===day);if(!e)return null;
 const mismatches=shops.filter(shop=>{
  const row=essentukiRows.find(x=>x.day===day&&x.shop===shop);
  return row&&Number(e.shown[shop])!==Number(row.price);
 });
 return {...e,mismatches,warning:mismatches.length>0};
}
function openEssentukiEvidence(day){
 const e=essentukiEvidenceFor(day);
 if(!e){toast(km3t('Скриншот табылмады','Скриншот не найден'));return;}
 const diffs=e.mismatches.length?
  km3t('Кесте мен сурет айырмасы: ','Расхождение таблицы и изображения: ')+e.mismatches.map(s=>{
   const row=essentukiRows.find(x=>x.day===day&&x.shop===s);
   return s+': '+row.price+' ₸ / '+e.shown[s]+' ₸';
  }).join('; ')+'. ':'';
 showEvidenceModal({
  label:'Ессентуки №4 · '+fmt(day),url:e.url,
  note:diffs+km3t('GitHub-тағы бағалар графигінің қиындысы; бренд пен 1 л газдалған түрі кадрдан расталмайды.','Фрагмент графика цен из GitHub. Бренд и соответствие газированной воде 1 л по нему не подтверждаются.')
 });
}

const km3NewTuran=[
 {day:"2026-10-29",shop:"Arbuz",price:435},
 {day:"2026-10-29",shop:"SMALL",price:369},
 {day:"2026-10-29",shop:"Galmart",price:510},
 {day:"2026-10-30",shop:"Arbuz",price:435},
 {day:"2026-10-30",shop:"SMALL",price:369},
 {day:"2026-10-30",shop:"Galmart",price:510}
];
for(const r of km3NewTuran){
 if(!turanRows.some(x=>x.day===r.day&&x.shop===r.shop&&x.city==='Астана'))
  turanRows.push({...r,city:"Астана",brand:"TURAN",status:"needs_review",proof:"Ессентуки №4 · автор жіберген кесте; дүкеннің түпнұсқа скриншоты қажет"});
}
const km3C=(text,label)=>'<a href="'+esc(KM3_EAEU[label])+'" target="_blank" rel="noopener noreferrer">'+text+' ↗</a>';
const km3Tag=(v)=>'<span class="km3-tag">'+v+'</span>';
const km3Title=(kicker,title,sub)=>'<div class="km2-lead"><div class="kicker">'+kicker+'</div><h2>'+title+'</h2><p>'+sub+'</p></div>';
const km3Panel=(title,body)=>'<section class="panel"><h3>'+title+'</h3>'+body+'</section>';
const km3Link=(id,label)=>'<button class="btn outline" onclick="nav('+id+')">'+label+'</button>';
const km3Get=(brand,day,shop)=>{
 const set=brand==='A'?data.filter(x=>x.city==='Астана'):brand==='B'?turanRows:essentukiRows;
 return set.find(x=>x.day===day&&x.shop===shop&&x.city==='Астана');
};
function km3ProductIntro(){
 return '<div class="km3-first"><div class="km3-first-title"><div class="kicker">'+km3t('А–В–С · САЛЫСТЫРМАЛЫ ЗЕРТТЕУ','A–B–C · СРАВНИТЕЛЬНОЕ ИССЛЕДОВАНИЕ')+'</div><h2>'+km3t('Үш тауар, бір қала, ортақ құқықтық сұрақ','Три товара, один город, общий правовой вопрос')+'</h2><p>'+km3t('Астана қаласында сатылатын 1 литрлік газдалған су өнімдері. Нақты бәсекелестік, релевантты нарық және құқықтық қорытынды қосымша тексеріледі.','Газированная вода объёмом 1 л в магазинах Астаны. Статус конкурентов, границы релевантного рынка и правовая оценка требуют дополнительной проверки.')+'</p></div>'+
 '<div class="km3-first-grid">'+[
  ['TASSAY','/media/tassay-card',km3t('A · Қазақстан','A · Казахстан'),km3t('«ЮНИКС» ЖШС ұсынатын Қазақстанның табиғи ауыз суы. Су көзі — Арыс–Бадам жерасты алабы. 1 л газдалған түрі зерттеледі.','Казахстанская природная питьевая вода бренда ТОО «ЮНИКС». Источник — Арыс-Бадамское подземное месторождение. Исследуется газированная вода 1 л.'),'https://www.tassay.kz/about/',10],
  ['TURAN','/media/turan-card',km3t('B · Қазақстан','B · Казахстан'),km3t('«Көкшетау минералды сулары» АҚ-ның су бренді. Зерттеу позициясы — газдалған 1 л өнім, Астана дүкендеріндегі бағалар.','Вода бренда АО «Кокшетауские минеральные воды». Исследуется газированная вода 1 л по ценам магазинов Астаны.'),'https://halal-kz.kz/ru/predpriyatiya/akcionernoe-obshchestvo-kokshetauskie-mineralnye-zavody',11],
  ['Ессентуки №4','/media/essentuki-card',km3t('C · Ресей, ЕАЭО','C · Россия, ЕАЭС'),km3t('«Холдинг Аква» ЖШҚ: Ресейде өндірілетін, 7–10 г/л минералданған табиғи газдалған емдік-асханалық су, 1 л ПЭТ.','ООО «Холдинг Аква»: российская природная газированная лечебно-столовая вода с минерализацией 7–10 г/л, 1 л ПЭТ.'),KM3_EAEU.product,20]
 ].map(([name,img,origin,description,href,page])=>
  '<article class="km3-first-card"><div class="km3-first-picture"><img src="'+img+'" alt="'+esc(name)+' 1 л" loading="lazy"></div><div class="km3-first-info">'+km3Tag(origin)+'<h3>'+esc(name)+'</h3><p>'+description+'</p><p class="km3-card-links"><a href="'+href+'" target="_blank" rel="noopener">'+km3t('Өнім туралы дереккөз','Источник о товаре')+' ↗</a> &nbsp;·&nbsp; <a href="#" onclick="nav('+page+');return false">'+km3t('Талдауды ашу','Открыть анализ')+' ↗</a></p></div></article>'
 ).join('')+'</div></div>';
}
productIntro=km3ProductIntro;
const km3Pill=(text)=>'<span class="pill">'+text+'</span>';
function km3Product(){
 return km3Title("Ессентуки №4 · C / COMPANY C",km3t('Ессентуки №4 · Газдалған су, 1 л','Ессентуки №4 · Газированная вода 1 л'),
 km3t('С компаниясы Ресейде тіркелген, бірақ тауардың Астанада сатылуы трансшекаралық нарықты өздігінен дәлелдемейді.','Компания C зарегистрирована в России, но продажи товара в Астане сами по себе не доказывают существование трансграничного рынка.'))+
 '<section class="panel km3-product-hero"><img src="/media/essentuki-card" alt="Ессентуки №4, 1 л">'+
 '<div><h3>'+km3t('Компания С: «Холдинг Аква» ЖШҚ','Компания C: ООО «Холдинг Аква»')+'</h3><p>'+km3t('Ресей Федерациясы, Ставрополь өлкесі, Ессентуки қаласы. ИНН 2626047111, ОГРН 1172651025788. Компания минералды суды өндірумен, құюмен және таратумен байланысты.','Российская Федерация, Ставропольский край, город Ессентуки. ИНН 2626047111, ОГРН 1172651025788. Предприятие занимается добычей, розливом и дистрибуцией минеральной воды.')+'</p>'+
 '<p>'+km3t('Өнім: табиғи газдалған емдік-асханалық хлоридті-гидрокарбонатты натрийлі минералды су, 1 л ПЭТ. Жалпы минералдануы 7–10 г/л.','Продукт: природная газированная лечебно-столовая хлоридно-гидрокарбонатная натриевая минеральная вода, ПЭТ 1 л. Минерализация 7–10 г/л.')+'</p>'+
 '<p>'+km3C(km3t('Ресейлік тіркеу дерегі','Регистрация компании'),'registration')+' · '+km3C(km3t('Ресми тауар беті','Официальная карточка товара'),'product')+'</p></div></section>'+
 km3Panel(km3t('Бәсекелестік мәртебесі','Статус конкуренции'),
 '<p>'+km3t('Тауар Астанада Arbuz, SMALL және Galmart дүкендері бойынша автордың кестесінде салыстырылады. Бірақ Ессентуки №4 емдік-асханалық әрі едәуір минералданған су болғандықтан, оны TASSAY немесе TURAN-ның толық алмастырушысы деп автоматты түрде тануға болмайды. Бірдей сатып алушыға қолжетімділігі және нақты ауыстырылуы бөлек дәлелденеді.','Автор приводит цены Ессентуки №4 в Arbuz, SMALL и Galmart Астаны. Однако лечебно-столовый статус и высокая минерализация отличают товар от TASSAY и TURAN. Его доступность одним покупателям и взаимозаменяемость необходимо подтвердить отдельно; прямым конкурентом он автоматически не становится.')+'</p>');
}
function km3PriceTable(){
 const dates=[...new Set(essentukiRows.map(x=>x.day))].sort(),get=(d,s)=>km3Get('C',d,s);
 const lines=dates.map((day,i)=>{
  const evidence=essentukiEvidenceFor(day);
  const badge=evidence?.warning?km3Tag(km3t('Баға айырмасы · тексеру','Расхождение цен · проверить')):km3Tag(km3t('Скриншот бар · тауарды тексеру','Есть скриншот · проверить товар'));
  return '<tr><td>'+fmt(day)+'</td>'+shops.map(s=>'<td>'+val(get(day,s).price)+'</td>').join('')+
   '<td class="change-percent-cell">'+priceChangeCell(i?dates[i-1]:null,day,get)+'</td>'+
   '<td><button class="evidence-button" onclick="openEssentukiEvidence(\''+day+'\')">📷 '+km3t('Қарау','Посмотреть')+'</button><div style="margin-top:8px">'+badge+'</div></td></tr>';
 }).join('');
 const gallery='<div class="km3-evidence-gallery">'+essentukiEvidence.map(e=>
  '<button class="km3-evidence-tile" onclick="openEssentukiEvidence(\''+e.day+'\')"><img loading="lazy" src="'+e.url+'" alt="Ессентуки №4 · '+e.day+'"><strong>'+fmt(e.day)+'</strong>'+
  (essentukiEvidenceFor(e.day).warning?'<span>'+km3t('Бағалар сәйкес емес','Цены не совпадают')+'</span>':'')+'</button>'
 ).join('')+'</div>';
 return km3Title('ESSENTUKI №4 · PRICE MONITOR',km3t('Ессентуки №4 · Бағалар және скриншоттар','Ессентуки №4 · Цены и скриншоты'),
 km3t('Астана · Arbuz / SMALL / Galmart · 8 бақылау күні. Әр күнге GitHub-та скриншот табылды; өнімнің атауы кадрда көрінбейді.','Астана · Arbuz / SMALL / Galmart · 8 дат. В GitHub найдены скриншоты для каждой даты, но название товара на фрагментах не видно.'))+
 km3Panel(km3t('24 баға бақылауы · 8 күн','24 наблюдения · 8 дат'),
 '<div class="km2-table"><table><thead><tr><th>'+km3t('Күні','Дата')+'</th>'+shops.map(s=>'<th>'+s+'</th>').join('')+'<th>'+km3t('Өзгеріс, %','Изменение, %')+'</th><th>'+km3t('Дәлелдеме','Доказательство')+'</th></tr></thead><tbody>'+lines+'</tbody></table></div>'+
 '<p class="km2-muted">'+km3t('Суреттер — бағалар графигінің үзінділері. 30 қазанда SMALL бағасы 735 ₸ болып түзетілді және суретпен сәйкес келеді. Galmart суретте 1030 ₸, кестеде 1075 ₸: айырманы қосымша растау қажет.','Изображения — фрагменты графика цен. Цена SMALL за 30 октября исправлена на 735 ₸ и совпадает со скриншотом. По Galmart остаётся расхождение: 1030 ₸ на скриншоте и 1075 ₸ в таблице.')+'</p>')+
 km3Panel(km3t('Ессентуки №4 · Скриншоттар мұрағаты','Ессентуки №4 · Галерея скриншотов'),gallery)+
 km3Panel(km3t('Ессентуки №4 бағасының графигі','График цен Ессентуки №4'),
 '<div class="row"><button class="btn outline" onclick="document.getElementById(\'km3CChart\').innerHTML=km3CChart(\'abs\')">₸</button><button class="btn outline" onclick="document.getElementById(\'km3CChart\').innerHTML=km3CChart(\'pct\')">%</button></div><div id="km3CChart">'+km3CChart('abs')+'</div>');
}
function km3CChart(mode='abs'){
 const ds=[...new Set(essentukiRows.map(x=>x.day))].sort();return km3Plot(ds,shops.map((s,i)=>({name:s,color:colors[i],points:ds.map(d=>{const v=km3Get('C',d,s);return v&&{day:d,price:v.price}}).filter(Boolean)})),mode);
}
function km3Plot(dates,series,mode='abs'){
 if(!dates.length)return '';
 const all=series.flatMap(s=>s.points.map(p=>mode==='pct'?(p.price/s.points[0].price-1)*100:p.price));
 if(!all.length)return '';
 const lo=Math.min(...all),hi=Math.max(...all),pad=Math.max(6,(hi-lo)*.14),min=mode==='abs'?Math.max(0,lo-pad):lo-pad,max=hi+pad;
 const w=940,h=325,left=75,right=22,top=28,bottom=57,xx=d=>left+dates.indexOf(d)*(w-left-right)/Math.max(1,dates.length-1),yy=v=>top+(max-v)/(max-min)*(h-top-bottom);
 const lines=series.map(s=>{
   const pts=s.points.map(p=>({day:p.day,value:mode==='pct'?(p.price/s.points[0].price-1)*100:p.price}));
   return '<polyline points="'+pts.map(p=>xx(p.day)+','+yy(p.value)).join(' ')+'" fill="none" stroke="'+s.color+'" stroke-width="3.4" stroke-linejoin="round" />'+pts.map(p=>'<circle cx="'+xx(p.day)+'" cy="'+yy(p.value)+'" r="5" fill="'+s.color+'"><title>'+esc(s.name)+' · '+(p.sourceDay||p.day)+': '+(mode==='pct'?p.value.toFixed(1)+'%':p.value+' ₸')+'</title></circle>').join('');
 }).join('');
 return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Essentuki A B C price comparison">'+[0,1,2,3,4].map(i=>{const v=min+(max-min)*i/4,y=yy(v);return '<line x1="'+left+'" x2="'+(w-right)+'" y1="'+y+'" y2="'+y+'" stroke="#567182" stroke-dasharray="4 5" opacity=".45"/><text x="6" y="'+(y+4)+'" fill="#abbeca" font-size="13">'+v.toFixed(0)+(mode==='pct'?'%':' ₸')+'</text>'}).join('')+
 dates.map(d=>'<text x="'+xx(d)+'" y="'+(h-16)+'" text-anchor="middle" fill="#b4ccda" font-size="12">'+d.slice(5)+'</text>').join('')+lines+'</svg>'+
 '<div class="legend">'+series.map(s=>'<span><span class="sw" style="background:'+s.color+'"></span>'+esc(s.name)+'</span>').join('')+'</div>';
}
function km3SharedDays(){
 const a=new Set(data.filter(x=>x.city==='Астана').map(x=>x.day));
 const b=new Set(turanRows.filter(x=>x.city==='Астана').map(x=>x.day));
 return [...new Set(essentukiRows.map(x=>x.day))].filter(d=>a.has(d)&&b.has(d)).sort();
}
// Fixed, documented time windows. Approximate comparisons are not same-day quotes.
// October 29 uses C's October 30 observation, repeated in the exact October 30 row.
const KM3_PERIOD_CANDIDATES=[
 {axis:'2026-05-29',label:'29.05',dates:{A:'2026-05-29',B:'2026-05-29',C:'2026-05-29'}},
 {axis:'2026-07-10',label:'10–13.07',dates:{A:'2026-07-13',B:'2026-07-10',C:'2026-07-10'}},
 {axis:'2026-08-26',label:'23–28.08',dates:{A:'2026-08-28',B:'2026-08-23',C:'2026-08-26'}},
 {axis:'2026-09-05',label:'01–05.09',dates:{A:'2026-09-01',B:'2026-09-01',C:'2026-09-05'}},
 {axis:'2026-10-29',label:'29–30.10',dates:{A:'2026-10-29',B:'2026-10-29',C:'2026-10-30'},repeatedC:true},
 {axis:'2026-10-30',label:'30.10',dates:{A:'2026-10-30',B:'2026-10-30',C:'2026-10-30'}}
];
function km3ComparablePeriods(){
 return KM3_PERIOD_CANDIDATES.map(p=>{
  const dates=Object.values(p.dates).sort();
  const gap=Math.round((Date.parse(dates[2]+'T00:00:00Z')-Date.parse(dates[0]+'T00:00:00Z'))/86400000);
  return {...p,gap,kind:gap===0?'exact':'near'};
 }).filter(p=>p.gap<=5&&shops.every(shop=>['A','B','C'].every(b=>km3Get(b,p.dates[b],shop))));
}
let km3SelectedShop='Arbuz';
function km3Compare(){
 const periods=km3ComparablePeriods(),exact=periods.filter(p=>p.kind==='exact'),near=periods.filter(p=>p.kind==='near');
 const badge=p=>p.kind==='exact'?
 '<span class="comparison-exact">'+km3t('Бір күн · дәл','Один день · точно')+'</span>':
 '<span class="comparison-approx">'+km3t('Жуық кезең · '+p.gap+' күн','Близкий период · '+p.gap+' дн.')+'</span>';
 const row=p=>shops.map(s=>{
  const a=km3Get('A',p.dates.A,s),b=km3Get('B',p.dates.B,s),c=km3Get('C',p.dates.C,s);
  const warning=p.repeatedC?'<small style="display:block;color:#dcab81">'+km3t('C: 30.10 бағасы қайталанды','C: повтор цены 30.10')+'</small>':'';
  return '<tr class="'+(p.gap?'near':'')+'"><td><b>'+esc(p.label)+'</b><small style="display:block">'+badge(p)+warning+'</small></td>'+
  '<td>'+fmt(p.dates.A)+'</td><td>'+fmt(p.dates.B)+'</td><td>'+fmt(p.dates.C)+'</td><td>'+s+'</td>'+
  '<td>'+val(a.price)+'</td><td>'+val(b.price)+'</td><td>'+val(c.price)+'</td><td><b>'+val(c.price-a.price)+'</b></td></tr>';
 }).join('');
 const series=['A','B','C'].map((brand,i)=>({
  name:['TASSAY','TURAN','Ессентуки №4'][i],
  color:['#51d8dc','#ffd073','#ac9cfa'][i],
  points:periods.map(p=>{
   const r=km3Get(brand,p.dates[brand],km3SelectedShop);
   return r?{day:p.axis,price:r.price,sourceDay:p.dates[brand],approx:p.gap>0}:null;
  }).filter(Boolean)
 }));
 const overview='<div class="km2-stats"><div class="km2-stat"><small>'+km3t('Дәл ортақ күндер','Точные общие даты')+'</small><strong>'+exact.length+'</strong><small>'+exact.map(p=>p.label).join(' · ')+'</small></div>'+
 '<div class="km2-stat"><small>'+km3t('Жуық кезеңдер (≤5 күн)','Близкие периоды (до 5 дней)')+'</small><strong>'+near.length+'</strong><small>'+near.map(p=>p.label).join(' · ')+'</small></div>'+
 '<div class="km2-stat"><small>'+km3t('Барлық салыстырмалы кезең','Всего сопоставимых периодов')+'</small><strong>'+periods.length+'</strong><small>'+km3t('3 дүкен · '+(periods.length*3)+' үштік салыстыру','3 магазина · '+(periods.length*3)+' тройных сравнений')+'</small></div></div>';
 const tableHeader='<div class="km2-table"><table><thead><tr><th>'+km3t('Кезең','Период')+'</th>'+
 '<th>'+km3t('TASSAY күні','Дата TASSAY')+'</th><th>'+km3t('TURAN күні','Дата TURAN')+'</th><th>'+km3t('C күні','Дата C')+'</th><th>'+km3t('Дүкен','Магазин')+'</th>'+
 '<th>TASSAY</th><th>TURAN</th><th>Ессентуки №4</th><th>C − A</th></tr></thead><tbody>';
 const exactTable=tableHeader+exact.map(row).join('')+'</tbody></table></div>';
 const nearTable=tableHeader+near.map(row).join('')+'</tbody></table></div>';
 return km3Title('Ессентуки №4 · A / B / C',km3t('Үш тауардың бағаларын салыстыру','Сравнение цен трёх товаров'),
 km3t('Екі дәл ортақ күнге қосымша 5 күнге дейінгі жақын бақылаулар енгізілді. Әр брендтің нақты күні көрсетіледі; жақын күн бағалары бір күндік баға ретінде қабылданбайды.','К двум точным общим датам добавлены наблюдения за близкие периоды с разницей до пяти дней. Для каждой марки указана её настоящая дата: приближённые цены не выдаются за одновременные.'))+
 overview+
 km3Panel(km3t('Дәл ортақ күндер','Точные общие даты'),exactTable)+
 km3Panel(km3t('Жуық кезеңдер · әр тауардың күні бөлек','Близкие периоды · отдельная дата каждого товара'),
 '<p class="km2-muted">'+km3t('Күндер аралығы: шілде ±3 күн, тамыз 5 күн, қыркүйек 4 күн, 29–30 қазан 1 күн. 29 қазан кезеңі мен 30 қазан дәл кезеңінде Ессентуки №4-тің 30 қазан бағасы бір дерек ретінде екі рет көрінеді — бұл екі тәуелсіз C бақылауы емес.','Разброс дат: июль 3 дня, август 5 дней, сентябрь 4 дня, 29–30 октября 1 день. Цена Ессентуки №4 за 30 октября повторяется в двух октябрьских сравнениях: это одно и то же наблюдение C, а не два независимых замера.')+'</p>'+nearTable)+
 km3Panel(km3t('Үш тауардың бағалық графигі','График цен трёх товаров'),
 '<div class="row"><label>'+km3t('Дүкен:','Магазин:')+' <select onchange="km3SelectedShop=this.value;render()">'+shops.map(s=>'<option '+(km3SelectedShop===s?'selected':'')+'>'+s+'</option>').join('')+'</select></label></div>'+
 km3Plot(periods.map(p=>p.axis),series)+
 '<p class="km2-muted">'+km3t('Жақын кезеңдердің нүктелері әр брендтің әртүрлі күнінде бақыланған; графикте салыстыру кезеңінің осі ғана ортақ. Нүктенің үстіне апарсаңыз, нақты күн шығады.','Точки близких периодов могут относиться к разным датам; общей является лишь ось сравнительного периода. При наведении на точку показана фактическая дата.')+'</p>')+
 km3Panel(km3t('Ессентуки №4 талабына сәйкестік пен шектеулер','Соответствие Ессентуки №4 и ограничения'),
 '<p>'+km3t('Тапсырма кемінде үш ортақ күнді <b>немесе бірдей кезеңді</b> талап етеді. Бұл кестеде '+exact.length+' дәл күн және '+near.length+' жақын кезең бар; кезеңдік салыстырудың ±5 күндік ережесі ашық көрсетілген. Дегенмен күннің айырмашылығы, акциялар және сатып алушыға нақты қолжетімділік қосымша тексерілуі керек.','Задание допускает три общие даты <b>или сопоставимые периоды</b>. Здесь '+exact.length+' точные даты и '+near.length+' близких периода; правило максимального разброса в 5 дней раскрыто явно. Различия дат, промоакции и реальная доступность товара требуют отдельной проверки.')+'</p>'+
 '<p>'+km3t('Астанадағы барлық бақыланған бағалар KZT түрінде және 1 литрге берілген; Ресейдегі RUB бағасы мен оның конвертациясы бұл қатарға қосылмаған. Ессентуки №4 емдік-асханалық су болғандықтан, өзара алмастырылуы дәлелденбеген.','Все цены относятся к розничной продаже в Астане, приведены в KZT за 1 л. Российские RUB-цены и их конвертация не смешиваются с ними. Взаимозаменяемость лечебно-столовой Ессентуки №4 пока не доказана.')+'</p>');
}
function km3ChangePct(a,b){return a&&b&&a.price>0?((b.price-a.price)/a.price*100):null}
function km3UpdatedAB(){
 const aOld='2026-10-26',aNew='2026-10-30',bOld='2026-10-15',bNew='2026-10-30';
 const rows=shops.map(shop=>{
  const a0=km3Get('A',aOld,shop),a1=km3Get('A',aNew,shop),b0=km3Get('B',bOld,shop),b1=km3Get('B',bNew,shop);
  const p=x=>x===null?'—':(x>=0?'+':'')+x.toFixed(1).replace('.',',')+'%';
  return '<tr><td>'+shop+'</td><td>'+val(a0?.price??0)+'</td><td>'+val(a1?.price??0)+'</td><td>'+p(km3ChangePct(a0,a1))+'</td><td>'+val(b0?.price??0)+'</td><td>'+val(b1?.price??0)+'</td><td>'+p(km3ChangePct(b0,b1))+'</td></tr>';
 }).join('');
 return km3Title('ESSENTUKI №4 · A–B UPDATE',km3t('TASSAY және TURAN · Жаңа кезең','TASSAY и TURAN · Новый период'),
 km3t('КМ2-дегі соңғы күндер әртүрлі: TASSAY — 26.10, TURAN — 15.10. Жаңарту күнін екеуі үшін 30.10 алдық.','Исходные последние даты КМ2 различаются: TASSAY — 26.10, TURAN — 15.10. Для нового периода обе марки сопоставляются на 30.10.'))+
 km3Panel(km3t('Алдыңғы → жаңа кезең (Астана)','Старый → новый период (Астана)'),
 '<div class="km2-table"><table><thead><tr><th>'+km3t('Дүкен','Магазин')+'</th><th>A 26.10</th><th>A 30.10</th><th>A %</th><th>B 15.10</th><th>B 30.10</th><th>B %</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
 '<p class="km2-muted">'+km3t('TASSAY бойынша 25, 29, 30 қазан (Астана), 28, 30 қазан (Алматы) енгізілді; TURAN бойынша 29 және 30 қазан үш дүкеннің бағалары енгізілді. Барлығы автордың кестесіне негізделген.','По TASSAY добавлены 25, 29, 30 октября (Астана) и 28, 30 октября (Алматы); по TURAN — 29 и 30 октября все три магазина. Источник — таблицы автора.')+'</p>')+
 km3Panel(km3t('29 қазан · TURAN Arbuz: автор нақтылаған баға','29 октября · уточнённая цена TURAN Arbuz'),
 '<p><b>TURAN · Arbuz · 29.10.2026: 435 ₸.</b> '+km3t('Автор бастапқы кестедегі «4345» қате терілгенін нақтылады. 435 ₸ ретінде енгізілді. Түпнұсқа дүкен скриншотымен тексеру әлі қажет.','Автор уточнила, что «4345» в таблице было опечаткой. Внесено 435 ₸, необходимо подтверждение скриншотом исходного магазина.')+'</p><p><b>31.10.2026:</b> '+km3t('«Ертең жіберемін» деген жазба нақты баға емес, есепке алынбады.','запись «завтра отправлю» не является ценой и не включена.')+'</p>');
}
function km3LawLog(){
 const updated=km3NewTuran.length+15+essentukiRows.length;
 return km3Title('ESSENTUKI №4 · EAEU / LEGAL ANALYSIS',km3t('ЕАЭО бәсекелестік құқығы және жаңарту журналы','Право ЕАЭС и журнал обновлений'),
 km3t('Үшінші бақылау жұмысының алдын ала құқықтық позициясы. Бөлшек бағалар мен шетелдік компанияның болуы трансшекаралық нарықты дәлелдемейді.','Предварительная правовая позиция по Ессентуки №4. Наличие иностранной компании и розничные цены сами по себе не доказывают трансграничный рынок.'))+
 km3Panel(km3t('76-бап және 19-қосымша','Статья 76 и Приложение №19'),
 '<p>'+km3t('ЕАЭО туралы шарттың 76-бабы үстем жағдайды теріс пайдалану, бәсекелестікке қарсы келісімдер және келісілген әрекеттерге қатысты ортақ ережелерді белгілейді. №19 қосымша — осы ережелердің трансшекаралық нарықтарда қолданылуын және ЕЭК бақылау рәсімін нақтылайды.','Статья 76 Договора о ЕАЭС устанавливает общие правила о злоупотреблении доминированием, антиконкурентных соглашениях и согласованных действиях. Приложение №19 регулирует их применение и контроль ЕЭК на трансграничных рынках.')+'</p><p>'+km3C(km3t('ЕАЭО шартының ресми мәтіні','Официальный текст Договора о ЕАЭС'),'treaty')+'</p>')+
 km3Panel(km3t('Трансшекаралық өлшем және орган құзыреті','Трансграничный критерий и компетенция органов'),
 '<p>'+km3t('Жоғары Еуразиялық экономикалық кеңестің 19.12.2012 жылғы №29 шешіміне сәйкес, трансшекаралық нарықтың географиялық шекаралары кемінде екі ЕАЭО мүшесі аумағын қамтуы тиіс. Бұған қоса бұзушылық түріне байланысты арнайы өлшемдер қолданылады. Егер зерттелген нарық тек Астана аумағымен шектелсе, құқықтық талдау Қазақстанның ұлттық құзыретіне жатады; егер трансшекаралық шекаралар мен өзге талаптар дәлелденсе, ЕЭК құзыреті бөлек тексеріледі.','Согласно Решению Высшего Евразийского экономического совета №29 от 19.12.2012, географические границы трансграничного рынка должны охватывать территории как минимум двух членов ЕАЭС. Дополнительно действуют критерии по конкретному виду нарушения. Если релевантный рынок ограничен Астаной, применяется национальная компетенция Казахстана; компетенция ЕЭК требует доказательства трансграничных границ и иных условий.')+'</p><p>'+km3C(km3t('№29 шешімі, ресми мәтін','Решение №29, официальный текст'),'criteria')+'</p>')+
 km3Panel(km3t('БШ2 күдігі қалай өзгерді?','Изменилось ли подозрение из КМ2?'),
 '<p><b>'+km3t('Әзірге өзгерген жоқ.','На данном этапе не изменилось.')+'</b> '+km3t('Жаңа бағалар нарықтағы сауда ұсыныстарының айырмасын көрсетеді. Бірақ сатылым көлемі, нарықтың толық шекарасы, өндірушілердің келісім құжаттары мен байланысы жоқ. Шетелдік Ессентуки №4 тауарын қосу монополияны немесе заң бұзуды дәлелдемейді.','Новые цены расширяют картину розничных предложений. Но по-прежнему отсутствуют подтверждённые объёмы продаж, полные границы рынка, документы о соглашениях и контактах участников. Добавление российской Ессентуки №4 не доказывает монополии или нарушения.')+'</p>')+
 km3Panel(km3t('Өзгерістер журналы','Журнал изменений'),
 '<div class="km2-table"><table><thead><tr><th>'+km3t('Дерек','Данные')+'</th><th>'+km3t('Күн/кезең','Дата/период')+'</th><th>'+km3t('Саны','Количество')+'</th><th>'+km3t('Мәртебе','Статус')+'</th></tr></thead><tbody>'+
 [['TASSAY','2026-10-25, 28, 29, 30',15],['TURAN','2026-10-29, 30',6],['Ессентуки №4','2026-05-29 — 2026-10-30',24]].map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+km3t('Автор кестесі; дүкеннен растау керек','Таблица автора; проверить в магазине')+'</td></tr>').join('')+
 '</tbody></table></div><p class="km2-muted">'+km3t('Ескі бақылаулар өшірілмеген. TURAN Arbuz 29 қазан автор растаған 435 ₸ болып енгізілді; 31 қазан бос жолдар толықтырылған жоқ.','Исторические записи сохранены. Цена TURAN Arbuz за 29 октября уточнена автором как 435 ₸ и добавлена. Пустые значения 31 октября не добавлены.')+'</p>')+
 km3Panel(km3t('ЖИ туралы мәлімдеме','Декларация использования ИИ'),
 '<p>'+km3t('ЖИ платформаның бағдарламалық құрылымына, салыстырмалы есептерге, мәтіндерді аударуға және құқықтық дереккөздерді жүйелеуге көмектесті. Бағалардың бастапқы көзі — автордың ұсынған кестелері; тәуелсіз дүкен бақылауы және толық құқықтық дәлелдеме жасалған жоқ. Қателігі күмәнді мәндер автоматты түрде рас деп қабылданбайды.','ИИ помогал создавать интерфейс, сравнительные расчёты, перевод и систематизацию правовых источников. Первичный источник новых цен — таблицы автора; независимой проверки магазинов и полноты юридических доказательств не проводилось. Сомнительные значения автоматически не принимаются за достоверные.')+'</p>');
}

function km3Share(){
 const ru=KM3_RU;
 const src1="https://www.rbc.ru/business/13/07/2024/65df00e19a79473d0ac3a10e";
 const src2="https://www.rbc.ru/business/03/06/2024/665d798e9a794707d347b618";
 const src3="https://kavkaz.rbc.ru/kavkaz/freenews/679343729a79470ae8aa5d19";
 const src4="https://www.holdingaqua.ru/essentuki";
 const src5="https://kavkaz.rbc.ru/kavkaz/freenews/6780f3e49a7947a77f77bb80";
 const source=(url,label)=>'<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+' ↗</a>';
 return '<div class="km2-lead"><div class="kicker">'+km3t('ЕССЕНТУКИ №4 · НАРЫҚТЫҚ ҮЛЕС','ЕССЕНТУКИ №4 · РЫНОЧНАЯ ДОЛЯ')+'</div>'+
  '<h2>'+km3t('Ессентуки №4 · Нарық үлесі','Ессентуки №4 · Рыночная доля')+'</h2><p>'+
   km3t('2026 жылы Астанадағы газдалған Ессентуки №4 (1 л) өнімінің нақты нарық үлесі ашық деректермен расталмаған. Ресейдегі басқа жылдар мен санаттар бойынша жария көрсеткіштер төменде бөлек беріледі.','Подтверждённых открытых данных о доле газированной Ессентуки №4 (1 л) на рынке Астаны за 2026 год нет. Ниже отдельно приведены опубликованные исторические показатели по России.')+'</p></div>'+
 '<section class="panel"><div class="share-fact"><div class="share-big-number">3,6%</div><div><h3>'+km3t('2023 жыл · Ресейдегі «Ессентуки» бренді','2023 год · Бренд «Ессентуки» в России')+'</h3><p>'+
  km3t('РБК-ның 13.07.2024 жылғы сұхбатында 2023 жылы «Ессентуки» бренді Ресейдегі бөтелкедегі су сатылымдарының ақшалай көлемінің <b>3,6%-ын</b> құрағаны айтылған.','В интервью РБК от 13.07.2024 указано, что за 2023 год бренд «Ессентуки» обеспечил <b>3,6% продаж</b> бутилированной воды в России в денежном выражении.')+
  '</p></div></div><p class="share-limitation"><b>'+km3t('Шектеу:','Ограничение:')+'</b> '+
  km3t('Көрсеткіш Ресей бойынша 2023 жылғы бүкіл «Ессентуки» брендіне қатысты; №4 және №17 жеке бөлінбеген. Бұл Астана, 2026 жылғы 1 л газдалған №4 суының үлесі емес.','Показатель относится ко всему бренду «Ессентуки» в России за 2023 год: №4 и №17 не выделены отдельно. Это не доля газированной Ессентуки №4 объёмом 1 л в Астане за 2026 год.')+
  '</p><p class="km2-source">'+source(src1,km3t('РБК · 13.07.2024 · сұхбат','РБК · 13.07.2024 · интервью'))+'</p></section>'+
 '<section class="panel"><div class="share-fact"><div class="share-big-number">5,5%</div><div><h3>'+
  km3t('2023 жыл · «Холдинг Аква» компаниясының барлық брендтері','2023 год · Все бренды «Холдинг Аква»')+
  '</h3><p>'+km3t('РБК-да келтірілген дерек бойынша 2023 жылы «Холдинг Аква» компаниясының барлық брендтері Ресейдегі бөтелкедегі су нарығының ақшалай сатылымының <b>5,5%-ын</b> құраған.','По опубликованным данным РБК в 2023 году бренды «Холдинг Аква» вместе занимали <b>5,5%</b> российского рынка бутилированной воды по продажам в денежном выражении.')+'</p></div></div>'+
 '<p class="share-limitation"><b>'+km3t('Шектеу:','Ограничение:')+'</b> '+
 km3t('Бұл №4 өнімі ғана емес: компания «Ессентуки №17», «Нарзан» және өзге су брендтерін де шығарады. 3,6% және 5,5% мәндерін қосуға болмайды.','Это не доля исключительно №4: компания также выпускает «Ессентуки №17», «Нарзан» и другие бренды. Показатели 3,6% и 5,5% не суммируются.')+'</p>'+
 '<p class="km2-source">'+source(src1,km3t('РБК · 2023 жылғы нарық','РБК · данные за 2023 год'))+' · '+source(src2,km3t('РБК · компания портфелі','РБК · портфель брендов'))+'</p></section>'+
 '<section class="panel"><div class="share-fact"><div class="share-big-number share-money">270 '+km3t('млн','млн')+'</div><div><h3>'+
  km3t('2024 жыл · Компанияның бүкіл бөтелке өндірісі','2024 год · Общий выпуск бутылок группы')+'</h3><p>'+
  km3t('РБК Кавказдың 24.01.2025 жылғы материалында «Холдинг Аква» тобы 2024 жылы <b>270 млн бөтелке</b> минералды су өндіргені жазылған.','РБК Кавказ 24.01.2025 сообщил о выпуске группой «Холдинг Аква» <b>270 млн бутылок</b> минеральной воды за 2024 год.')+
  '</p></div></div><p class="share-limitation"><b>'+km3t('Шектеу:','Ограничение:')+'</b> '+
  km3t('Бұл барлық өнімдердің бөтелке саны, литр емес, №4 жеке сатылымы емес және нарықтың жалпы көлемі де емес. Осы көлемнен нарық үлесін есептеу дұрыс емес.','Это количество бутылок всей группы, не литры, не отдельные продажи №4 и не общий объём рынка. По этому числу нельзя вычислять долю бренда.')+'</p>'+
  '<p class="km2-source">'+source(src3,km3t('РБК Кавказ · 24.01.2025','РБК Кавказ · 24.01.2025'))+'</p></section>'+
 '<section class="panel"><h3>'+km3t('Қазақстанда болуы және нарықтық қатысуы','Присутствие в Казахстане и участие в рынке')+'</h3><p>'+
  km3t('Компанияның 2024 жылғы экспорттық мәліметінде Қазақстанға жеткізілім өсімі аталғанымен, бүкіл Ессентуки №4 1 л суының Астана бойынша сатылым үлесі жарияланбаған. Өнім Астана дүкендерінде ұсынылғаны оның TASSAY мен TURAN-мен толық өзара алмастырылуын дәлелдемейді.','По данным об экспорте за 2024 год производитель указывал рост поставок в Казахстан, но не публиковал долю Ессентуки №4 1 л в продажах Астаны. Наличие товара в магазинах Астаны ещё не доказывает полную взаимозаменяемость с TASSAY и TURAN.')+
  '</p><p class="km2-source">'+source(src5,km3t('РБК Кавказ · 2024 жылғы экспорт','РБК Кавказ · экспорт в 2024 году'))+' · '+source(src4,km3t('Өндірушінің ресми сипаттамасы','Официальное описание производителя'))+'</p></section>'+
 '<section class="panel"><div class="share-fact"><div class="share-big-number">—%</div><div><h3>'+
  km3t('Астана, 2026: нақты үлес есептелмейді','Астана, 2026: точная доля не рассчитывается')+'</h3><p>'+
  km3t('Астана қаласында 2026 жылғы газдалған 1 л Ессентуки №4 суының сату көлемі және релевантты нарықтағы барлық сатушылардың жалпы сату көлемі белгісіз. Дүкендегі баға нарық үлесі емес.','Нет проверенных объёмов продаж газированной Ессентуки №4 1 л в Астане за 2026 год и совокупных продаж участников релевантного рынка. Розничная цена не равна рыночной доле.')+
  '</p></div></div><p class="share-limitation">'+
  km3t('Үлесті есептеу үшін бірдей география, уақыт, тауар шекарасы және өлшем бірлігі бойынша сатылым көлемі қажет.','Для расчёта доли нужны продажи с одинаковой географией, периодом, товарными границами и единицами измерения.')+
 '</p></section>'+
 '<details class="panel brand-share-calc"><summary>'+km3t('Салыстырмалы сатылым деректері болғанда есептеу','Рассчитать долю при наличии сопоставимых продаж')+'</summary>'+
 '<p class="km2-muted">'+km3t('Нарықтық үлес = бренд сатылымы / бүкіл нарық сатылымы × 100%. Енгізілген деректер бастапқы дереккөзбен расталуы тиіс.','Рыночная доля = продажи бренда / продажи всего рынка × 100%. Введённые данные требуют проверки по первоисточнику.')+'</p>'+
 '<div class="row"><label>'+km3t('Брендтің сатылымы','Продажи бренда')+'<input id="essShareNum" type="number" min="0" placeholder="'+km3t('Литр','Литры')+'"></label>'+
 '<label>'+km3t('Нарықтағы жалпы сатылым','Совокупные продажи рынка')+'<input id="essShareDen" type="number" min="0" placeholder="'+km3t('Литр','Литры')+'"></label>'+
 '<label>'+km3t('Кезең','Период')+'<input id="essSharePeriod" placeholder="2026"></label>'+
 '<label>'+km3t('Дереккөз','Источник')+'<input id="essShareSource" placeholder="'+km3t('Сату есебі / URL','Отчёт о продажах / URL')+'"></label></div>'+
 '<button class="btn" onclick="km3EvaluateShare()">'+km3t('Есептеу','Рассчитать')+'</button><div class="brand-share-output" id="essShareOut"></div></details>';
}
function km3EvaluateShare(){
 const v=id=>document.getElementById(id)?.value??'';
 const a=v('essShareNum'),b=v('essShareDen'),period=v('essSharePeriod').trim(),source=v('essShareSource').trim(),target=document.getElementById('essShareOut');
 const aa=Number(a),bb=Number(b);
 if(!target)return;
 if(a===''||b===''||!Number.isFinite(aa)||!Number.isFinite(bb)||aa<0||bb<=0||aa>bb||!period||!source){
  target.textContent=km3t('Салыстырмалы сатылым, кезең және дереккөзді енгізіңіз.','Введите сопоставимые продажи, период и источник.');return;
 }
 target.textContent=km3t('Тек енгізілген мәндер бойынша есеп: ','Расчёт только по введённым данным: ')+(100*aa/bb).toFixed(2).replace('.',',')+'%. '+
  km3t('Тауар нарығының шекарасы және бастапқы деректер бөлек тексерілуі тиіс.','Границы рынка и исходные данные необходимо проверить отдельно.');
}

sections.push(
 km3t('Ессентуки №4 · Өнім және өндіруші','Ессентуки №4 · Товар и производитель'),
 km3t('Ессентуки №4 · Бағалар және скриншоттар','Ессентуки №4 · Цены и скриншоты'),
 km3t('Ессентуки №4 · Үш тауарды салыстыру','Ессентуки №4 · Сравнение трёх товаров'),
 km3t('Ессентуки №4 · TASSAY × TURAN жаңартуы','Ессентуки №4 · Обновление TASSAY × TURAN'),
 km3t('Ессентуки №4 · ЕАЭО құқығы','Ессентуки №4 · Право ЕАЭС')
);
pages.push(km3Product,km3PriceTable,km3Compare,km3UpdatedAB,km3LawLog);
sections.push(km3t('Ессентуки №4 · Нарық үлесі','Ессентуки №4 · Рыночная доля'));
pages.push(km3Share);
