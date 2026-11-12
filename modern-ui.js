/* Modern editorial interface and EAEU case-law layer.
   Loaded after km3.js and ru.js to retain existing data/models and admin functions. */
(function(){
  'use strict';
  const t=(kk,ru)=>typeof KM3_RU!=='undefined'&&KM3_RU?ru:kk;
  const asText=(s)=>typeof esc==='function'?esc(s):String(s);
  const storeOrder=['Arbuz','SMALL','Galmart'];
  const brandOrder=[['TASSAY','TASSAY','T'],['TURAN','TURAN','U'],['ESSENTUKI4','Ессентуки №4','E']];
  const sourcePdf='https://tassay-market-monitor.onrender.com/publications/eek-practice-source';
  // Restore the research sections to the main navigation; group prices by brand.
  const primary=[
    [0,t('Шолу','Обзор')],
    [2,t('Бағалар','Цены'),"selectPriceView('all')"],
    [1,t('Баға динамикасы','Динамика цен'),"selectDynamicsView('tassay')"],
    [4,t('Астана нарығы','Рынок Астаны')],
    [6,t('Сыртқы факторлар','Внешние факторы')],
    [7,t('Дәлелдемелер','Доказательства')],
    [16,t('Құқықтық талдау','Правовой анализ')],
    [18,t('ЕЭК және ЕАЭО Соты','ЕЭК и Суд ЕАЭС')],
    [19,t('Мақала және брошюра','Статья и брошюра')],
    [26,t('Зерттеу тарихы · БШ1–БШ4','История исследования · БШ1–БШ4')],
    [9,t('Құқықтық дереккөздер','Правовые источники')]
  ];
  const secondary=[3,5,8,10,11,14,15,17,20,23,24,25];
  // City-to-city comparisons are intentionally removed from public navigation.

  const originalRender=render;
  function modernSidebar(){
    const el=document.getElementById('nav');
    if(!el)return;
    const btn=(i,label,action)=>'<button type="button" class="nav'+(page===i?' active':'')+'" onclick="'+(action||('nav('+i+')'))+'">'+asText(label)+'</button>';
    el.innerHTML='<div class="mini-nav-heading">'+t('НЕГІЗГІ БӨЛІМДЕР','ОСНОВНЫЕ РАЗДЕЛЫ')+'</div>'+
      primary.map(x=>btn(x[0],x[1],x[2])).join('')+
      '<details class="research-archive" '+(secondary.includes(page)?'open':'')+'><summary>'+
      t('Барлық зерттеу материалдары','Архив и дополнительные разделы')+'</summary>'+
      secondary.map(i=>btn(i,sections[i]||t('Қосымша бөлім','Дополнительный раздел'))).join('')+'</details>'+
      '<a class="nav-resource" href="/publication">'+t('Рецензияға дайын ғылыми мақала','Научная статья для подачи')+'</a>';
    const meta=document.querySelector('aside > p');
    if(meta)meta.textContent=t('Ашық зерттеу платформасы · 2026','Открытая исследовательская платформа · 2026');
  }
  const daysSorted=()=>[...new Set(km3AutoArchive.observations.filter(x=>x.city==='Астана').map(x=>x.day))].sort();
  const latestFor=(brand,shop)=>{
    const all=km3AutoArchive.observations.filter(x=>x.city==='Астана'&&x.brand===brand&&x.shop===shop&&Number.isFinite(x.price))
       .sort((a,b)=>b.day.localeCompare(a.day));
    return all[0]||null;
  };
  const fPrice=(p)=>p?Number(p.price).toLocaleString('ru-RU')+' ₸':'—';
  function observationNote(){
    const total=km3AutoArchive.observations.length;
    const recovered=km3AutoArchive.observations.filter(x=>x.source_method==='historical_price_history'||x.source_method==='historical_price_chart_derived').length;
    return t('Астана қаласы · 1 литр газдалған су · '+total+' жазба · оның '+recovered+'-і баға тарихынан қалпына келтірілді. Бөлшек бағалар келісімді дәлелдемейді.',
       'Астана · газированная вода 1 л · '+total+' записей · '+recovered+' из них восстановлены по истории цен. Розничные цены не доказывают сговор.');
  }
  function modernHome(){
    const last=daysSorted().at(-1), stats=km3AutoArchive.observations.length;
    const links=[
      '<button class="btn" onclick="nav(22)">'+t('Бағаларды қарау','Смотреть цены')+'</button>',
      '<button class="btn outline" onclick="nav(18)">'+t('ЕЭК істерін талдау','Практика ЕЭК')+'</button>'
    ].join('');
    const descriptions={
      TASSAY:t('Қазақстанда өндірілетін табиғи газдалған ауыз су, 1 л.','Природная газированная питьевая вода казахстанского производства, 1 л.'),
      TURAN:t('Қазақстандық газдалған су бренді, 1 л.','Казахстанская газированная вода, 1 л.'),
      ESSENTUKI4:t('Ресейде өндірілетін емдік-асханалық минералды газдалған су, 1 л.','Газированная лечебно-столовая минеральная вода из России, 1 л.')
    };
    const productPhotos={
      TASSAY:'/media/tassay-card',
      TURAN:'/media/turan-card',
      ESSENTUKI4:'/media/essentuki-card'
    };
    const cards=brandOrder.map(([id,name,initial])=>{
      const current=latestFor(id,'Arbuz');
      return '<article class="price-card product-overview-card"><div class="product-overview-image"><img src="'+productPhotos[id]+'" alt="'+asText(name)+' · '+t('газдалған су 1 л','газированная вода 1 л')+'" loading="lazy"></div><div class="brand-mini"><i>'+initial+'</i>'+
       '<div><div class="label">'+t('1 л · Газдалған','1 л · Газированная')+'</div><h3>'+name+'</h3></div></div>'+
       '<p class="product-overview-description">'+asText(descriptions[id])+'</p>'+
       '<div class="price-large">'+fPrice(current)+'</div>'+
       '<p class="price-sub">Arbuz · '+(current?asText(current.day):t('Баға жүктелуде','Данные загружаются'))+
       '</p><a href="#" onclick="nav(22);return false">'+t('Күндер мен дүкендер бойынша ↗','По дням и магазинам ↗')+'</a></article>';
    }).join('');
    return '<section class="editorial-hero"><div class="hero-eyebrow">TASSAY MARKET MONITOR / MNU</div>'+
      '<h2 class="research-question">'+t('TASSAY, TURAN және Ессентуки №4 бір тауар нарығында бәсекелесе ме?','Конкурируют ли TASSAY, TURAN и Ессентуки №4 на одном товарном рынке?')+'</h2>'+
      '<p>'+t('Бағалардың салыстырмалы мониторингі, тұтынушылардың өзара алмастыру таңдауы және ҚР мен ЕАЭО бәсекелестік құқығы бойынша талдау.',
        'Сравнительный мониторинг цен, исследование потребительской взаимозаменяемости и анализ по конкурентному праву Казахстана и ЕАЭС.')+'</p>'+
      '<div class="row">'+links+'</div><div class="editorial-meta">'+
      '<span>'+t('3 өнім','3 бренда')+'</span><span>Arbuz · SMALL · Galmart</span>'+
      '<span>'+t('Күн сайынғы бақылау','Ежедневный мониторинг')+'</span></div></section>'+
      '<div class="research-access"><span style="font-size:20px">↗</span><div><strong>'+
      t('Қашықтан қолжетімді зерттеу','Публичный доступ к исследованию')+'</strong><div>'+
      'https://tassay-market-monitor.onrender.com/ru · /kk</div></div></div>'+
      '<div class="overview-heading"><div><h2>'+t('Зерттелетін үш тауар','Три исследуемых товара')+
      '</h2><p>'+t('Arbuz дүкені бойынша бір күнгі бағаларды салыстыру','Сравнение цен одного магазина Arbuz')+'</p></div>'+
      '<a href="#" onclick="nav(22);return false">'+t('Барлық дерек →','Все данные →')+'</a></div>'+
      '<section class="price-board">'+cards+'</section>'+
      '<div class="overview-insight">'+
       '<section class="panel"><h3>'+t('Баға динамикасы · бір график','Динамика цен · один график')+'</h3>'+
        '<div class="hero-chart">'+km3AutoPriceGraph()+'</div></section>'+
       '<section class="panel"><h3>'+t('Зерттеудің негізгі нәтижесі','Главный вывод исследования')+'</h3>'+
        '<p>'+t('Бағалардың әртүрлі болуы картель немесе үстемдікті теріс пайдалану фактісін өздігінен дәлелдемейді.',
         'Разница в цене сама по себе не свидетельствует о картеле или злоупотреблении доминированием.')+'</p>'+
        '<ul><li>'+t('Релевантты тауар нарығын анықтау керек','Необходимо определить границы товарного рынка')+'</li>'+
        '<li>'+t('Басшылардың таныстығы дәлел емес','Знакомство руководителей не является доказательством')+'</li>'+
        '<li>'+t('ЕЭК құзыреті трансшекаралық өлшемге тәуелді','Компетенция ЕЭК зависит от трансграничности рынка')+'</li></ul>'+
        '<button class="btn outline" onclick="nav(16)">'+t('IRAC талдау','Открыть IRAC')+'</button></section>'+
      '</div><p class="overview-note">'+asText(observationNote())+'</p>'+
      '<div class="overview-heading"><div><h2>'+t('Зерттеу материалдары','Материалы исследования')+'</h2>'+
      '<p>'+t('Негізгі материалға бір қадамда өту','Переход к разделу в один клик')+'</p></div></div>'+
      '<section class="research-links">'+
      '<a class="research-link" href="#" onclick="nav(18);return false"><span>⚖</span><strong>'+t('ЕЭК практикасы','Практика ЕЭК')+'</strong><small>'+
      t('4 іс, нақты аналогия және құқықтық қорытынды','4 дела, применение по аналогии, правовой вывод')+'</small></a>'+
      '<a class="research-link" href="/publication"><span>▤</span><strong>'+t('Ғылыми мақала','Научная статья')+'</strong><small>'+
      t('Аңдатпа, әдіснама, нәтижелер, дереккөздер','Аннотация, методика, результаты, литература')+'</small></a>'+
      '<a class="research-link" href="/brochure"><span>◈</span><strong>'+t('Зерттеу брошюрасы','Брошюра исследования')+'</strong><small>'+
      t('Негізгі сандар мен қорытындылар · баспаға ыңғайлы','Ключевые цифры и выводы · готово к печати')+'</small></a></section>';
  }
  function modernDaily(){
    const obs=[...km3AutoArchive.observations].filter(x=>x.city==='Астана'&&x.status==='auto_unverified')
       .sort((a,b)=>b.day.localeCompare(a.day)||a.brand.localeCompare(b.brand));
    const end=daysSorted().at(-1)||'—';
    const table=obs.map(r=>'<tr><td>'+asText(r.day)+'</td><td>'+
      asText(r.brand==='ESSENTUKI4'?'Ессентуки №4':r.brand)+'</td><td>'+asText(r.shop)+'</td><td><strong>'+
      fPrice(r)+'</strong></td><td>'+
      (r.source_method?.startsWith('historical')?t('Тарихи деректен қалпына келтірілген','Восстановлено из истории цен'):
        t('Автоматты бақылау','Автоматическое наблюдение'))+
      '</td></tr>').join('');
    return '<div class="overview-heading"><div><h2>'+t('Күнделікті баға мониторингі','Ежедневный мониторинг цен')+'</h2>'+
     '<p>Arzan.kz · Астана · '+asText(end)+'</p></div><a href="https://arzan.kz/ru/astana" target="_blank" rel="noopener">Arzan.kz ↗</a></div>'+
     '<div class="research-access"><span>✓</span><div>'+asText(observationNote())+'</div></div>'+
     '<section class="panel"><h3>'+t('Дүкен бойынша динамика','Динамика по магазину')+'</h3>'+
       km3AutoPriceGraph()+'</section>'+
     '<section class="panel"><h3>'+t('Толық баға мұрағаты','Полный архив цен')+'</h3>'+
     '<p>'+t('Күн сайын бақыланған және кейіннен тарих арқылы қалпына келтірілген бағалар жеке белгіленді. Қайта қалпына келтіру нақты сол күні жасалған тексеру емес.',
     'Цены утренних проверок и восстановленные по истории помечены отдельно. Реконструкция не является самостоятельным замером в эту дату.')+'</p>'+
     '<div class="km2-table"><table><thead><tr><th>'+t('Күні','Дата')+'</th><th>'+t('Тауар','Товар')+
     '</th><th>'+t('Дүкен','Магазин')+'</th><th>'+t('Баға','Цена')+'</th><th>'+t('Түрі','Тип данных')+
     '</th></tr></thead><tbody>'+table+'</tbody></table></div></section>';
  }
  const caseItems=[
   {year:'2017 / 2020',name:'НЛМК / ВИЗ-Сталь',id:'№ 130 → № 99',pages:'16–31',
   kk:'ЕЭК Беларусь пен Қазақстандағы сатып алушыларға Ресеймен салыстырғанда 5,3–23% үстеме коэффициентін қолдануды қарастырды. Кейін іс 2020 жылғы №99 шешіммен тоқтатылды.',
   ru:'ЕЭК изучала повышающие коэффициенты 5,3–23% для покупателей Беларуси и Казахстана по сравнению с Россией. Позднее производство прекращено решением №99 (2020).',
   lessonK:'Импорттық су бағасының жоғары болуы үшін ғана үстемдікті теріс пайдалану белгіленбейді: нарықтағы үстем жағдай, салыстырылатын өткізу шарттары және негіздеме тексерілуі тиіс.',
   lessonR:'Высокая цена импортной воды сама по себе не доказывает злоупотребление: нужны данные о доминировании, сопоставимости условий и обосновании различий.'},
   {year:'2019 / 2020',name:'«Дельрус» / «Дельрус РК»',id:'№ 165; апелляция 06.11.2020',pages:'63–80; 225–239',
   kk:'ЕЭК аумақтық нарықты бөлу туралы қорытынды жасаған. Алайда ЕАЭО Сотының апелляциялық палатасы компаниялардың бәсекелес екені мерзімінен бұрын танылды деп №165 шешімін Шартқа сәйкес емес деп тапты.',
   ru:'ЕЭК квалифицировала территориальный раздел рынка. Однако Апелляционная палата Суда ЕАЭС признала решение №165 не соответствующим праву Союза: конкурентные отношения установлены преждевременно.',
   lessonK:'TASSAY, TURAN, Ессентуки №4 арасындағы өзара алмастырылуды және меншік/бақылау қатынастарын анықтамай «картель» деуге болмайды.',
   lessonR:'Без доказанной взаимозаменяемости товаров, конкурентных отношений и проверки контроля нельзя квалифицировать три бренда как картель.'},
   {year:'2020',name:'Cochlear / Pharm Express',id:'№ 88',pages:'81–103',
   kk:'Дистрибьюторлардың аумақ бойынша сатуды шектеуі шарттармен, өз елінен тыс сатудан бас тартуымен және нақты әрекеттермен бекітілген.',
   ru:'Территориальное разграничение сбыта подтверждалось условиями дистрибьюторских договоров, отказами от поставок и практикой продаж.',
   lessonK:'Су өндірушілеріне осындай қорытынды жасау үшін жеткізу шарттары, аумақтық шектеулер не нақты келісім дәлелі қажет; тек баға жеткіліксіз.',
   lessonR:'Для аналогичного вывода по воде нужны договоры, территориальные запреты или факты соглашения; одних цен недостаточно.'},
   {year:'2019',name:'«Атамекен» / Соттың консультативтік қорытындысы',id:'18.06.2019',pages:'298–308',
   kk:'Сот бір әрекет ұлттық және трансшекаралық нарықта қатар бұзушылық туғызғанда, тиісті өлшемдер орындалса, ЕЭК-тің айрықша құзыреті туындайтынын түсіндірді.',
   ru:'Суд разъяснил исключительную компетенцию ЕЭК при одновременном нарушении на внутреннем и трансграничном рынке, если выполнены соответствующие критерии.',
   lessonK:'Ессентуки Ресейде өндірілсе де, Қазақстандағы бөлшек сауданың өзі трансшекаралық нарықты дәлелдемейді.',
   lessonR:'Российское происхождение Ессентуки само по себе не доказывает трансграничный рынок и юрисдикцию ЕЭК.'}
  ];
  function modernCases(){
    const cards=caseItems.map(c=>'<article class="case-card"><div class="case-date">'+asText(c.year)+' • '+asText(c.id)+'</div>'+
      '<h3>'+asText(c.name)+'</h3><p>'+asText(t(c.kk,c.ru))+'</p>'+
      '<p class="case-lesson"><strong>'+t('Біздің зерттеуге аналогия:','Аналогия для нашей платформы:')+'</strong> '+
      asText(t(c.lessonK,c.lessonR))+'</p><div class="case-reference">'+
      t('Жинақтағы беттер:','Страницы в сборнике:')+' '+asText(c.pages)+
      ' · '+t('2017–2021 жж. практика','Практика 2017–2021 гг.')+'</div></article>').join('');
    return '<div class="editorial-hero"><div class="hero-eyebrow">'+t('ҚҰҚЫҚТЫҚ АНАЛОГИЯ','ПРАВОВЫЕ АНАЛОГИИ')+'</div>'+
      '<h2>'+t('ЕЭК және ЕАЭО Сотының практикасы','Практика ЕЭК и Суда ЕАЭС')+'</h2>'+
      '<p>'+t('Оқытушы ұсынған 320 беттік «Практика ЕЭК и Суда ЕАЭС по вопросам конкуренции и антимонопольного регулирования за 2017–2021 гг.» жинағы бойынша төрт іс.',
      'Анализ четырёх дел из представленного преподавателем 320-страничного сборника практики ЕЭК и Суда ЕАЭС за 2017–2021 годы.')+
      '</p><div class="row"><button class="btn outline" onclick="nav(16)">IRAC →</button>'+
      '<a class="btn" href="/publication" style="display:inline-block;background:#fff;color:#13595a;text-decoration:none;padding:11px 15px;border-radius:11px;font-weight:760">'+
      t('Толық мақала ↗','Полная статья ↗')+'</a></div></div>'+
      '<div class="overview-heading"><div><h2>'+t('Төрт іс · төрт құқықтық сабақ','Четыре дела · четыре правовых урока')+'</h2>'+
      '<p>'+t('Бұл істер су бағасы бойынша нақты шешім емес, құқықтық аналогия','Это правовые аналогии, а не решения по рынку воды')+'</p></div></div>'+
      '<section class="legal-case-grid">'+cards+'</section>'+
      '<section class="panel"><h3>'+t('Нәтиже · IRAC әдісіне қолдану','Вывод · применение в IRAC')+'</h3>'+
      '<p>'+t('Үш тауардың бағасын салыстыруды картельді растау деп қабылдауға болмайды. Дәлелдемелер үшін бәсекелестік қатынастарды, ықтимал келісімді, нарық шекарасын, сату шарттарын және нақты әсерді тексеру қажет. «Дельрус» ісінің апелляциялық нәтижесін есепке алу міндетті.',
      'Таблица розничных цен не доказывает картель. Необходимо установить статус конкурентов, соглашение или согласованные действия, границы рынка, условия поставок и последствия. Итог апелляции по делу «Дельрус» обязателен для корректной аналогии.')+
      '</p><p class="overview-note">'+t('Дереккөз: ЕЭК және ЕАЭО Соты практикасының жинағы, 2021 ж., 319 б. Мәтін тарихи 2017–2021 жж. практикасын талдайды.',
      'Источник: сборник практики ЕЭК и Суда ЕАЭС, 2021 г., 319 с. Рассматривается историческая практика 2017–2021 гг.')+
      '</p></section>';
  }
  function modernPublications(){
    return '<div class="editorial-hero"><div class="hero-eyebrow">'+t('КМ3 · ҒЫЛЫМИ НӘТИЖЕЛЕР','КМ3 · НАУЧНЫЕ МАТЕРИАЛЫ')+'</div>'+
      '<h2>'+t('Мақала және зерттеу брошюрасы','Научная статья и брошюра')+'</h2>'+
      '<p>'+t('Жариялауға әзірленген толық академиялық қолжазба және оқырманға арналған қысқаша брошюра. Екеуінде де нақты деректер, құқықтық аналогиялар және дереккөздер көрсетілген.',
      'Полный академический текст для подачи в издание и краткая презентационная брошюра с данными, аналогиями и источниками.')+'</p></div>'+
      '<section class="research-links" style="grid-template-columns:repeat(auto-fit,minmax(270px,1fr))">'+
      '<article class="paper-card"><div class="paper-icon">▤</div><div><h3>'+t('Ғылыми мақала','Научная статья')+'</h3>'+
      '<p>'+t('Аңдатпа, түйін сөздер, кіріспе, әдіснама, нәтижелер, талқылау, ЕЭК тәжірибесі, IRAC, библиография және ЖИ мәлімдемесі.',
      'Аннотация, ключевые слова, введение, методика, результаты, практика ЕЭК, IRAC, библиография и декларация ИИ.')+'</p>'+
      '<div class="paper-actions"><a href="/publication" class="btn" target="_blank" rel="noopener">'+
      t('Мақаланы ашу ↗','Открыть статью ↗')+'</a></div></div></article>'+
      '<article class="paper-card"><div class="paper-icon">◈</div><div><h3>'+t('Брошюра','Брошюра')+'</h3>'+
      '<p>'+t('Үш өнім, бір күнгі салыстыру, бағаның ықтимал факторлары, төрт ЕЭК аналогиясы, методологиялық шектеулер және веб-платформаға сілтеме.',
      'Три продукта, сравнение цен, экономические факторы, четыре аналога ЕЭК, ограничения и ссылка на онлайн-платформу.')+'</p>'+
      '<div class="paper-actions"><a href="/brochure" class="btn" target="_blank" rel="noopener">'+
      t('Брошюраны ашу ↗','Открыть брошюру ↗')+'</a></div></div></article></section>'+
      '<section class="panel"><h3>'+t('Жариялау мәртебесі','Статус публикации')+'</h3><p>'+
      t('Мақала құрылымы дайын: мәтін, деректер, құқықтық дереккөздер мен сілтемелер енгізілді. Бұл жарияланған мақала емес; журналға жіберер алдында талап етілген авторлық деректерді, редакциялық үлгіні және бірегейлік талаптарын тексеру қажет.',
      'Текст подготовлен для подачи, но не опубликован и не принят редакцией. Перед отправкой необходимо проверить требования выбранного журнала, авторские реквизиты и оригинальность.')+
      '</p></section>';
  }
  // Each brand keeps its original evidence/screenshots and detailed charts.
  // Grouping changes navigation only; no observation data or original pages are deleted.
  const preservedPricePages={
    tassay:pages[2],
    turan:pages[12],
    essentuki:pages[21],
    all:modernDaily
  };
  const preservedDynamics={
    tassay:pages[1],
    turan:pages[13]
  };
  let priceView='all';
  let dynamicsView='tassay';
  const priceViews=[
    ['all',t('Барлық бағалар','Все цены')],
    ['tassay','TASSAY'],
    ['turan','TURAN'],
    ['essentuki','Ессентуки №4']
  ];
  const dynamicsViews=[
    ['tassay','TASSAY'],
    ['turan','TURAN'],
    ['essentuki','Ессентуки №4'],
    ['all',t('Үш бренд','Три бренда')]
  ];
  function tabBar(options,current,callback,caption){
    return '<div class="brand-tabs-container"><div class="brand-tabs-title">'+asText(caption)+'</div>'+
      '<div class="brand-tabs" role="tablist" aria-label="'+asText(caption)+'">'+
      options.map(([key,label])=>
        '<button type="button" role="tab" aria-selected="'+(current===key?'true':'false')+
        '" class="brand-tab'+(current===key?' active':'')+'" onclick="'+callback+'(\''+key+'\')">'+
        asText(label)+'</button>').join('')+
      '</div></div>';
  }
  pages[2]=function(){
    return '<div class="overview-heading"><div><h2>'+t('Бағалар және дәлелдемелер','Цены и доказательства')+'</h2>'+
      '<p>'+t('Брендті таңдаңыз: тиісті кесте, скриншоттар және дереккөздер ашылады.',
      'Выберите бренд: откроются его таблица, скриншоты и источники.')+'</p></div></div>'+
      tabBar(priceViews,priceView,'selectPriceView',t('Тауар бойынша ауыстыру','Переключение по брендам'))+
      '<div id="brand-price-page">'+(preservedPricePages[priceView]||modernDaily)()+'</div>';
  };
  pages[1]=function(){
    const cDetails=typeof km3CChart==='function'?km3CChart('abs'):'';
    const content=dynamicsView==='all'?
      '<section class="panel"><h3>'+t('Үш брендтің күнделікті динамикасы','Ежедневная динамика трёх брендов')+
      '</h3>'+km3AutoPriceGraph()+'</section>':
      dynamicsView==='essentuki'?
      '<section class="panel"><h3>'+t('Ессентуки №4 · баға динамикасы','Ессентуки №4 · динамика цен')+
      '</h3><p class="km2-muted">'+t('Тарихи бақылаулар; нақты күндерді тексеріңіз.',
      'Исторические наблюдения; обратите внимание на реальные даты.')+
      '</p><div id="km3CChart">'+cDetails+'</div><button class="btn outline" onclick="selectPriceView(\'essentuki\')">'+
      t('Скриншоттар мен кесте','Скриншоты и таблица')+'</button></section>':
      preservedDynamics[dynamicsView]();
    return '<div class="overview-heading"><div><h2>'+t('Баға динамикасы','Динамика цен')+'</h2>'+
      '<p>'+t('Графиктер бір-бірден көрсетіледі','Графики показаны по одному')+'</p></div></div>'+
      tabBar(dynamicsViews,dynamicsView,'selectDynamicsView',t('Графикті таңдау','Выберите график'))+
      '<div id="brand-dynamics-page">'+content+'</div>';
  };
  // Used by actual buttons; switching does not add more sidebar items.
  window.selectPriceView=function(which){
    if(!Object.prototype.hasOwnProperty.call(preservedPricePages,which))which='all';
    priceView=which;page=2;document.querySelector('aside')?.classList.remove('open');render();
    window.scrollTo({top:0,behavior:'instant'});
  };
  window.selectDynamicsView=function(which){
    if(!dynamicsViews.some(([key])=>key===which))which='tassay';
    dynamicsView=which;page=1;document.querySelector('aside')?.classList.remove('open');render();
    window.scrollTo({top:0,behavior:'instant'});
  };
  const oldIRAC=pages[16];
  pages[0]=modernHome;
  pages[22]=modernDaily;
  pages[18]=modernCases;
  pages[19]=modernPublications;
  pages[16]=function(){
    return '<section class="research-access"><span>⚖</span><div>'+
      t('ЕЭК және ЕАЭО Сотының төрт нақты ісі бойынша аналогиялық талдау жаңа бөлімде берілген.',
      'Четыре судебные аналогии из практики ЕЭК и Суда ЕАЭС разобраны в отдельном разделе.')+
      ' <button class="btn outline" onclick="nav(18)">'+t('Талдауды ашу','Открыть практику')+'</button></div></section>'+oldIRAC();
  };
  render=function(){originalRender();modernSidebar()};
  const originalNav=nav;
  nav=function(i){
    if(i===2){priceView='tassay';i=2}
    else if(i===12){priceView='turan';i=2}
    else if(i===21){priceView='essentuki';i=2}
    else if(i===22){priceView='all';i=2}
    else if(i===1){dynamicsView='tassay'}
    else if(i===13){dynamicsView='turan';i=1}
    originalNav(i);
    if(typeof window!=='undefined')window.scrollTo({top:0,behavior:'instant'});
  };
  if(typeof document!=='undefined')document.body.classList.add('light');
  if(data.length)render();
})();
