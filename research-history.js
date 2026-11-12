/* BSH1–BSH4 research evolution with verifiable GitHub snapshots and screenshots.
   Attach AFTER research-sections.js. No old prices, evidence or legal pages are overwritten. */
(function(){
  'use strict';
  const translate=(kk,ru)=>(typeof KM3_RU!=='undefined'&&KM3_RU)?ru:kk;
  const t=translate;
  const e=value=>(typeof esc==='function'?esc(value):String(value));
  const repo='https://github.com/akbobeksaldyr-cmd/tassay-market-monitor';
  const stages=[
    {
      id:'BSH1',date:'21.10.2026',brands:'TASSAY',short:t('Бастапқы мониторинг','Первоначальный мониторинг'),
      titleK:'БШ1 · TASSAY: бастапқы зерттеу',
      titleR:'БШ1 · TASSAY: исходное исследование',
      changeK:'Бір тауардың дүкендер мен күндер бойынша бағалары, алғашқы салыстырулар және скриншот дәлелдемелері енгізілді.',
      changeR:'Внесены цены одного бренда по датам и магазинам, первые сравнения и скриншоты-подтверждения.',
      resultK:'Бұл кезең TASSAY бағасының динамикасын сипаттайды, бірақ өзге өндірушілермен келісім туралы қорытынды жасауға мүмкіндік бермейді.',
      resultR:'Этот этап описывает динамику TASSAY, но не позволяет делать выводы о соглашениях с другими производителями.',
      compareK:'БШ2 кезеңінде салыстыруға екінші өндіруші енгізілді.',
      compareR:'На БШ2 сравнительная база расширилась вторым производителем.',
      sha:'d5c5ce2b633816c1ba04f62047a993c1e668d88f'
    },
    {
      id:'BSH2',date:'26.10.2026',brands:'TASSAY + TURAN',short:t('Екі компания','Две компании'),
      titleK:'БШ2 · TASSAY және TURAN',
      titleR:'БШ2 · TASSAY и TURAN',
      changeK:'Екінші бренд, баға динамикасының есептері, салыстырмалы талдау және ұлттық бәсекелестік құқығы бойынша бастапқы IRAC қосылды.',
      changeR:'Добавлены второй бренд, расчёты динамики, сравнительный анализ и первоначальный IRAC по праву Казахстана.',
      resultK:'Бағалардың ұқсастығы немесе айырмасы өздігінен картельді дәлелдемейді; келісімге қатысты қосымша фактілер қажет.',
      resultR:'Сходство или различие цен само по себе не доказывает картель; необходимы дополнительные сведения о соглашениях.',
      compareK:'БШ1-дегі бір бренд бойынша бақылау екі өнім арасындағы салыстыруға айналды.',
      compareR:'Мониторинг одного бренда БШ1 превратился в сравнение двух продуктов.',
      sha:'064de5a915b07a0d2800f59fd61b9b307faa73e6'
    },
    {
      id:'BSH3',date:'30.10.2026',brands:'TASSAY + TURAN + Ессентуки №4',short:t('Үш компания · ЕАЭО','Три компании · ЕАЭС'),
      titleK:'БШ3 · Үш бренд және ЕАЭО құқығы',
      titleR:'БШ3 · Три бренда и право ЕАЭС',
      changeK:'Ресейлік Ессентуки №4 өнімінің тарихы мен бағалары қосылды; трансшекаралық нарық критерийлері және ЕЭК практикасы талданды.',
      changeR:'Добавлены история и цены российского Ессентуки №4, критерии трансграничного рынка и практика ЕЭК.',
      resultK:'Ессентуки №4-тің қымбат болуы немесе Ресейде өндірілгені бұзушылықты не нарықтың трансшекаралық сипатын автоматты түрде дәлелдемейді.',
      resultR:'Высокая цена или российское происхождение Ессентуки №4 не доказывают нарушение или трансграничность рынка.',
      compareK:'БШ2-дегі ұлттық салыстыру ЕАЭО деңгейіндегі құқықтық аналогиялармен толықтырылды.',
      compareR:'Национальный анализ БШ2 дополнен правовыми аналогиями ЕАЭС.',
      sha:'70d4d862e92800634c85ffef64e9934f23bdb375'
    },
    {
      id:'BSH4',date:'14.11.2026',brands:'TASSAY + TURAN + Ессентуки №4',short:t('Қорытынды қорғау','Итоговая защита'),
      titleK:'БШ4 · Қорытынды зерттеу',
      titleR:'БШ4 · Итоговое исследование',
      changeK:'БШ1–БШ3 деректерін тексеру, соңғы баға бақылаулары, нарық үлесін есептеу әдісі және құқықтық ұстанымды дәлелдер мен қарсы уәждер арқылы қорғау.',
      changeR:'Перепроверка БШ1–БШ3, новые наблюдения, методика расчёта рыночной доли и защита правовой позиции с доказательствами и контраргументами.',
      resultK:'Әзірге бәсекелестікке қарсы келісім дәлелденген жоқ. Нақты нарық шекарасы, сатылым көлемдері және тұтынушылардың ауыстыруға дайындығы қосымша тексеріледі.',
      resultR:'Антиконкурентное соглашение пока не доказано. Границы рынка, объёмы продаж и потребительское переключение требуют проверки.',
      compareK:'БШ1–БШ3 кезеңдеріндегі дәлелдер сақталып, қорытынды IRAC шектеулері ашық көрсетіледі. Қорытынды қорғалатын күн — 14 қараша.',
      compareR:'Материалы БШ1–БШ3 сохраняются, ограничения итогового IRAC обозначены открыто. Запланированная дата защиты — 14 ноября.',
      sha:null
    }
  ];
  let selected='BSH1';
  let gallery=null;
  let galleryPromise=null;
  let galleryFailure=false;
  function snapshot(stage){
    return stage.sha?repo+'/tree/'+stage.sha:repo+'/tree/main';
  }
  function upload(stage){
    return repo+'/upload/main/history-screenshots/'+stage.id;
  }
  function folder(stage){
    return repo+'/tree/main/history-screenshots/'+stage.id;
  }
  function localImageHelp(stage){
    return '<div class="history-empty"><span class="history-empty-mark">▤</span><div>'+
      '<strong>'+translate('Бұл кезеңнің скриншоттары әлі жүктелмеген','Скриншоты этого этапа пока не загружены')+'</strong>'+
      '<p>'+translate('GitHub-тағы арнайы папкаға PNG/JPG жүктегеннен кейін суреттер осы жерде автоматты түрде пайда болады.',
      'Загрузи PNG/JPG в подготовленную папку GitHub, и изображения автоматически появятся здесь.')+'</p>'+
      '<a href="'+upload(stage)+'" target="_blank" rel="noopener noreferrer">'+
      translate('Скриншоттарды GitHub-қа жүктеу ↗','Загрузить скриншоты в GitHub ↗')+'</a></div></div>';
  }
  function stagePanel(stage){
    return '<section class="history-stage-detail">'+
      '<div class="history-stage-main">'+
        '<div class="history-stage-meta">'+e(stage.date)+' · '+e(stage.brands)+'</div>'+
        '<h3>'+e(translate(stage.titleK,stage.titleR))+'</h3>'+
        '<div class="history-detail-grid">'+
          '<div><small>'+translate('Не енгізілді','Что добавлено')+'</small><p>'+e(translate(stage.changeK,stage.changeR))+'</p></div>'+
          '<div><small>'+translate('Сол кездегі құқықтық ұстаным','Правовой вывод этапа')+'</small><p>'+e(translate(stage.resultK,stage.resultR))+'</p></div>'+
          '<div class="history-detail-wide"><small>'+translate('Басқа кезеңдермен сабақтастығы','Что изменилось относительно предыдущих этапов')+
          '</small><p>'+e(translate(stage.compareK,stage.compareR))+'</p></div>'+
        '</div>'+
        '<div class="history-action-row"><a href="'+snapshot(stage)+'" target="_blank" rel="noopener noreferrer" class="btn outline">'+
         (stage.sha?translate('Сақталған GitHub нұсқасы ↗','Сохранённая версия GitHub ↗'):
         translate('Қазіргі нұсқаны ашу ↗','Текущая версия GitHub ↗'))+'</a>'+
         '<a href="'+folder(stage)+'" target="_blank" rel="noopener noreferrer" class="btn outline">'+
         translate('Скриншоттар папкасы ↗','Папка скриншотов ↗')+'</a></div>'+
        '<p class="overview-note">'+(stage.sha?translate('GitHub сілтемесі сайттың бастапқы кодын сол күндегі күйінде көрсетеді. Ол жеке жұмыс істеп тұрған ескі сайт емес.',
        'Ссылка GitHub показывает файлы на выбранную дату, а не отдельный работающий старый сайт.'):
        translate('Бұл кезең әзірленуде: қосылмаған дәлел немесе жауаптар дайын деп белгіленбейді.',
        'Этап ещё готовится: отсутствующие подтверждения и результаты не считаются полученными.'))+'</p>'+
      '</div></section>';
  }
  function galleryHTML(stage){
    return '<section class="panel history-screenshots">'+
      '<div class="history-gallery-head"><div><h3>'+translate('Кезең скриншоттары','Скриншоты этапа')+'</h3>'+
      '<p>'+translate('Суреттер осы папкадан жүктеледі:','Изображения берутся из папки:')+
      ' <code>history-screenshots/'+stage.id+'/</code></p></div>'+
      '<a href="'+upload(stage)+'" target="_blank" rel="noopener noreferrer">'+translate('Файл қосу ↗','Добавить файл ↗')+'</a></div>'+
      '<div id="history-gallery">'+(gallery?localImageHelp(stage):'<p class="overview-note">'+
      translate('Скриншоттар тізімі жүктелуде…','Загружаю список скриншотов…')+'</p>')+'</div>'+
      '<p class="overview-note">'+translate('Тек нақты скриншоттарды жүктеңіз. Егер кескін ескі код нұсқасынан кейінірек қалпына келтірілсе, оны «реконструкция» деп белгілеңіз.',
      'Загружай реальные снимки. Если экран был воссоздан позднее по старому коду, подпиши его как «реконструкция», а не как оригинальный скриншот прошлого дня.')+'</p></section>';
  }
  function historyPage(){
    const stage=stages.find(s=>s.id===selected)||stages[0];
    return '<section class="history-intro"><div class="hero-eyebrow">'+
      translate('БШ4 · Қорытынды бақылау','БШ4 · Итоговая контрольная')+'</div>'+
      '<h2>'+translate('Зерттеу тарихы: БШ1–БШ4','История исследования: БШ1–БШ4')+'</h2>'+
      '<p>'+translate('Бір сайт, төрт зерттеу кезеңі. Деректердің, салыстырудың және құқықтық ұстанымның қалай дамығанын нақты GitHub нұсқаларымен көрсету.',
      'Один сайт, четыре этапа. Показываем, как развивались данные, сравнения и правовая позиция, со ссылками на реальные версии GitHub.')+'</p>'+
      '<div class="history-intro-tag">'+translate('Алдыңғы кезеңдер жойылған жоқ — олардың код нұсқалары сақталған.',
      'Прежние этапы не удалены — их версии кода сохранены.')+'</div></section>'+
      '<section class="history-timeline" aria-label="'+translate('Зерттеу кезеңдері','Этапы исследования')+'">'+
      stages.map((s,i)=>'<button type="button" class="history-milestone'+(selected===s.id?' selected':'')+
       '" aria-pressed="'+(selected===s.id?'true':'false')+'" onclick="selectResearchStage(\''+s.id+'\')">'+
       '<span class="history-numeral">'+(i+1)+'</span><span class="history-milestone-body"><strong>БШ'+(i+1)+
       ' · '+e(s.date)+'</strong><span>'+e(s.short)+'</span></span></button>').join('')+'</section>'+
      stagePanel(stage)+galleryHTML(stage)+
      '<section class="panel history-method"><h3>'+translate('БШ4 талаптарына сәйкестігі','Как это соответствует требованиям БШ4')+'</h3>'+
      '<p>'+translate('Әр кезең бойынша бастапқы деректер, жаңа тауарлар, есептеулер, дәлелдер, өзгерген тұжырымдар және сақталған нұсқалар бөлек көрсетілді. Бұл төрт бөлек сайт емес, бір платформаның нұсқалар тарихы.',
      'По каждому этапу отдельно показаны исходные данные, новые товары, расчёты, доказательства, развитие выводов и зафиксированные версии. Это история одной платформы, а не четыре разных сайта.')+
      '</p><a href="'+repo+'/commits/main/" target="_blank" rel="noopener noreferrer">'+
      translate('GitHub өзгерістер журналы ↗','Полная история изменений GitHub ↗')+'</a></section>';
  }
  window.selectResearchStage=function(id){
    if(!stages.some(s=>s.id===id))return;
    selected=id;
    page=26;
    render();
  };
  function showImages(){
    if(page!==26)return;
    const target=document.getElementById('history-gallery');
    if(!target)return;
    const stage=stages.find(s=>s.id===selected);
    if(!stage)return;
    // BSH4 is also displayed directly from its verified GitHub path if
    // a deployed API snapshot or GitHub directory listing is temporarily stale.
    const fromApi=gallery?.stages?.[stage.id]||[];
    const imgs=fromApi.filter((item,i,all)=>
      all.findIndex(previous=>previous.name===item.name)===i);
    if(stage.id==='BSH4'){
      const name='четвертый вариант.png';
      const url='https://raw.githubusercontent.com/akbobeksaldyr-cmd/tassay-market-monitor/main/history-screenshots/BSH4/'+encodeURIComponent(name);
      const existing=imgs.findIndex(item=>item.name===name);
      if(existing<0)imgs.push({name,url});
      else imgs[existing]={name,url};
    }
    if(!gallery && !imgs.length){
      if(galleryFailure)target.innerHTML=localImageHelp(stage)+
        '<p class="overview-note">'+translate('GitHub файлдар тізімін әзірге алу мүмкін болмады. Папка сілтемесін пайдаланыңыз.',
        'Не удалось получить список файлов GitHub. Используй прямую ссылку на папку.')+'</p>';
      return;
    }
    if(!imgs.length){target.innerHTML=localImageHelp(stage);return;}
    target.innerHTML='<div class="history-image-grid">'+imgs.map(item=>{
      const href=e(item.url);
      return '<a class="history-image-card" href="'+href+'" target="_blank" rel="noopener noreferrer">'+
        '<div class="history-image-preview"><img src="'+href+'" alt="'+e(item.name)+
        '" loading="eager" decoding="async"></div><span>'+e(item.name)+'</span></a>';
    }).join('')+'</div><p class="overview-note">'+imgs.length+' '+translate('скриншот табылды','файлов обнаружено')+'</p>';
  }
  async function hydrate(){
    if(gallery){showImages();return;}
    if(galleryFailure){showImages();return;}
    if(!galleryPromise){
      galleryPromise=fetch('/api/research-history-images')
        .then(resp=>{if(!resp.ok)throw new Error('HTTP '+resp.status);return resp.json();})
        .then(data=>{
          if(!data||typeof data.stages!=='object')throw new Error('Invalid gallery data');
          gallery=data;
        })
        .catch(()=>{galleryFailure=true;})
        .finally(()=>{galleryPromise=null;showImages();});
    }
    return galleryPromise;
  }
  sections[26]=translate('Зерттеу тарихы · БШ1–БШ4','История исследования · БШ1–БШ4');
  pages[26]=historyPage;
  const previousRender=render;
  render=function(){previousRender();if(page===26)void hydrate();};
})();
