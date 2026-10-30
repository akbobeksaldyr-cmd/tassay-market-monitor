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
 ["2026-10-30",975,539,1075]
].flatMap(line=>shops.map((shop,i)=>({
 brand:"ESSENTUKI4",city:"Астана",day:line[0],shop,price:line[i+1],
 status:"needs_review",proof:"КМ3 · автордың кестесі; бастапқы дүкен скриншоты алынбаған"
})));
const km3NewTuran=[
 {day:"2026-10-29",shop:"SMALL",price:369},
 {day:"2026-10-29",shop:"Galmart",price:510},
 {day:"2026-10-30",shop:"Arbuz",price:435},
 {day:"2026-10-30",shop:"SMALL",price:369},
 {day:"2026-10-30",shop:"Galmart",price:510}
];
for(const r of km3NewTuran){
 if(!turanRows.some(x=>x.day===r.day&&x.shop===r.shop&&x.city==='Астана'))
  turanRows.push({...r,city:"Астана",brand:"TURAN",status:"needs_review",proof:"КМ3 · автор жіберген кесте; дүкеннің түпнұсқа скриншоты қажет"});
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
 return km3Title("КМ3 · C / COMPANY C",km3t('Ессентуки №4 · Газдалған су, 1 л','Ессентуки №4 · Газированная вода 1 л'),
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
 const lines=dates.map((day,i)=>'<tr><td>'+fmt(day)+'</td>'+shops.map(s=>'<td>'+val(get(day,s).price)+'</td>').join('')+
 '<td class="change-percent-cell">'+priceChangeCell(i?dates[i-1]:null,day,get)+'</td><td>'+km3Tag(km3t('Автор кестесі · растау қажет','Таблица автора · нужна проверка'))+'</td></tr>').join('');
 return km3Title('КМ3 · C PRICE MONITOR',km3t('Ессентуки №4 · Бағалар мен динамика','Ессентуки №4 · Цены и динамика'),
 km3t('Астана · Arbuz / SMALL / Galmart · күндер өсу ретімен. Дүкеннің жеке түпнұсқа скриншоттары әзірге берілмеген.','Астана · Arbuz / SMALL / Galmart · даты по возрастанию. Первичные скриншоты самих магазинов пока не предоставлены.'))+
 km3Panel(km3t('24 баға бақылауы · 8 күн','24 наблюдения · 8 дат'),
 '<div class="km2-table"><table><thead><tr><th>'+km3t('Күні','Дата')+'</th>'+shops.map(s=>'<th>'+s+'</th>').join('')+'<th>'+km3t('Өзгеріс, %','Изменение, %')+'</th><th>'+km3t('Дәлел мәртебесі','Статус подтверждения')+'</th></tr></thead><tbody>'+lines+'</tbody></table></div>'+
 '<p class="km2-muted">'+km3t('Пайыз алдыңғы тіркелген күнге қатысты есептеледі. Бұл скриншоттар — автордың жиынтық кестесі, бастапқы дүкен веб-сайтының тікелей суреті емес.','Процент рассчитан относительно предыдущей наблюдаемой даты. Присланные изображения показывают сводную таблицу автора, а не непосредственно карточки товаров в магазине.')+'</p>')+
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
   return '<polyline points="'+pts.map(p=>xx(p.day)+','+yy(p.value)).join(' ')+'" fill="none" stroke="'+s.color+'" stroke-width="3.4" stroke-linejoin="round" />'+pts.map(p=>'<circle cx="'+xx(p.day)+'" cy="'+yy(p.value)+'" r="5" fill="'+s.color+'"><title>'+esc(s.name)+' · '+p.day+': '+(mode==='pct'?p.value.toFixed(1)+'%':p.value+' ₸')+'</title></circle>').join('');
 }).join('');
 return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="KM3 price comparison">'+[0,1,2,3,4].map(i=>{const v=min+(max-min)*i/4,y=yy(v);return '<line x1="'+left+'" x2="'+(w-right)+'" y1="'+y+'" y2="'+y+'" stroke="#567182" stroke-dasharray="4 5" opacity=".45"/><text x="6" y="'+(y+4)+'" fill="#abbeca" font-size="13">'+v.toFixed(0)+(mode==='pct'?'%':' ₸')+'</text>'}).join('')+
 dates.map(d=>'<text x="'+xx(d)+'" y="'+(h-16)+'" text-anchor="middle" fill="#b4ccda" font-size="12">'+d.slice(5)+'</text>').join('')+lines+'</svg>'+
 '<div class="legend">'+series.map(s=>'<span><span class="sw" style="background:'+s.color+'"></span>'+esc(s.name)+'</span>').join('')+'</div>';
}
function km3SharedDays(){
 const a=new Set(data.filter(x=>x.city==='Астана').map(x=>x.day));
 const b=new Set(turanRows.map(x=>x.day));
 return [...new Set(essentukiRows.map(x=>x.day))].filter(d=>a.has(d)&&b.has(d)).sort();
}
let km3SelectedShop='Arbuz';
function km3Compare(){
 const common=km3SharedDays(),total=common.length,table=common.flatMap(d=>shops.map(s=>{
  const a=km3Get('A',d,s),b=km3Get('B',d,s),c=km3Get('C',d,s);
  if(!(a&&b&&c))return '';
  return '<tr><td>'+fmt(d)+'</td><td>'+s+'</td><td>'+val(a.price)+'</td><td>'+val(b.price)+'</td><td>'+val(c.price)+'</td><td>'+val(c.price-a.price)+'</td></tr>';
 })).join('');
 const complete=common.filter(d=>shops.every(s=>km3Get('A',d,s)&&km3Get('B',d,s)&&km3Get('C',d,s)));
 const series=['A','B','C'].map((brand,i)=>({name:['TASSAY','TURAN','Ессентуки №4'][i],color:['#51d8dc','#ffd073','#ac9cfa'][i],points:complete.map(d=>{const r=km3Get(brand,d,km3SelectedShop);return r?{day:d,price:r.price}:null}).filter(Boolean)}));
 return km3Title('КМ3 · A / B / C',km3t('Үш тауардың бағаларын салыстыру','Сравнение цен трёх товаров'),
 km3t('Барлық баға теңгемен, 1 литрге және Астана дүкендеріне қатысты. Ресейдегі бағалар RUB және ресми айырбас бағамы әзірге берілмеген.','Все цены приведены в тенге за 1 литр в магазинах Астаны. Цены из России в RUB и официальный обменный курс для них пока не представлены.'))+
 '<div class="km2-stats"><div class="km2-stat"><small>'+km3t('Толық ортақ күн','Полных общих дат')+'</small><strong>'+complete.length+'</strong><small>'+complete.map(d=>d.slice(5)).join(' · ')+'</small></div><div class="km2-stat"><small>'+km3t('Нақты жұптарды тексеру','Проверка сопоставимости')+'</small><strong>'+complete.length*3+'</strong><small>'+km3t('үш дүкендегі үштік салыстыру','тройных сравнений по трём магазинам')+'</small></div><div class="km2-stat"><small>'+km3t('Критерий','Требование')+'</small><strong>3</strong><small>'+km3t('үш ортақ күн қажет','нужны три общие даты')+'</small></div></div>'+
 (complete.length<3?'<div class="km2-missing"><b>'+km3t('Маңызды шектеу:','Важное ограничение:')+'</b> '+km3t('КМ3 талабындағы 3 ортақ күн әлі орындалмады: бар болғаны '+complete.length+' толық күн бар. Қосымша бір күнде үш брендтің де бағасын тіркеу қажет.','Требование КМ3 о трёх общих датах пока не выполнено: полных дат только '+complete.length+'. Нужно ещё хотя бы одно наблюдение всех трёх брендов в один день.')+'</div>':'')+
 km3Panel(km3t('Күндер мен дүкендер бойынша дәл салыстыру','Сравнение в одинаковые даты и магазины'),'<div class="km2-table"><table><thead><tr><th>'+km3t('Күні','Дата')+'</th><th>'+km3t('Дүкен','Магазин')+'</th><th>TASSAY</th><th>TURAN</th><th>Ессентуки №4</th><th>C − A</th></tr></thead><tbody>'+table+'</tbody></table></div>')+
 km3Panel(km3t('Үш брендтің графигі','График трёх брендов'),'<div class="row"><label>'+km3t('Дүкен:','Магазин:')+' <select onchange="km3SelectedShop=this.value;render()">'+shops.map(s=>'<option '+(km3SelectedShop===s?'selected':'')+'>'+s+'</option>').join('')+'</select></label></div>'+km3Plot(complete,series))+
 km3Panel(km3t('Салыстыру шекарасы','Границы сопоставления'),
 '<p>'+km3t('Астана дүкендеріндегі KZT бағаларында бағам әсері жоқ: сатып алу валютасы — теңге. Бірақ импорт құны, ҚҚС, жеткізу және жеңілдіктер тауардың сөре бағасына әсер етуі мүмкін. Үш брендтің минералдануы мен қолдану мақсаты әртүрлі болуы ықтимал. Ресейдегі RUB бағасы алынғанда ғана курс күні мен дереккөзі көрсетіліп, валюталық әсер бөлек есептеледі.','Все сравниваемые розничные цены Астаны уже выражены в KZT, поэтому влияние конвертации отсутствует. Но импортные издержки, НДС, доставка и скидки могут влиять на ценник. Минерализация и назначение товаров могут различаться. Для отдельного сравнения с российскими ценами RUB нужен официальный курс на дату каждого наблюдения.')+'</p>');
}
function km3ChangePct(a,b){return a&&b&&a.price>0?((b.price-a.price)/a.price*100):null}
function km3UpdatedAB(){
 const aOld='2026-10-26',aNew='2026-10-30',bOld='2026-10-15',bNew='2026-10-30';
 const rows=shops.map(shop=>{
  const a0=km3Get('A',aOld,shop),a1=km3Get('A',aNew,shop),b0=km3Get('B',bOld,shop),b1=km3Get('B',bNew,shop);
  const p=x=>x===null?'—':(x>=0?'+':'')+x.toFixed(1).replace('.',',')+'%';
  return '<tr><td>'+shop+'</td><td>'+val(a0?.price??0)+'</td><td>'+val(a1?.price??0)+'</td><td>'+p(km3ChangePct(a0,a1))+'</td><td>'+val(b0?.price??0)+'</td><td>'+val(b1?.price??0)+'</td><td>'+p(km3ChangePct(b0,b1))+'</td></tr>';
 }).join('');
 return km3Title('KM3 · A–B UPDATE',km3t('TASSAY және TURAN · Жаңа кезең','TASSAY и TURAN · Новый период'),
 km3t('КМ2-дегі соңғы күндер әртүрлі: TASSAY — 26.10, TURAN — 15.10. Жаңарту күнін екеуі үшін 30.10 алдық.','Исходные последние даты КМ2 различаются: TASSAY — 26.10, TURAN — 15.10. Для нового периода обе марки сопоставляются на 30.10.'))+
 km3Panel(km3t('Алдыңғы → жаңа кезең (Астана)','Старый → новый период (Астана)'),
 '<div class="km2-table"><table><thead><tr><th>'+km3t('Дүкен','Магазин')+'</th><th>A 26.10</th><th>A 30.10</th><th>A %</th><th>B 15.10</th><th>B 30.10</th><th>B %</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
 '<p class="km2-muted">'+km3t('TASSAY бойынша 25, 29, 30 қазан (Астана), 28, 30 қазан (Алматы) енгізілді; TURAN бойынша 29 қазан SMALL/Galmart және 30 қазан үш дүкен енгізілді. Барлығы автордың кестесіне негізделген.','По TASSAY добавлены 25, 29, 30 октября (Астана) и 28, 30 октября (Алматы); по TURAN — 29 октября SMALL/Galmart и 30 октября все три магазина. Источник — таблицы автора.')+'</p>')+
 km3Panel(km3t('Қателікке күдікті бақылау','Наблюдение с вероятной ошибкой'),
 '<p><b>TURAN · Arbuz · 29.10.2026:</b> '+km3t('автор кестесінде «4345 ₸» деп жазылған. Бұл сан өзгелерден бірнеше есе жоғары, сондықтан график пен орташа бағаға енгізілмеді. Дұрыс бағаны және бастапқы дүкен скриншотын растау қажет.','в присланной таблице указано «4345 ₸». Значение многократно выше остальных, поэтому пока исключено из расчётов и графиков. Требуется уточнить цену по первичному скриншоту.')+'</p><p><b>31.10.2026:</b> '+km3t('«Ертең жіберемін» деген жазба нақты баға емес, есепке алынбады.','запись «завтра отправлю» не является ценой и не включена в наблюдения.')+'</p>');
}
function km3LawLog(){
 const updated=km3NewTuran.length+15+essentukiRows.length;
 return km3Title('KM3 · EAEU / LEGAL ANALYSIS',km3t('ЕАЭО бәсекелестік құқығы және жаңарту журналы','Право ЕАЭС и журнал обновлений'),
 km3t('Үшінші бақылау жұмысының алдын ала құқықтық позициясы. Бөлшек бағалар мен шетелдік компанияның болуы трансшекаралық нарықты дәлелдемейді.','Предварительная правовая позиция по КМ3. Наличие иностранной компании и розничные цены сами по себе не доказывают трансграничный рынок.'))+
 km3Panel(km3t('76-бап және 19-қосымша','Статья 76 и Приложение №19'),
 '<p>'+km3t('ЕАЭО туралы шарттың 76-бабы үстем жағдайды теріс пайдалану, бәсекелестікке қарсы келісімдер және келісілген әрекеттерге қатысты ортақ ережелерді белгілейді. №19 қосымша — осы ережелердің трансшекаралық нарықтарда қолданылуын және ЕЭК бақылау рәсімін нақтылайды.','Статья 76 Договора о ЕАЭС устанавливает общие правила о злоупотреблении доминированием, антиконкурентных соглашениях и согласованных действиях. Приложение №19 регулирует их применение и контроль ЕЭК на трансграничных рынках.')+'</p><p>'+km3C(km3t('ЕАЭО шартының ресми мәтіні','Официальный текст Договора о ЕАЭС'),'treaty')+'</p>')+
 km3Panel(km3t('Трансшекаралық өлшем және орган құзыреті','Трансграничный критерий и компетенция органов'),
 '<p>'+km3t('Жоғары Еуразиялық экономикалық кеңестің 19.12.2012 жылғы №29 шешіміне сәйкес, трансшекаралық нарықтың географиялық шекаралары кемінде екі ЕАЭО мүшесі аумағын қамтуы тиіс. Бұған қоса бұзушылық түріне байланысты арнайы өлшемдер қолданылады. Егер зерттелген нарық тек Астана аумағымен шектелсе, құқықтық талдау Қазақстанның ұлттық құзыретіне жатады; егер трансшекаралық шекаралар мен өзге талаптар дәлелденсе, ЕЭК құзыреті бөлек тексеріледі.','Согласно Решению Высшего Евразийского экономического совета №29 от 19.12.2012, географические границы трансграничного рынка должны охватывать территории как минимум двух членов ЕАЭС. Дополнительно действуют критерии по конкретному виду нарушения. Если релевантный рынок ограничен Астаной, применяется национальная компетенция Казахстана; компетенция ЕЭК требует доказательства трансграничных границ и иных условий.')+'</p><p>'+km3C(km3t('№29 шешімі, ресми мәтін','Решение №29, официальный текст'),'criteria')+'</p>')+
 km3Panel(km3t('БШ2 күдігі қалай өзгерді?','Изменилось ли подозрение из КМ2?'),
 '<p><b>'+km3t('Әзірге өзгерген жоқ.','На данном этапе не изменилось.')+'</b> '+km3t('Жаңа бағалар нарықтағы сауда ұсыныстарының айырмасын көрсетеді. Бірақ сатылым көлемі, нарықтың толық шекарасы, өндірушілердің келісім құжаттары мен байланысы жоқ. Шетелдік Ессентуки №4 тауарын қосу монополияны немесе заң бұзуды дәлелдемейді.','Новые цены расширяют картину розничных предложений. Но по-прежнему отсутствуют подтверждённые объёмы продаж, полные границы рынка, документы о соглашениях и контактах участников. Добавление российской Ессентуки №4 не доказывает монополии или нарушения.')+'</p>')+
 km3Panel(km3t('Өзгерістер журналы','Журнал изменений'),
 '<div class="km2-table"><table><thead><tr><th>'+km3t('Дерек','Данные')+'</th><th>'+km3t('Күн/кезең','Дата/период')+'</th><th>'+km3t('Саны','Количество')+'</th><th>'+km3t('Мәртебе','Статус')+'</th></tr></thead><tbody>'+
 [['TASSAY','2026-10-25, 28, 29, 30',15],['TURAN','2026-10-29, 30',5],['Ессентуки №4','2026-05-29 — 2026-10-30',24]].map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+km3t('Автор кестесі; дүкеннен растау керек','Таблица автора; проверить в магазине')+'</td></tr>').join('')+
 '</tbody></table></div><p class="km2-muted">'+km3t('Ескі бақылаулар өшірілмеген. TURAN Arbuz 29 қазан «4345» және 31 қазан бос жолдар толықтырылған жоқ.','Исторические записи сохранены. Подозрительная цена 4345 для TURAN Arbuz за 29 октября и пустые значения 31 октября не добавлены.')+'</p>')+
 km3Panel(km3t('ЖИ туралы мәлімдеме','Декларация использования ИИ'),
 '<p>'+km3t('ЖИ платформаның бағдарламалық құрылымына, салыстырмалы есептерге, мәтіндерді аударуға және құқықтық дереккөздерді жүйелеуге көмектесті. Бағалардың бастапқы көзі — автордың ұсынған кестелері; тәуелсіз дүкен бақылауы және толық құқықтық дәлелдеме жасалған жоқ. Қателігі күмәнді мәндер автоматты түрде рас деп қабылданбайды.','ИИ помогал создавать интерфейс, сравнительные расчёты, перевод и систематизацию правовых источников. Первичный источник новых цен — таблицы автора; независимой проверки магазинов и полноты юридических доказательств не проводилось. Сомнительные значения автоматически не принимаются за достоверные.')+'</p>');
}
sections.push(km3t('КМ3 · C компаниясы','КМ3 · Компания C'),km3t('КМ3 · Ессентуки бағалары','КМ3 · Цены Ессентуки'),km3t('КМ3 · Үш өнімді салыстыру','КМ3 · Сравнение трёх товаров'),km3t('КМ3 · А–В жаңартуы','КМ3 · Обновление A–B'),km3t('КМ3 · ЕАЭО құқық және журнал','КМ3 · Право ЕАЭС и журнал'));
pages.push(km3Product,km3PriceTable,km3Compare,km3UpdatedAB,km3LawLog);
