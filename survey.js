/* Anonymous aggregate of 20 voluntary Google Forms responses, 11–13 Nov 2026.
   Do not publish the individual questionnaire rows or their timestamps. */
(function(){
'use strict';
const tr=(kk,ru)=>typeof KM3_RU!=='undefined'&&KM3_RU?ru:kk;
const h=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pct=(value,n)=>n?(100*value/n).toLocaleString('ru-RU',{maximumFractionDigits:1})+'%':'—';
const labels={
 favorite:[
  ['TASSAY','TASSAY'],['TURAN','TURAN'],['Ессентуки №4','Ессентуки №4'],
  ['Басқа бренд','Другая марка'],['Таңдаулы бренд жоқ','Нет любимой марки']
 ],
 purpose:[
  ['Шөл қандыру','Утоление жажды'],['Тамақпен бірге','К еде'],
  ['Дәмі үшін','Из-за вкуса'],['Минералдық құрамы / ерекше мақсаты','Минеральный состав / особое назначение'],
  ['Басқа','Другое']
 ],
 barriers:[
  ['Дәм айырмашылығы','Разница во вкусе'],['Ештеңе кедергі емес','Ничего не мешает'],
  ['Белгілі брендке әдеттену','Привычка к бренду'],['Минералдық құрам / мақсат айырмашылығы','Разница в составе или назначении'],
  ['Баға айырмашылығы','Разница в цене'],['Басқа','Другое']
 ],
 pair:[['TASSAY','TURAN'],['TASSAY','Ессентуки №4'],['TURAN','TASSAY'],
       ['TURAN','Ессентуки №4'],['Ессентуки №4','TASSAY'],['Ессентуки №4','TURAN']],
 responses:[['Иә','Да'],['Жоқ','Нет'],['Бұл брендтерді білмеймін','Не знаю эти марки'],['Жауап жоқ','Нет ответа']],
 rise:['Продолжу покупать прежнюю марку','Выберу другую воду','Перейду на TASSAY','Перейду на TURAN','Затрудняюсь ответить']
};
const groups={
 all:{
  n:20,fav:[5,2,4,6,3],purpose:[6,5,5,3,1],
  pairs:[[19,1,0,0],[16,1,2,1],[18,1,0,1],[15,2,2,1],[15,2,2,1],[14,3,2,1]],
  rise:[8,8,1,1,2],barriers:[7,6,3,2,1,1]
 },
 astana:{
  n:17,fav:[5,1,4,4,3],purpose:[5,4,4,3,1],
  pairs:[[17,0,0,0],[14,1,1,1],[15,1,0,1],[14,1,1,1],[13,2,1,1],[13,2,1,1]],
  rise:[7,6,1,1,2],barriers:[6,6,2,2,0,1]
 },
 recent:{
  n:13,fav:[3,1,4,3,2],purpose:[5,2,2,3,1],
  pairs:[[13,0,0,0],[11,0,1,1],[11,1,0,1],[11,0,1,1],[10,1,1,1],[10,1,1,1]],
  rise:[6,3,1,1,2],barriers:[5,4,1,2,0,1]
 }
};
const cohortLabels={
 recent:['Астанадан, соңғы 3 айда сатып алғандар','Астана · покупали за 3 месяца'],
 astana:['Астана тұрғындары','Жители Астаны'],
 all:['Барлық жауаптар','Все ответы']
};
const colors={yes:'#188b7f',no:'#cf8062',unknown:'#9eaeb6',empty:'#e0e7e7'};
let selected='recent';
const metric=(value,title,note)=>'<article class="survey-metric"><strong>'+h(value)+'</strong><span>'+h(title)+'</span><small>'+h(note||'')+'</small></article>';
function barLines(items,counts,n,color){
 return '<div class="survey-bars">'+items.map((arr,i)=>{
  const value=counts[i];const label=tr(arr[0],arr[1]);
  const percent=n?100*value/n:0;
  return '<div class="survey-bar-row"><div class="survey-bar-label"><span>'+h(label)+'</span><strong>'+value+' · '+pct(value,n)+'</strong></div>'+
    '<div class="survey-bar-track"><div class="survey-bar-fill" style="width:'+percent+'%;background:'+color+'"></div></div></div>';
 }).join('')+'</div>';
}
function chart(title,note,body){
 return '<section class="panel survey-chart"><h3>'+h(title)+'</h3><p class="survey-note">'+h(note)+'</p>'+body+'</section>';
}
function substitution(g){
 const legend=labels.responses.map((arr,i)=>
  '<span><i style="background:'+Object.values(colors)[i]+'"></i>'+h(tr(arr[0],arr[1]))+'</span>').join('');
 return chart(tr('Брендті алмастыруға дайындық','Готовность заменить марку'),
   tr('Әр жолдағы бөліктердің қосындысы — таңдалған топтың барлық қатысушылары. Белгісіз және бос жауаптар бөлек көрсетілген.',
      'Каждая строка включает всех участников выбранной группы. Пропуски и незнакомые марки учтены отдельно.'),
   '<div class="survey-legend">'+legend+'</div>'+
   '<div class="survey-pairs">'+g.pairs.map((vals,i)=>{
      const name=labels.pair[i].join(' → ');
      const bar=vals.map((n,j)=>n?'<span style="width:'+(100*n/g.n)+'%;background:'+Object.values(colors)[j]+'" title="'+h(tr(labels.responses[j][0],labels.responses[j][1])+': '+n)+'"></span>':'').join('');
      return '<div class="survey-pair"><div class="survey-bar-label"><span>'+h(name)+'</span><strong>'+vals[0]+'/'+g.n+' '+tr('«Иә»','«Да»')+'</strong></div>'+
        '<div class="survey-stack" role="img" aria-label="'+h(name+': '+vals.join(', '))+'">'+bar+'</div></div>';
   }).join('')+'</div>');
}
function priceResponse(g){
 const switched=g.rise[1]+g.rise[2]+g.rise[3];
 const summary=[
  [tr('Бұрынғысын сатып алады','Продолжат покупать прежнюю'),g.rise[0]],
  [tr('Басқа суға ауысады','Выберут альтернативную воду'),switched],
  [tr('Жауап беру қиын','Затруднились ответить'),g.rise[4]]
 ];
 const shades=['#516b7a','#188b7f','#c6a36a'];
 return chart(tr('Баға ұзақ мерзімге 10%-ға өссе','Если любимая вода подорожает на 10%'),
   tr('Сауалнамадағы гипотетикалық сценарий; нақты сату мінез-құлқы өлшенген жоқ.',
      'Гипотетический вопрос анкеты, а не наблюдение реальных покупок.'),
   '<div class="survey-price-grid">'+summary.map((x,i)=>'<div class="survey-price-item"><strong>'+x[1]+' / '+g.n+'</strong><span>'+h(x[0])+'</span>'+
      '<div class="survey-bar-track"><div class="survey-bar-fill" style="width:'+(100*x[1]/g.n)+'%;background:'+shades[i]+'"></div></div><small>'+pct(x[1],g.n)+'</small></div>').join('')+'</div>'+
   '<p class="survey-footnote">'+tr('Ауысу: «Басқа су таңдаймын» + «TASSAY-ға ауысамын» + «TURAN-ға ауысамын».',
     'Переход: «Выберу другую воду» + «Перейду на TASSAY» + «Перейду на TURAN».')+'</p>');
}
function view(){
 const g=groups[selected];
 const switching=g.rise[1]+g.rise[2]+g.rise[3];
 const filter=Object.entries(cohortLabels).map(([key,label])=>
   '<button type="button" class="survey-filter'+(selected===key?' active':'')+
   '" aria-pressed="'+(selected===key)+'" onclick="selectSurveyCohort(\''+key+'\')">'+h(tr(label[0],label[1]))+' ('+groups[key].n+')</button>').join('');
 return '<div id="survey-panel">'+
   '<section class="survey-hero"><div class="hero-eyebrow">TASSAY MARKET MONITOR / GOOGLE FORMS / БШ4</div>'+
   '<h2>'+tr('Тұтынушылар сауалнамасы · аралық нәтижелер','Опрос потребителей · промежуточные результаты')+'</h2>'+
   '<p>'+tr('TASSAY, TURAN және Ессентуки №4 арасындағы болжамды өзара алмастырылуды тексеру. Анонимді жинақталған жауаптар.',
      'Проверка гипотезы о взаимозаменяемости TASSAY, TURAN и Ессентуки №4. Только обезличенные агрегированные ответы.')+'</p>'+
   '<span class="survey-pill">'+tr('11–13 қараша 2026','11–13 ноября 2026')+' · '+tr('аралық жинақ','промежуточный срез')+'</span></section>'+
   '<div class="survey-filters" role="group" aria-label="'+tr('Сауалнама іріктемесі','Выбор группы ответов')+'">'+filter+'</div>'+
   '<div class="survey-metrics">'+
     metric(g.n,tr('Жауаптар саны','Количество ответов'),tr('Таңдалған топ','Выбранная группа'))+
     metric(g.pairs[0][0]+'/'+g.n,tr('TASSAY → TURAN ауыстыруы','Замена TASSAY → TURAN'),tr('«Иә» жауабы','Ответ «Да»'))+
     metric(switching+'/'+g.n,tr('Баға +10%: баламаға ауысу','Цена +10%: переход к альтернативе'),pct(switching,g.n))+
   '</div>'+
   '<p class="survey-context">'+tr(
     'Негізгі талдау үшін Астанада тұратын және соңғы 3 айда газдалған бөтелкедегі суды сатып алған 13 қатысушы таңдалды. Барлық 20 жауап және Астанадағы 17 жауап бөлек қолжетімді.',
     'Для основного анализа выделены 13 жителей Астаны, покупавших газированную бутилированную воду за последние 3 месяца. Все 20 ответов и 17 ответов жителей Астаны доступны для сравнения.')+'</p>'+
   substitution(g)+
   '<div class="survey-grid">'+
     chart(tr('Көбіне қандай су сатып алынады','Какую воду чаще покупают'),
       tr('Бұл нарық үлесі емес, тек сауалнамадағы жауап жиілігі.',
          'Это частота ответов в опросе, не рыночная доля по объёму продаж.'),
       barLines(labels.favorite,g.fav,g.n,'#188b7f'))+
     chart(tr('Сатып алу мақсаты','Цель покупки'),
       tr('Сауалнаманың бір жауабы бойынша','По одному ответу на участника'),
       barLines(labels.purpose,g.purpose,g.n,'#537d91'))+
   '</div>'+
   priceResponse(g)+
   chart(tr('Ауыстыруға не кедергі?','Что мешает заменить воду?'),
     tr('Дәм, минералдық құрам және дағдылар тауар шекарасын анықтауда маңызды.',
        'Вкус, минеральный состав и привычки важны при оценке границ товарного рынка.'),
     barLines(labels.barriers,g.barriers,g.n,'#aa8a61'))+
   '<section class="panel survey-law"><h3>'+tr('Бәсекелестік құқығы бойынша алдын ала IRAC','Предварительная правовая оценка IRAC')+'</h3>'+
    '<dl><dt>Issue</dt><dd>'+tr('Үш су бір тауар нарығына жата ма?',
      'Входят ли три вида воды в один товарный рынок?')+'</dd>'+
    '<dt>Rule</dt><dd>'+tr('Нарықты анықтау үшін сұраныс алмастырылуы, өнім мақсаты, қасиеттері, бағалар және география зерттеледі.',
      'Для определения рынка проверяются заменяемость со стороны спроса, назначение, свойства, цены и география.')+'</dd>'+
    '<dt>Application</dt><dd>'+tr('Сауалнама ықтимал алмастырылуды көрсетеді, бірақ іріктеме шағын әрі кездейсоқ емес; Ессентуки №4 құрамы мен мақсатының айырмасы бөлек ескеріледі.',
      'Ответы указывают на возможную заменяемость, однако выборка мала и неслучайна; отличия состава и назначения Ессентуки №4 требуют отдельной оценки.')+'</dd>'+
    '<dt>Conclusion</dt><dd>'+tr('Тауар нарығының нақты шекарасы және компаниялардың үлесі тек осы сауалнамамен дәлелденбейді; құқық бұзушылық туралы қорытынды жасалмайды.',
      'Один этот опрос не устанавливает окончательные границы рынка или доли компаний и не доказывает нарушение закона.')+'</dd></dl>'+
    '<p class="survey-footnote">'+tr('Сауалнама — ықтимал дәлел, толыққанды экономикалық тест емес; 10% сұрақ SSNIP тестіне тең емес.',
      'Опрос — вспомогательный материал, а вопрос о +10% не равен полноценному SSNIP-тесту.')+'</p>'+
    '<a href="https://adilet.zan.kz/rus/docs/V2200027883" target="_blank" rel="noopener noreferrer">'+
      tr('ҚР бәсекелестікті талдау әдістемесі ↗','Методика анализа конкуренции РК ↗')+'</a></section>'+
   '<section class="panel survey-source"><h3>'+tr('Дереккөз, әдіс және шектеулер','Источник, метод и ограничения')+'</h3>'+
    '<p>'+tr('Дереккөз: автордың Google Forms «Новая форма (Ответы).xlsx» экспорты, 2026 жылғы 13 қарашадағы аралық кесінді. 20 ерікті жауап, оның 17-сі Астанадан. Іріктеме репрезентативті емес.',
      'Источник: авторская выгрузка Google Forms «Новая форма (Ответы).xlsx», промежуточный срез на 13 ноября 2026 года. 20 добровольных ответов, 17 из Астаны. Выборка нерепрезентативна.')+'</p>'+
    '<p>'+tr('Сүзгі: Астанада тұру және соңғы үш айда газдалған бөтелкедегі су сатып алу. Белгісіз және бос жауаптар жойылмайды.',
      'Основной фильтр: проживание в Астане и покупка газированной бутилированной воды за последние три месяца. Пропуски и ответы «не знаю» сохранены.')+'</p>'+
    '<p>'+tr('Жеке жауаптар, уақыт белгілері немесе қатысушылардың жеке мәліметтері жарияланбаған. Диаграммалар үшін есептеу негізі — таңдалған топтағы адамдар саны.',
      'Индивидуальные ответы и временные отметки участников не публикуются. Знаменатель процентов — число участников выбранной группы.')+'</p>'+
    '<div class="survey-source-actions"><button type="button" class="btn" onclick="downloadSurveyAggregate()">'+
      tr('Жиынтық деректерді CSV жүктеу','Скачать агрегированные данные CSV')+'</button>'+
      '<button type="button" class="btn outline" onclick="nav(4)">'+tr('Астана нарығына оралу','К рынку Астаны')+'</button></div></section>'+
   '</div>';
}
window.selectSurveyCohort=function(key){
 if(!Object.prototype.hasOwnProperty.call(groups,key))return;
 selected=key;
 const target=document.getElementById('survey-panel');
 if(target)target.outerHTML=view();else render();
};
window.downloadSurveyAggregate=function(){
 const rows=[['cohort','n','question','category','count','share_pct']];
 const write=(group,question,values,counts)=>{
  values.forEach((value,i)=>rows.push([group,groups[group].n,question,value,counts[i],(100*counts[i]/groups[group].n).toFixed(2)]));
 };
 Object.keys(groups).forEach(key=>{
  const g=groups[key];
  write(key,'most_frequent_brand',labels.favorite.map(a=>a[1]),g.fav);
  write(key,'purchase_purpose',labels.purpose.map(a=>a[1]),g.purpose);
  write(key,'barrier_to_substitution',labels.barriers.map(a=>a[1]),g.barriers);
  write(key,'price_rise_10_percent',labels.rise,g.rise);
  g.pairs.forEach((counts,i)=>write(key,labels.pair[i].join(' -> '),labels.responses.map(a=>a[1]),counts));
 });
 const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');
 link.href=url;link.download='tassay_survey_aggregated_2026-11-13.csv';
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
};
sections[27]=tr('Сауалнама · өзара алмастырылу','Опрос · взаимозаменяемость');
pages[27]=view;
})();