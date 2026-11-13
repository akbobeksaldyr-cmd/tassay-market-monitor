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
  // The full-width reference layout uses a top navigation; all other views
  // remain available from a clearly labeled additional-sections menu.
  const primary=[
    [0,t('Шолу','Обзор')],
    [2,t('Бағалар','Цены'),"selectPriceView('all')"],
    [1,t('Динамика','Динамика'),"selectDynamicsView('tassay')"],
    [4,t('Астана нарығы','Рынок Астаны')],
    [27,t('Сауалнама','Опрос')],
    [16,t('Құқықтық талдау','Правовой анализ')],
    [26,t('БШ1–БШ4 тарихы','История БШ1–БШ4')],
    [9,t('Дереккөздер','Источники')]
  ];
  const secondary=[6,7,18,19,3,5,8,10,11,14,15,17,20,23,24,25];

  const originalRender=render;
  function modernSidebar(){
    const el=document.getElementById('nav');
    if(!el)return;
    const btn=(i,label,action)=>'<button type="button" class="nav'+(page===i?' active':'')+
      '" onclick="'+(action||('nav('+i+')'))+'">'+asText(label)+'</button>';
    el.innerHTML=primary.map(x=>btn(x[0],x[1],x[2])).join('')+
      '<details class="research-archive" '+(secondary.includes(page)?'open':'')+'>'+
      '<summary>'+t('Қосымша','Ещё')+'</summary><div class="nav-more-list">'+
      secondary.map(i=>btn(i,sections[i]||t('Қосымша бөлім','Дополнительный раздел'))).join('')+
      '<a class="nav-resource" href="/publication">'+t('Ғылыми мақала','Научная статья')+'</a>'+
      '</div></details>';
    const meta=document.querySelector('aside > p');
    if(meta)meta.textContent=t('Ашық академиялық зерттеу · 2026','Открытое академическое исследование · 2026');
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
    const descriptions={
      TASSAY:t('Қазақстанда өндірілетін табиғи газдалған ауыз су, 1 л.','Природная газированная питьевая вода казахстанского производства, 1 л.'),
      TURAN:t('Қазақстандық газдалған су, 1 л.','Казахстанская газированная вода, 1 л.'),
      ESSENTUKI4:t('Ресейде өндірілетін емдік-асханалық минералды газдалған су, 1 л.','Газированная лечебно-столовая минеральная вода из России, 1 л.')
    };
    // Landing visuals are CSS illustrations; original product images remain in evidence pages.
    const visualKinds={
      TASSAY:t('Газдалған ауыз су','Газированная питьевая вода'),
      TURAN:t('Газдалған су','Газированная вода'),
      ESSENTUKI4:t('Емдік-асханалық минералды су','Лечебно-столовая минеральная вода')
    };
    const brands=brandOrder.map(([id,name,initial])=>{
      const current=latestFor(id,'Arbuz');
      return '<article class="price-card product-overview-card"><div class="product-overview-image product-overview-graphic product-visual-'+id.toLowerCase()+'">'+
        '<span class="product-visual-overline">MARKET STUDY / 01 L</span>'+
        '<strong class="product-visual-wordmark">'+asText(name)+'</strong>'+
        '<span class="product-visual-rule" aria-hidden="true"></span>'+
        '<small>'+asText(visualKinds[id])+'</small></div>'+
        '<div class="brand-mini"><i>'+initial+'</i><div><div class="label">'+t('1 л · Газдалған','1 л · Газированная')+'</div>'+
        '<h3>'+asText(name)+'</h3></div></div>'+
        '<p class="product-overview-description">'+asText(descriptions[id])+'</p>'+
        '<div class="price-large">'+fPrice(current)+'</div>'+
        '<p class="price-sub">Arbuz · '+(current?asText(current.day):t('Баға расталмаған','Цена не подтверждена'))+'</p>'+
        '<a href="#" onclick="nav(22);return false">'+t('Барлық бағаны көру ↗','Посмотреть все цены ↗')+'</a></article>';
    }).join('');
    const productVisual=brandOrder.map(([id,name],index)=>
      '<div class="hero-product-card hero-product-'+id.toLowerCase()+'">'+
        '<span class="hero-card-badge">0'+(index+1)+'</span>'+
        '<span class="hero-card-watermark" aria-hidden="true">'+(id==='ESSENTUKI4'?'№4':name[0])+'</span>'+
        '<div class="hero-card-bottom"><strong>'+asText(name)+'</strong>'+
        '<p>'+asText(visualKinds[id])+'</p>'+
        '<span class="hero-card-size">01 L / ASTANA</span></div></div>').join('');
    const parts=[
      {to:22,name:t('Баға мониторингі','Мониторинг цен'),
       desc:t('Астанадағы дүкендер бойынша үш брендтің бағасы және уақыттық өзгерісі.',
              'Цены трёх брендов в магазинах Астаны и их изменение по датам.'),
       // The miniature card uses an intentionally compact illustration.
       // The full, interactive graph remains in the dedicated Dynamics page.
       art:'<div class="feature-media feature-price">'+
         '<div class="feature-price-top"><span>ASTANA · 1 L</span><span>Arbuz / SMALL / Galmart</span></div>'+
         '<svg class="feature-price-svg" viewBox="0 0 300 122" aria-hidden="true" preserveAspectRatio="xMidYMid meet">'+
           '<path d="M8 30H292 M8 59H292 M8 88H292 M8 116H292" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity=".58"/>'+
           '<polyline points="8,90 51,80 93,82 135,52 176,64 218,45 263,40 292,27" fill="none" stroke="#347e74" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/>'+
           '<polyline points="8,97 51,95 93,79 135,84 176,77 218,61 263,73 292,64" fill="none" stroke="#9d855f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+
           '<polyline points="8,105 51,102 93,99 135,92 176,98 218,86 263,90 292,82" fill="none" stroke="#7285a9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+
           '<circle cx="263" cy="40" r="5" fill="#347e74" stroke="#f2f7f3" stroke-width="2"/>'+
         '</svg>'+
         '<div class="feature-price-legend"><span><i class="feature-dot dot-tassay"></i>TASSAY</span>'+
         '<span><i class="feature-dot dot-turan"></i>TURAN</span>'+
         '<span><i class="feature-dot dot-ess"></i>'+t('Ессентуки №4','Ессентуки №4')+'</span></div>'+
         '</div>'},
      {to:27,name:t('Тұтынушылар сауалнамасы','Опрос потребителей'),
       desc:t('20 аралық жауап: сатып алушылардың тауарларды алмастыруға дайындығы.',
              '20 промежуточных ответов о готовности покупателей заменять бренды.'),
       art:'<div class="feature-media feature-survey"><div class="feature-donut"><span>20<small>'+
         t('жауап','ответов')+'</small></span></div></div>'},
      {to:16,name:t('Құқықтық талдау','Правовой анализ'),
       desc:t('Қазақстан және ЕАЭО құқығы, дәлелдер, қарсы уәждер және IRAC қорытындысы.',
              'Право Казахстана и ЕАЭС, доказательства, контраргументы и вывод IRAC.'),
       art:'<div class="feature-media feature-law"><div class="law-book"><strong>⚖</strong><span>IRAC</span></div></div>'},
      {to:26,name:t('БШ1–БШ4 тарихы','История БШ1–БШ4'),
       desc:t('Зерттеудің төрт кезеңі, түзетулер және бастапқы скриншоттар.',
              'Четыре этапа исследования, корректировки и исходные скриншоты.'),
       art:'<div class="feature-media feature-history"><div class="feature-stage-line">'+
          ['БШ1','БШ2','БШ3','БШ4'].map(n=>'<span>'+n+'</span>').join('')+'</div></div>'}
    ];
    const features=parts.map(p=>
      '<button type="button" class="feature-card" onclick="nav('+p.to+')">'+p.art+
      '<span class="feature-info"><strong>'+p.name+'</strong><p>'+p.desc+'</p>'+
      '<span class="feature-arrow" aria-hidden="true">↗</span></span></button>').join('');
    const steps=[
      {icon:'01',title:t('Бағаларды жинау','Сбор цен'),
        desc:t('Arbuz, SMALL және Galmart дүкендеріндегі белгілі бір күндердегі ұсыныстарды және растайтын материалдарды тіркеу.',
          'Фиксация предложений Arbuz, SMALL и Galmart за определённые даты с подтверждающими материалами.')},
      {icon:'02',title:t('Брендтерді салыстыру','Сравнение брендов'),
        desc:t('Бағаларды бірдей көлемге келтіру, кезеңдерді салыстыру және өзгерістерді тексеру.',
          'Сопоставление цен за одинаковый объём и период с проверкой изменений.')},
      {icon:'03',title:t('Өзара алмастыру сауалнамасы','Опрос о взаимозаменяемости'),
        desc:t('Google Forms жауаптары арқылы тұтынушылардың болжамды таңдауын зерттеу; іріктеме шектеулерін көрсету.',
          'Изучение предполагаемого переключения по Google Forms с указанием ограничений выборки.')},
      {icon:'04',title:t('IRAC құқықтық талдауы','IRAC и правовой анализ'),
        desc:t('Құқықтық нормалар, фактілер, балама түсіндірмелер, қажет дәлелдер және ықтимал қорғау жолдары.',
          'Нормы, факты, альтернативные объяснения, недостающие доказательства и возможные способы защиты.')},
      {icon:'05',title:t('БШ4 платформасын қорғау','Защита платформы БШ4'),
        desc:t('БШ1–БШ4 тарихын, дереккөздерді және тексерілетін деректерді бір жерде сақтау.',
          'Единая точка доступа к истории БШ1–БШ4, первоисточникам и проверяемым данным.')}
    ];
    const process=steps.map(s=>'<div class="process-step"><span class="process-step-icon">'+s.icon+
      '</span><div><strong>'+s.title+'</strong><p>'+s.desc+'</p></div></div>').join('');
    const conclusions=[
      {icon:'≠',head:t('Баға айырмашылығы құқық бұзушылықты дәлелдемейді','Разница в цене не доказывает нарушение'),
       body:t('Баға айырмашылығының жеткізу, сату арнасы және акция сияқты балама себептері болуы мүмкін.',
              'Различия могут объясняться доставкой, каналом продаж, акциями и другими факторами.')},
      {icon:'◎',head:t('Сауалнама нарықты анықтауға көмектеседі','Опрос помогает определить рынок'),
       body:t('20 аралық жауап тауарларды ықтимал алмастыруды бағалауға көмектеседі, бірақ нарық үлесін есептемейді.',
              '20 промежуточных ответов помогают оценить заменяемость, но не определяют рыночные доли.')},
      {icon:'§',head:t('Қорытындыға тексерілетін деректер қажет','Выводы требуют проверяемых данных'),
       body:t('Заңдық баға беру бастапқы деректерге, құқықтық нормаларға, қарсы уәждерге және шектеулерге сүйенеді.',
              'Юридическая оценка опирается на первоисточники, нормы, контраргументы и ограничения.')}
    ];
    const summary=conclusions.map(c=>'<article class="landing-conclusion"><span class="conclusion-icon">'+
      c.icon+'</span><strong>'+c.head+'</strong><p>'+c.body+'</p></article>').join('');
    const usage=[['◈','Arbuz'],['▥','SMALL'],['▤','Galmart'],['◉','Google Forms'],['§','IRAC'],['⌘','GitHub / Render']];
    return '<div class="landing-home">'+
      '<section class="editorial-hero landing-hero"><div class="landing-copy">'+
        '<div class="hero-eyebrow">MNU · TASSAY MARKET MONITOR · 2026</div>'+
        '<h2 class="research-question">'+t('TASSAY, TURAN және Ессентуки №4: бәсекелестікті зерттеу',
          'Исследование конкуренции TASSAY, TURAN и Ессентуки №4')+'</h2>'+
        '<p>'+t('Астанадағы бағаларды салыстыру, тұтынушылардың алмастыру таңдауы және Қазақстан мен ЕАЭО бәсекелестік құқығы бойынша құқықтық бағалау.',
          'Сравнительный мониторинг цен, анализ взаимозаменяемости и правовая оценка по конкурентному праву Казахстана и ЕАЭС.')+'</p>'+
        '<div class="landing-actions"><button type="button" class="landing-cta" onclick="nav(22)">'+
          t('Зерттеуді ашу','Открыть исследование')+' <span aria-hidden="true">↗</span></button>'+
          '<button type="button" class="landing-cta landing-cta-ghost" onclick="nav(27)">'+
          t('Сауалнама нәтижелері','Результаты опроса')+'</button></div></div>'+
        '<div class="landing-photo-stage"><div class="landing-gridlines"></div>'+
        '<svg viewBox="0 0 620 280" aria-hidden="true" fill="none"><path d="M0 246L80 211L152 222L235 167L307 182L385 128L473 145L554 66L620 85" stroke="#2f8575" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
        '<path d="M0 267L80 238L152 240L235 199L307 212L385 161L473 178L554 102L620 122" stroke="#eef6ec" stroke-width="2" opacity=".8"/></svg>'+
        '<span class="landing-visual-caption">ASTANA / 3 PRODUCTS</span>'+
        '<div class="hero-product-cards">'+productVisual+'</div></div></section>'+
      '<section class="landing-about" aria-labelledby="landing-about-title">'+
        '<div><h2 id="landing-about-title">'+t('Жоба туралы','О проекте')+'</h2>'+
        '<p>'+t('TASSAY Market Monitor — бәсекелестік құқығы пәнінің БШ4 аясында дайындалған ашық академиялық зерттеу платформасы. Зерттеу Астана қаласындағы газдалған су ұсыныстары мен тауарлардың ықтимал алмастырылуын талдайды.',
          'TASSAY Market Monitor — открытая академическая платформа по конкурентному праву, подготовленная для БШ4. Исследование рассматривает предложения газированной воды в Астане и возможную взаимозаменяемость товаров.')+'</p>'+
        '<p>'+t('Біз бағаларды дереккөздермен салыстырамыз, қорытындыларды қайта қараймыз және құқықтық ұстанымды IRAC құрылымымен негіздейміз.',
          'Мы сопоставляем цены с первоисточниками, пересматриваем выводы по мере поступления данных и обосновываем правовую позицию по IRAC.')+'</p></div>'+
        '<div class="landing-stats">'+
          '<div class="landing-stat"><strong>3</strong><span>'+t('зерттелетін бренд','исследуемых бренда')+'</span></div>'+
          '<div class="landing-stat"><strong>3</strong><span>'+t('салыстырылатын дүкен','сравниваемых магазина')+'</span></div>'+
          '<div class="landing-stat"><strong>20</strong><span>'+t('аралық сауалнама жауабы','промежуточных ответов опроса')+'</span></div>'+
          '<div class="landing-stat"><strong>4</strong><span>'+t('БШ1–БШ4 зерттеу кезеңі','этапа исследования БШ1–БШ4')+'</span></div></div></section>'+
      '<div class="landing-usage"><span class="usage-heading">'+t('Дереккөздер мен құралдар','Источники и инструменты')+'</span>'+
        usage.map(x=>'<span class="usage-chip"><i aria-hidden="true">'+x[0]+'</i>'+x[1]+'</span>').join('')+'</div>'+
      '<section class="landing-section"><div class="landing-section-head"><div>'+
        '<h2 class="landing-section-title">'+t('Зерттеудің негізгі бөлімдері','Ключевые разделы исследования')+'</h2>'+
        '<p>'+t('Бір платформада баға, сауалнама, құқықтық ұстаным және зерттеу тарихы.',
          'Цены, опрос, правовой анализ и история исследования на одной платформе.')+'</p></div></div>'+
        '<div class="landing-features">'+features+'</div></section>'+
      '<section class="landing-products"><div class="landing-section-head"><div>'+
        '<h2 class="landing-section-title">'+t('Зерттелетін үш тауар','Три исследуемых товара')+'</h2>'+
        '<p>'+t('Астана · бір литрлік өнімдер · Arbuz бойынша соңғы қолжетімді деректер.',
          'Астана · позиции по 1 литру · последние доступные наблюдения по Arbuz.')+'</p></div>'+
        '<a class="landing-small-link" href="#" onclick="nav(22);return false">'+t('Баға мұрағаты ↗','Архив цен ↗')+'</a></div>'+
        '<div class="price-board">'+brands+'</div>'+
        '<p class="overview-note">'+asText(observationNote())+'</p></section>'+
      '<section class="landing-section"><div class="landing-section-head"><div>'+
        '<h2 class="landing-section-title">'+t('Зерттеу қалай жүргізіледі','Как устроено исследование')+'</h2>'+
        '<p>'+t('Бастапқы деректен құқықтық қорытындыға дейінгі бес қадам.',
          'Пять шагов: от первичных данных к проверяемым правовым выводам.')+'</p></div></div>'+
        '<div class="landing-process"><div class="landing-process-photo process-abstract">'+
          '<span class="process-tag">RESEARCH PROCESS / ASTANA</span>'+
          '<div class="process-graphic"><div class="process-graphic-eyebrow">'+
            t('ДЕРЕКТЕР','ДАННЫЕ')+'</div>'+
            '<div class="process-nodes">'+
              '<span class="process-node">Arbuz</span>'+
              '<span class="process-node">SMALL</span>'+
              '<span class="process-node">Galmart</span>'+
            '</div>'+
            '<div class="process-line" aria-hidden="true"><span>↓</span></div>'+
            '<div class="process-graphic-eyebrow">'+t('ЗЕРТТЕУ','ИССЛЕДОВАНИЕ')+'</div>'+
            '<div class="process-boxes">'+
              '<span class="process-box">Google Forms<small>'+t('20 жауап','20 ответов')+'</small></span>'+
              '<span class="process-box">IRAC<small>'+t('құқықтық талдау','правовая оценка')+'</small></span>'+
              '<span class="process-box">БШ4<small>'+t('қорғау','защита')+'</small></span>'+
            '</div>'+
          '</div>'+
          '<div class="process-floating"><strong>5</strong><span>'+t('зерттеу қадамы','этапов исследования')+'</span></div>'+
          '</div><div class="process-list">'+process+'</div></div></section>'+
      '<section class="landing-section"><div class="landing-section-head"><div>'+
        '<h2 class="landing-section-title">'+t('Аралық қорытындылар','Промежуточные выводы')+'</h2>'+
        '<p>'+t('Күдік пен дәлелді ажырататын негізгі әдістемелік қағидалар.',
          'Ключевые методические принципы: отделяем подозрение от доказательства.')+'</p></div></div>'+
        '<div class="landing-conclusions">'+summary+'</div></section>'+
      '<footer class="landing-more"><p>TASSAY Market Monitor · MNU · БШ4 · '+t('14 қараша 2026','14 ноября 2026')+
        '<br>'+t('Деректерге шектеулер қолданылады; ғылыми-оқу жобасы.','Академический проект с ограничениями данных.')+'</p>'+
        '<div class="research-links">'+
          '<a class="research-link" href="/publication"><strong>'+t('Ғылыми мақала ↗','Научная статья ↗')+'</strong></a>'+
          '<a class="research-link" href="/brochure"><strong>'+t('Брошюра ↗','Брошюра ↗')+'</strong></a>'+
          '<a class="research-link" href="#" onclick="nav(9);return false"><strong>'+t('Дереккөздер ↗','Источники ↗')+'</strong></a>'+
        '</div></footer></div>';
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
  render=function(){document.body.classList.toggle('site-home',page===0);originalRender();modernSidebar()};
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
