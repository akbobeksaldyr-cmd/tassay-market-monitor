
const RU_TABS=["Главная · Конкурентное право","TASSAY · Динамика цен","TASSAY · Цены и доказательства","Методология","Релевантный рынок Астаны","TASSAY · Рыночная доля","Внешние факторы","Астана и Алматы","Научные выводы","Источники и доказательства","TASSAY · О продукте","TURAN · О продукте","TURAN · Цены и доказательства","TURAN · Динамика цен","TASSAY × TURAN · Сравнение","TURAN · Рыночная доля","Юридический анализ IRAC","Использование ИИ","Международная судебная практика","Брошюра и научная статья"];
const rp=(title,text)=>'<section class="panel"><h3>'+title+'</h3><p class="sectionText">'+text+'</p></section>';
const rh=(title,desc)=>'<div class="km2-lead"><h2>'+title+'</h2><p>'+desc+'</p></div>';
const rrData=(brand)=>brand==='TURAN'?turanRows:data.filter(x=>x.city===city);
function ruTable(brand){
 const isT=brand==='TURAN',dataSet=rrData(brand),ds=[...new Set(dataSet.map(x=>x.day))].sort(),get=(day,shop)=>dataSet.find(x=>x.day===day&&x.shop===shop);
 const pcs=(day,prev)=>!prev?'—':shops.map(shop=>{const a=get(prev,shop),b=get(day,shop),p=a&&b&&a.price?((b.price-a.price)/a.price*100):null;return '<div style="white-space:nowrap;font-size:11px">'+shop+': '+(p===null?'—':(p>0?'+':'')+p.toFixed(1)+'%')+'</div>'}).join('');
 const rows=ds.map((day,i)=>'<tr><td>'+day+'</td>'+shops.map(shop=>'<td>'+(get(day,shop)?val(get(day,shop).price):'—')+'</td>').join('')+'<td>'+pcs(day,ds[i-1])+'</td><td><button class="evidence-button" onclick="'+(isT?'openTuranEvidence(\''+day+'\')':'openTassayDayEvidence(\''+day+'\',\''+city+'\')')+'">📷 Смотреть</button></td></tr>').join('');
 const first=ds[0],last=ds[ds.length-1],summary=shops.map(shop=>{const a=get(first,shop),b=get(last,shop),p=a&&b&&a.price?(b.price-a.price)/a.price*100:null;return '<td>'+(p===null?'—':(p>0?'+':'')+p.toFixed(1)+'%')+'</td>'}).join('');
 return rh(brand+' · Цены и доказательства','Газированная вода 1 л. Даты идут в хронологическом порядке, процент изменения считается от предыдущего наблюдения в том же магазине.')+
 (isT?'':'<p><select onchange="city=this.value;render()"><option '+(city==='Астана'?'selected':'')+'>Астана</option><option '+(city==='Алматы'?'selected':'')+'>Алматы</option></select></p>')+
 '<section class="panel"><div class="tablewrap"><table><thead><tr><th>Дата</th><th>Arbuz</th><th>SMALL</th><th>Galmart</th><th>Изменение, %</th><th>Скриншот</th></tr></thead><tbody>'+rows+'<tr><td><b>За весь период: '+first+' → '+last+'</b></td>'+summary+'<td>Первое → последнее</td><td>—</td></tr></tbody></table></div></section>'+
 rp('Проверка данных','Скриншоты связаны с датой и брендом. На обрезанных изображениях название товара и объём иногда не видны; это ограничение первичных доказательств.');
}
function ruGraph(brand){
 const isT=brand==='TURAN';
 return rh(brand+' · Динамика цен','Линейные графики показывают только зарегистрированные даты наблюдений.')+
 (isT?'':'<p><select onchange="city=this.value;render()"><option '+(city==='Астана'?'selected':'')+'>Астана</option><option '+(city==='Алматы'?'selected':'')+'>Алматы</option></select></p>')+
 '<section class="panel"><h3>Изменение стоимости по магазинам</h3><div class="row"><button class="btn outline" onclick="document.getElementById(\'rugraph\').innerHTML=graph(\''+(isT?'Астана':'\'+city+\'')+'\',\'abs\',\''+brand+'\')">₸</button></div><div id="r u"></div>'+graph(isT?'Астана':city,'abs',brand)+'</section>';
}
function ruHome(){
 return rh('Конкурентное право: что показывают цены TASSAY и TURAN?','Исследовательская платформа о релевантном рынке газированной воды объёмом 1 л в Астане.')+
 '<div class="grid">'+metric('Цен TASSAY',data.length,'Два города')+metric('Цен TURAN',turanRows.length,'Астана')+metric('Общих дат',3,'29.04 · 29.05 · 01.09')+metric('Магазинов',3,'Arbuz, SMALL, Galmart')+'</div>'+
 rp('Основной правовой вопрос','Достаточны ли изменения розничных цен для вывода об антиконкурентном соглашении, согласованных действиях или доминирующем положении? <b>Нет: нужны сопоставимые продажи, рыночные доли и прямые юридические доказательства.</b>')+
 '<section class="panel"><div class="row"><button class="btn" onclick="nav(14)">Сравнение брендов</button><button class="btn outline" onclick="nav(16)">Правовой анализ</button><button class="btn outline" onclick="nav(18)">Судебные дела</button><button class="btn outline" onclick="nav(19)">Брошюра и статья</button></div></section>'+
 rp('Ценовая динамика TASSAY в Астане',graph('Астана','abs','TASSAY'));
}
function ruStatic(title,desc,blocks){
 return rh(title,desc)+blocks.map(x=>rp(x[0],x[1])).join('');
}
function ruComparison(){
 const a=data.filter(x=>x.city==='Астана'),b=turanRows,shared=['2026-04-29','2026-05-29','2026-09-01'],rows=shared.flatMap(day=>shops.map(shop=>{const aa=a.find(x=>x.day===day&&x.shop===shop),bb=b.find(x=>x.day===day&&x.shop===shop);return '<tr><td>'+day+'</td><td>'+shop+'</td><td>'+(aa?val(aa.price):'—')+'</td><td>'+(bb?val(bb.price):'—')+'</td><td>'+(aa&&bb?val(aa.price-bb.price):'—')+'</td></tr>'})).join('');
 return rh('TASSAY × TURAN · Сравнительный анализ','Три общие даты, три магазина, девять сопоставимых наблюдений. Июль, август и октябрь отличаются по датам на 3–5 дней.')+
 '<section class="panel"><h3>Прямое сравнение за одинаковые дни</h3><div class="tablewrap"><table><thead><tr><th>Дата</th><th>Магазин</th><th>TASSAY</th><th>TURAN</th><th>Разница</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>'+
 rp('Вывод','В девяти наблюдениях TASSAY дороже TURAN, но это не доказывает ни причины разницы, ни незаконного соглашения. Требуются данные о скидках и себестоимости.');
}
function ruSources(){
 return rh('Источники и доказательства','Архив 35 фотографий, публикации компаний и официальные юридические документы.')+
 rp('Основные ссылки','<a href="https://adilet.zan.kz/rus/docs/K1500000375" target="_blank">Предпринимательский кодекс РК</a> · <a href="https://kase.kz/files/emitters/RGBK/rgbkp_2023_rus.pdf" target="_blank">Отчёт RG Brands, 2023</a> · <a href="https://www.euromonitor.com/bottled-water-in-kazakhstan/report" target="_blank">Euromonitor, 2025</a>')+
 '<section class="panel"><h3>Скриншоты наблюдений</h3><div class="evidence-grid">'+evidenceImages.map(x=>'<a class="evidence-item" target="_blank" href="/evidence/'+encodeURIComponent(x.file)+'"><img loading="lazy" src="/evidence/'+encodeURIComponent(x.file)+'" alt="Фото"><div class="evidence-meta"><b>'+x.brand+'</b><span>'+x.day+' · '+x.city+'</span></div></a>').join('')+'</div></section>';
}
function ruLegalCases(){
 return rh('Международная судебная практика','Дела ЕС, США и Великобритании рассматриваются только по аналогии, не как право Казахстана.')+
 ruStatic('', '',[
 ['ЕС · Coca-Cola (2005)','Практики эксклюзивных поставок и скидок газированных напитков. Комиссия приняла обязательства компании, а не установила окончательное нарушение. Аналогия: нужно изучать договоры поставок. <a href="https://eur-lex.europa.eu/eli/dec/2005/670/oj/eng" target="_blank">Официальное решение</a>.'],
 ['США · Leegin v PSKS (2007)','Оценка вертикальных ограничений минимальных розничных цен по Sherman Act §1 с применением правила разумности. Для наших брендов требуются документы поставщиков и продавцов. <a href="https://www.govinfo.gov/app/details/USREPORTS-551/USREPORTS-551-877" target="_blank">Решение Верховного суда</a>.'],
 ['Великобритания · Tesco / Dairy Retail Price Initiatives (2012)','Проверка возможного косвенного обмена будущими ценовыми планами через поставщика. Для TASSAY/TURAN отсутствуют такие сообщения и доказательства. <a href="https://www.catribunal.org.uk/judgments/11881111-1-tesco-stores-ltd-2-tesco-holdings-ltd-3-tesco-plc-judgment-liability-2012-cat" target="_blank">Competition Appeal Tribunal</a>.']]);
}
const RU_PAGES=[
 ruHome,
 ()=>rh('TASSAY · Динамика цен','График по магазинами и выбранному городу.')+graph(city,'abs','TASSAY')+rp('Калькулятор','Для выбора двух дат откройте казахскую версию вкладки динамики; данные на обеих версиях одинаковы.'),
 ()=>ruTable('TASSAY'),
 ()=>ruStatic('Методология исследования','Сравнение фактически зарегистрированных цен.',[['Объект','Газированная вода TASSAY и TURAN, 1 литр. Не смешиваются другие объёмы и негазированная вода.'],['Данные','TASSAY: 54 наблюдения в Астане и Алматы. TURAN: 27 наблюдений в Астане. Три общие даты сравнения: 29 апреля, 29 мая, 1 сентября.'],['Формула','Процент изменения = (новая цена − прежняя цена) / прежняя цена × 100%. Неизмеренные дни не считаются доказанной стабильностью.'],['Ограничения','Акции, отсутствие товара, доставка и неполные скриншоты требуют отдельной проверки.']]),
 ()=>ruStatic('Релевантный рынок Астаны','Основная география исследования — Астана.',[['Товарные границы','Узкий вариант: газированная минеральная вода 1 л; широкий — газированная бутилированная вода либо вся питьевая вода. Границы требуют проверки взаимозаменяемости.'],['Разные уровни конкуренции','Производители TASSAY/TURAN и розничные продавцы Arbuz/SMALL/Galmart — не одно и то же. Магазин может самостоятельно устанавливать наценку.'],['Методика','<a href="https://adilet.zan.kz/rus/docs/V2200027883" target="_blank">Официальная методика анализа рынков ↗</a>']]),
 ()=>ruStatic('TASSAY · Рыночная доля','Показатели из других годов и категорий не равны доле TASSAY 1 л в Астане.',[['28% за 2023 год','В годовом отчёте RG Brands Kazakhstan указана оценка доли Tassay / Yuniks на рынке <b>ароматизированной воды</b>, а не газированной минеральной воды 1 л. <a href="https://kase.kz/files/emitters/RGBK/rgbkp_2023_rus.pdf">Отчёт ↗</a>'],['Вывод','Достоверную долю на рынке Астаны за 2026 год нельзя рассчитать без объёмов продаж самого бренда и всех участников рынка.']]),
 ()=>ruStatic('Внешние факторы изменения цен','Гипотезы, которые нужно отличать от доказанных причин.',[['Возможные факторы','Логистика, инфляция, сезонный спрос, торговая наценка, промоакции, упаковка, транспортные и валютные расходы.'],['Ограничение','Причинная связь с ценой конкретной бутылки пока не подтверждена договорами, расходами и условиями акций.']]),
 ()=>{const a=data.filter(x=>x.city==='Астана'),b=data.filter(x=>x.city==='Алматы');const rows=a.map(x=>{const y=b.find(z=>z.day===x.day&&z.shop===x.shop);return y?'<tr><td>'+x.day+'</td><td>'+x.shop+'</td><td>'+x.price+'</td><td>'+y.price+'</td><td>'+(x.price-y.price)+'</td></tr>':''}).join('');return rh('Астана и Алматы · TASSAY','Дополнительное географическое сравнение, не объединяющее два города в один рынок.')+'<section class="panel"><div class="tablewrap"><table><tr><th>Дата</th><th>Магазин</th><th>Астана</th><th>Алматы</th><th>Разница, ₸</th></tr>'+rows+'</table></div></section>'},
 ()=>ruStatic('Научные выводы','Итог исследования.',[['Факты','Бренды и магазины показывают разные наблюдаемые цены; для общих дат доступны 9 сравнений.'],['Гипотезы','Скидки, логистика и наценки могут влиять на цены, но их точный вклад неизвестен.'],['Правовые пределы','Похожая цена не доказывает сговор; высокая цена не доказывает монополию. Не хватает продаж, рыночных долей и документов.']]),
 ruSources,
 ()=>ruStatic('TASSAY · О продукте','Основной товар первого этапа исследования.',[['Товар','Газированная бутилированная вода TASSAY, 1 л. Происхождение, состав и юридический производитель конкретной бутылки требуют проверки по этикетке. <img style="max-width:240px;display:block;margin:14px 0" src="/media/tassay-card">']]),
 ()=>ruStatic('TURAN · О продукте','Бренд-конкурент второго этапа исследования.',[['Товар','Газированная вода TURAN, 1 л; открытые источники связывают бренд с АО «Кокшетауские минеральные воды». <img style="max-width:240px;display:block;margin:14px 0" src="/media/turan-card">'],['Обоснование выбора','Сходные объём и потребительская функция, сопоставимые магазины и даты. Но принадлежность к одному релевантному рынку требует анализа взаимозаменяемости.']]),
 ()=>ruTable('TURAN'),
 ()=>rh('TURAN · Динамика цен','Девять дат, три магазина, график только по Астане.')+graph('Астана','abs','TURAN')+rp('Изменение за весь период','Arbuz: +13,0%; SMALL: −13,2%; Galmart: +15,9%. Промоакции требуют подтверждения.'),
 ruComparison,
 ()=>ruStatic('TURAN · Рыночная доля','Общая выручка производителя не является рыночной долей отдельной бутылки.',[['16,56 млрд ₸ в 2025 году','В публикации Kursiv приведена общая выручка АО «Кокшетауские минеральные воды». У производителя есть и другие товары, поэтому 16,56 млрд ₸ не равно продажам газированной TURAN 1 л. <a href="https://kz.kursiv.media/2026-06-01/zhnb-kompaniya-byvshego-vicze-ministra-selskogo-hozyaistva-poluchila-milliardnuyu-pribyl/" target="_blank">Публикация ↗</a>'],['Вывод','Точный процент доли TURAN в Астане за 2026 год не подтверждён. Нужны литры продаж по Астане и общий объём релевантного рынка.']]),
 ()=>ruStatic('Юридический анализ IRAC','Предварительная квалификация по конкурентному праву РК.',[['I — Issue','Свидетельствуют ли наблюдаемые цены об антиконкурентном соглашении, согласованных действиях или злоупотреблении доминированием?'],['R — Rule','Предпринимательский кодекс РК: 169-я статья — соглашения; 170-я — согласованные действия; 172-я и 174-я — доминирование и злоупотребление. <a href="https://adilet.zan.kz/rus/docs/K1500000375" target="_blank">Текст кодекса ↗</a>'],['A — Application','Есть цены и даты, но нет подтверждённых рыночных долей, переписки, соглашений и закупочных условий. Магазины могут независимо менять наценку.'],['C — Conclusion','Нарушение не установлено; необходимы дополнительные рыночные и юридические доказательства.']]),
 ()=>ruStatic('Использование искусственного интеллекта','Академическая прозрачность.',[['Роль ИИ','Помощь в структуре исследования, программировании платформы, подсчёте процентов и подготовке текста.'],['Ограничение','ИИ не является первичным источником наблюдений и не заменяет проверку скриншотов, статистики и судебных решений.']]),
 ruLegalCases,
 ()=>rh('Брошюра и научная статья','Документы формируются из текущей базы платформы.')+rp('Экспорт','<button class="btn" onclick="previewResearch(\'brochure\')">Сформировать брошюру</button> <button class="btn outline" onclick="previewResearch(\'article\')">Сформировать статью</button><p>Предварительный просмотр открывается в отдельной вкладке; сохраните как PDF через Ctrl+P. Текст документа пока формируется на казахском языке.</p>')
];
function activateRU(){
 if(RU_TABS.length!==sections.length||RU_PAGES.length!==pages.length)throw Error('RU/KK section count mismatch');
 sections.splice(0,sections.length,...RU_TABS);
 pages.splice(0,pages.length,...RU_PAGES);
 document.documentElement.lang='ru';
 document.getElementById('subtitle').textContent='Мониторинг цен и конкурентно-правовой анализ рынка бутилированной воды Казахстана';
 const header=document.querySelector('.header>.kicker');if(header)header.textContent='TASSAY · TURAN · ИССЛЕДОВАНИЕ';
 const side=document.querySelector('#sidebar>p');if(side)side.textContent='Конкурентное право Казахстана';
 render();
}
activateRU();
