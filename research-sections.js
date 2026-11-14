/* Dedicated research sections: prices, evidence, legal sources, market calculator.
 * All original observations and screenshots remain intact and read-only.
 * Loaded AFTER modern-ui.js. */
(function(){
  'use strict';
  const t=(kk,ru)=>typeof KM3_RU!=='undefined'&&KM3_RU?ru:kk;
  const escTxt=(s)=>typeof esc==='function'?esc(s):String(s);
  const shopsList=['Arbuz','SMALL','Galmart'];
  const brands=[
    ['all',t('Барлық бағалар','Все цены')],
    ['tassay','TASSAY'],
    ['turan','TURAN'],
    ['essentuki','Ессентуки №4']
  ];
  let priceView='all',evidenceView='tassay',priceCity='Астана';
  const money=x=>Number(x).toLocaleString('ru-RU')+' ₸';
  function tabs(options,active,fn,label){
    return '<div class="brand-tabs-container"><div class="brand-tabs-title">'+escTxt(label)+'</div>'+
      '<div class="brand-tabs" role="tablist" aria-label="'+escTxt(label)+'">'+
      options.map(([key,text])=>'<button type="button" class="brand-tab'+(active===key?' active':'')+
        '" role="tab" aria-selected="'+(active===key?'true':'false')+'" onclick="'+fn+'(\''+key+'\')">'+escTxt(text)+'</button>').join('')+
      '</div></div>';
  }
  const brandCode={tassay:'TASSAY',turan:'TURAN',essentuki:'ESSENTUKI4'};
  const brandNames={TASSAY:'TASSAY',TURAN:'TURAN',ESSENTUKI4:'Ессентуки №4'};
  const brandIndex={TASSAY:0,TURAN:1,ESSENTUKI4:2};
  const validUrl=value=>typeof value==='string'&&/^https:\/\//.test(value)?value:null;

  // 30 manually inspected fragments of Arzan.kz price-history charts uploaded
  // on 14 Nov 2026. Brand and product volume are NOT visible in these crops.
  // A price is attributed to a store only when that store appears in the crop.
  const uploadedPriceEvidence=[
  [
    "TASSAY",
    "2026-10-25",
    "25 окт астана тассай.png",
    517,
    519,
    null
  ],
  [
    "TASSAY",
    "2026-10-29",
    "29 окт астана тассай.png",
    517,
    519,
    null
  ],
  [
    "TURAN",
    "2026-10-29",
    "29 окт астана туран.png",
    435,
    369,
    510
  ],
  [
    "ESSENTUKI4",
    "2026-10-29",
    "29 окт астана ессен.png",
    975,
    735,
    1030
  ],
  [
    "TASSAY",
    "2026-10-30",
    "30 окт астана тассай.png",
    555,
    519,
    null
  ],
  [
    "TURAN",
    "2026-10-30",
    "30 окт астана туран.png",
    435,
    369,
    510
  ],
  [
    "ESSENTUKI4",
    "2026-10-30",
    "30 окт астана ессен.png",
    975,
    735,
    1030
  ],
  [
    "TASSAY",
    "2026-11-01",
    "1 ноября астана тассай.png",
    555,
    519,
    null
  ],
  [
    "TURAN",
    "2026-11-01",
    "1 ноября астана туран.png",
    360,
    465,
    510
  ],
  [
    "TASSAY",
    "2026-11-02",
    "2 ноября астана тассай.png",
    555,
    519,
    null
  ],
  [
    "TURAN",
    "2026-11-02",
    "2 ноября астана туран.png",
    360,
    465,
    455
  ],
  [
    "TASSAY",
    "2026-11-04",
    "4 ноября астана тассай.png",
    555,
    465,
    null
  ],
  [
    "ESSENTUKI4",
    "2026-11-04",
    "4 ноября астана ессен.png",
    975,
    735,
    1030
  ],
  [
    "TASSAY",
    "2026-11-05",
    "5 ноября астана тассай.png",
    555,
    465,
    null
  ],
  [
    "TURAN",
    "2026-11-05",
    "5 ноября туран.png",
    360,
    465,
    455
  ],
  [
    "TASSAY",
    "2026-11-06",
    "6 ноября астана тассай.png",
    555,
    465,
    null
  ],
  [
    "TURAN",
    "2026-11-06",
    "6 ноября астана туран.png",
    360,
    465,
    455
  ],
  [
    "ESSENTUKI4",
    "2026-11-06",
    "6 ноября астана ессен.png",
    975,
    735,
    1030
  ],
  [
    "TURAN",
    "2026-11-07",
    "7 ноября астана туран.png",
    360,
    465,
    455
  ],
  [
    "ESSENTUKI4",
    "2026-11-07",
    "7 ноября астана ессен.png",
    975,
    735,
    1030
  ],
  [
    "TASSAY",
    "2026-11-08",
    "8 ноября астана тассай.png",
    555,
    465,
    null
  ],
  [
    "TURAN",
    "2026-11-08",
    "8 ноября астана туран.png",
    360,
    465,
    455
  ],
  [
    "ESSENTUKI4",
    "2026-11-08",
    "8 ноября астана ессен.png",
    975,
    735,
    1030
  ],
  [
    "ESSENTUKI4",
    "2026-11-09",
    "9 ноября астана ессен.png",
    975,
    735,
    1030
  ],
  [
    "TASSAY",
    "2026-11-10",
    "10 ноября астана тассай.png",
    555,
    465,
    null
  ],
  [
    "TURAN",
    "2026-11-10",
    "10 ноября астана туран.png",
    360,
    465,
    455
  ],
  [
    "ESSENTUKI4",
    "2026-11-10",
    "10 ноября астана ессен.png",
    975,
    735,
    1030
  ],
  [
    "TASSAY",
    "2026-11-11",
    "11 ноября  астана тассай.png",
    555,
    465,
    null
  ],
  [
    "TURAN",
    "2026-11-11",
    "11 ноября астана туран.png",
    360,
    465,
    455
  ],
  [
    "ESSENTUKI4",
    "2026-11-11",
    "11 ноября астана ессен.png",
    975,
    735,
    1030
  ]
]
    .map(([brand,day,file,arbuz,small,galmart])=>({
      brand,day,city:'Астана',file,graphClip:true,
      shown:Object.fromEntries([['Arbuz',arbuz],['SMALL',small],['Galmart',galmart]]
        .filter(([_,v])=>v!==null)),
      url:'/evidence/'+encodeURIComponent(file)
    }));


  // One visible quote for one day + city + brand + store. We do not delete
  // originals: edited/author records take precedence over automated captures,
  // followed by observed automatic captures and then reconstructed history.
  // Conflicts are retained in the internal source arrays and flagged in the UI.
  function prices(){
    const historical=[
      ...data.map(r=>({...r,brand:'TASSAY',origin:'author'})),
      ...turanRows.map(r=>({...r,brand:'TURAN',origin:'author'})),
      ...essentukiRows.map(r=>({...r,brand:'ESSENTUKI4',origin:'author'}))
    ];
    const automatic=km3AutoArchive.observations.map(r=>({...r,origin:'auto'}));
    const grouped=new Map();
    for(const record of [...historical,...automatic]){
      if(!record||typeof record.day!=='string'||!/^202\d-\d{2}-\d{2}$/.test(record.day)||
         !shopsList.includes(record.shop)||!Object.hasOwn(brandIndex,record.brand)||
         (record.city||'Астана')!==priceCity||
         (priceView!=='all'&&record.brand!==brandCode[priceView])||
         !Number.isFinite(Number(record.price))||Number(record.price)<=0)continue;
      const key=[record.day,record.city||'Астана',record.brand,record.shop].join('|');
      const automaticRow=record.origin==='auto'||record.status==='auto_unverified';
      const rank=automaticRow?(String(record.source_method||'').startsWith('historical')?1:2):3;
      const candidate={...record,price:Number(record.price),_rank:rank,_key:key};
      if(!grouped.has(key))grouped.set(key,{winner:candidate,values:[],sourceUrls:[]});
      const group=grouped.get(key);
      group.values.push(candidate.price);
      for(const url of [record.source_url,record.source]){
        if(validUrl(url)&&!group.sourceUrls.includes(url))group.sourceUrls.push(url);
      }
      const old=group.winner;
      if(rank>old._rank||(rank===old._rank&&
          String(candidate.captured_at||candidate.captured||'')>String(old.captured_at||old.captured||''))){
        group.winner=candidate;
      }
    }
    return [...grouped.values()].map(group=>({
      ...group.winner,
      conflictingPrices:new Set(group.values).size>1,
      sourceUrls:group.sourceUrls
    })).sort((a,b)=>b.day.localeCompare(a.day)||
      brandIndex[a.brand]-brandIndex[b.brand]||
      shopsList.indexOf(a.shop)-shopsList.indexOf(b.shop));
  }

  // A date-matched file is a lead for verification, not automatic proof that
  // a product, volume, store or displayed amount was correctly identified.
  function priceScreenshot(row){
    // Match new graph crops by day, brand, city AND store; absent store = no proof.
    const uploaded=uploadedPriceEvidence.find(e=>
      e.day===row.day && e.brand===row.brand && e.city===row.city &&
      Object.prototype.hasOwnProperty.call(e.shown,row.shop));
    const original=row.brand==='ESSENTUKI4'
      ?essentukiEvidence.find(e=>e.day===row.day&&row.city==='Астана')
      :evidenceImages.find(e=>e.brand===row.brand&&e.day===row.day&&e.city===row.city);
    const found=uploaded||original;
    if(found){
      if(found.shown&&!Object.prototype.hasOwnProperty.call(found.shown,row.shop))
        return null;
      const shown=found.shown?.[row.shop];
      return {
        url:found.url||'/evidence/'+encodeURIComponent(found.file),
        mismatch:shown!==undefined&&Number(shown)!==row.price,
        chartPrice:shown,file:found.file,graphClip:found.graphClip===true
      };
    }
    const image=validUrl(row.evidence_url);
    return image?{url:image,mismatch:false,file:'Uploaded file'}:null;
  }
  function evidenceCell(row){
    const shot=priceScreenshot(row);
    const label=shot?.mismatch?
      t('Баға сәйкес емес ↗','Цена на скрине отличается ↗'):
      shot?.graphClip?t('График үзіндісі ↗','Фрагмент графика ↗'):
      t('Скриншотты ашу ↗','Открыть скриншот ↗');
    const snap=shot
      ?'<a class="study-proof-link" target="_blank" rel="noopener noreferrer" href="'+
       escTxt(shot.url)+'" title="'+escTxt(shot.file)+'">'+label+'</a>'
      :'<span class="study-proof-missing">'+
       t('Скриншот әзірге қосылмаған','Скрин пока не добавлен')+'</span>';
    const url=row.sourceUrls.find(x=>x.startsWith('https://arzan.kz/'));
    const source=url?'<a class="study-proof-source" href="'+escTxt(url)+
      '" target="_blank" rel="noopener noreferrer">Arzan.kz ↗</a>':'';
    const warnings=[];
    if(shot?.graphClip)warnings.push(t('График үзіндісінде бренд пен көлем жоқ',
      'На фрагменте графика не видны бренд и объём'));
    if(shot?.mismatch)warnings.push(t('Кесте: '+row.price+' ₸; скрин: '+shot.chartPrice+' ₸ — тексеру керек',
      'Таблица: '+row.price+' ₸; скрин: '+shot.chartPrice+' ₸ — нужна сверка'));
    else if(row.conflictingPrices)warnings.push(t('Авторлық және автоматты бағалар әртүрлі',
      'Авторская и автоматическая цены расходятся'));
    return '<div class="study-proof-cell">'+snap+source+
      warnings.map(w=>'<small class="study-proof-warning">'+escTxt(w)+'</small>').join('')+
      '</div>';
  }
  function priceSection(){
    const rows=prices();
    const table=rows.map(row=>
      '<tr data-price-key="'+escTxt(row._key)+'"><td>'+escTxt(row.day)+'</td>'+
      '<td>'+escTxt(brandNames[row.brand])+'</td><td>'+escTxt(row.shop)+'</td>'+
      '<td><strong>'+money(row.price)+'</strong></td>'+
      '<td>'+evidenceCell(row)+'</td></tr>').join('');
    const distinctDates=new Set(rows.map(row=>row.day)).size;
    const conflicts=rows.filter(row=>row.conflictingPrices).length;
    return '<div class="overview-heading study-price-heading"><div><h2>'+
      t('Бағалар мен дәлелдемелер','Цены и доказательства')+'</h2>'+
      '<p>'+t('Әр күн, бренд және дүкен үшін бір баға көрсетіледі. Скриншоттар бөлек тексеріледі.',
        'Одна цена на дату, бренд и магазин; скриншоты требуют отдельной проверки.')+
      '</p></div></div>'+
      tabs(brands,priceView,'selectPriceView',t('Брендті таңдау','Выбор бренда'))+
      '<section class="panel study-price-panel"><div class="evidence-topline"><div><h3>'+
      (priceView==='all'?t('Баға бақылаулары','Ценовые наблюдения'):
        escTxt(brands.find(b=>b[0]===priceView)?.[1]))+'</h3>'+
      '<p class="km2-muted">'+rows.length+' '+t('бірегей жазба','уникальных записей')+
      ' · '+distinctDates+' '+t('күн','дат')+' · '+t('1 л газдалған су','газированная вода 1 л')+
      '</p></div><label>'+t('Қала','Город')+
      ' <select id="study-price-city" onchange="setResearchPriceCity(this.value)">'+
      ['Астана','Алматы'].map(city=>'<option '+(priceCity===city?'selected ':'')+
        'value="'+city+'">'+city+'</option>').join('')+
      '</select></label></div>'+
      '<div class="km2-table"><table id="study-price-table"><thead><tr><th>'+
      t('Күні','Дата')+'</th><th>'+t('Тауар','Бренд')+'</th><th>'+
      t('Дүкен','Магазин')+'</th><th>'+t('Баға','Цена')+'</th><th>'+
      t('Дәлелдемелер','Доказательства')+'</th></tr></thead><tbody>'+
      (table||'<tr><td colspan="5">'+t('Бұл қала бойынша жазба жоқ','Нет записей для этого города')+'</td></tr>')+
      '</tbody></table></div>'+
      '<p class="overview-note">'+
      t('Авторлық баға бар жерде сол көрсетіледі; ол жоқ күндерде қолжетімді автоматты дерек қолданылады. Қалпына келтірілген бағалар сол күнгі дербес бақылау болып саналмайды. Скриншоттың болуы тауардың атауын, көлемін және сомасын автоматты растамайды.',
        'При наличии авторской цены показывается она, иначе — доступная автоматическая запись. Реконструированная цена не является замером в указанную дату. Наличие файла не подтверждает автоматически товар, объём и сумму.')+
      ' '+t('2026 жылғы 14 қарашада қосылған суреттер — баға тарихы графигінің үзінділері, дүкен чектері емес.','Скриншоты от 14 ноября — фрагменты графика истории цен, а не кассовые чеки.')+
      (conflicts?' '+t('Салыстыруды қажет ететін қайшылықтар: ','Расхождения между источниками: ')+
        conflicts+'.':'')+
      '</p><button class="btn outline" onclick="nav(7)">'+
      t('Барлық скриншоттарды ашу','Открыть архив скриншотов')+
      '</button></section>';
  }
  window.selectPriceView=function(value){
    priceView=brands.some(x=>x[0]===value)?value:'all';
    page=2;document.querySelector('aside')?.classList.remove('open');render();
    window.scrollTo({top:0,behavior:'instant'});
  };
  window.setResearchPriceCity=function(value){
    priceCity=value==='Алматы'?'Алматы':'Астана';
    render();
  };
  const oldNav=nav;
  nav=function(i){
    if(i===12)priceView='turan';
    else if(i===21)priceView='essentuki';
    else if(i===22)priceView='all';
    else if(i===2)priceView='tassay';
    oldNav(i);
  };
  pages[2]=priceSection;
  function proofItems(){
    const base=evidenceImages.map(r=>({
      brand:r.brand,city:r.city,day:r.day,
      url:'/evidence/'+encodeURIComponent(r.file),file:r.file,
      note:t('Баға мен дүкен скриншотта көрсетілуі мүмкін, бірақ тауар атауы кей кадрларда жоқ. Дәлелді дербес тексеру қажет.',
           'На снимке могут присутствовать цены магазинов, но название товара видно не всегда. Требуется проверка.')
    }));
    const c=essentukiEvidence.map(r=>({
      brand:'ESSENTUKI4',city:'Астана',day:r.day,url:r.url,file:r.file,
      note:t('Arzan.kz бағалар графигінің қиындысы. Тауардың толық атауы мен көлемі кадрдан расталмайды.',
           'Фрагмент графика Arzan.kz. Название и объём товара не подтверждаются кадром.')
    }));
    const newlyUploaded=uploadedPriceEvidence.map(r=>({
      ...r,note:t(
        'Arzan.kz баға тарихы графигінің үзіндісі: күн мен дүкен бағалары көрінеді; бренд пен 1 литр көлем суретте расталмайды. Файл атауы бойынша сәйкестендірілді.',
        'Фрагмент истории цен Arzan.kz: дата и цены магазинов видны, но бренд и объём 1 л на изображении не подтверждены. Соотнесено по имени файла.')
    }));
    return [...base,...c,...newlyUploaded].sort((a,b)=>b.day.localeCompare(a.day));
  }
  const proofTabs=[
    ['tassay','TASSAY'],['turan','TURAN'],['essentuki','Ессентуки №4']
  ];
  function evidenceSection(){
    const names={tassay:'TASSAY',turan:'TURAN',essentuki:'ESSENTUKI4'};
    const all=proofItems(),subset=all.filter(x=>x.brand===names[evidenceView]);
    const thumbs=subset.map((r,i)=>
      '<button type="button" class="research-proof" onclick="openResearchProof('+i+')">'+
      '<div class="research-proof-image"><img src="'+escTxt(r.url)+'" loading="eager" decoding="async" alt="'+
        escTxt(r.brand+' '+r.day+' '+r.city)+'"></div>'+
      '<div class="research-proof-caption"><strong>'+escTxt(r.day)+'</strong><span>'+
      escTxt(r.city)+'</span></div></button>').join('');
    return '<div class="overview-heading"><div><h2>'+t('Дәлелдемелер','Доказательства')+'</h2>'+
      '<p>'+t('Тауарлардың бастапқы скриншоттары бөлек жинақталған','Все исходные скриншоты вынесены в отдельный раздел')+
      '</p></div></div>'+
      '<div class="research-access"><span>▣</span><div>'+
      t('Бағалар кестелері мен скриншоттар бір-бірінен тәуелсіз тексерілуі тиіс. Скриншотта атау не көлем көрінбесе, бұл шектеу жасырылмайды.',
        'Скриншоты нужно сверять с таблицами; если на изображении не видно названия или объёма товара, это ограничение сохраняется.')+
      '</div></div>'+
      tabs(proofTabs,evidenceView,'selectResearchEvidence',t('Скриншоттар бренді','Скриншоты по бренду'))+
      '<section class="panel"><h3>'+escTxt(proofTabs.find(x=>x[0]===evidenceView)?.[1])+
      ' · '+subset.length+' '+t('файл','файлов')+'</h3><div class="research-proof-grid">'+
      (thumbs||'<p>'+t('Скриншоттар жоқ','Скриншоты отсутствуют')+'</p>')+'</div>'+
      '<p class="overview-note">'+t('Күн сайынғы автоматты бақылаулар үшін скриншот әрдайым сақталмайды. Баға және дереккөз URL жеке «Бағалар» бөлімінде көрсетіледі.',
        'Не все ежедневные автоматические наблюдения сопровождаются сохранёнными изображениями. Цена и URL источника учитываются отдельно в разделе «Цены».')+
      '</p></section>';
  }
  window.selectResearchEvidence=function(value){
    evidenceView=proofTabs.some(x=>x[0]===value)?value:'tassay';
    page=7;render();
  };
  window.openResearchProof=function(index){
    const name={tassay:'TASSAY',turan:'TURAN',essentuki:'ESSENTUKI4'}[evidenceView];
    const r=proofItems().filter(x=>x.brand===name)[index];
    if(!r)return;
    showEvidenceModal({url:r.url,label:(name==='ESSENTUKI4'?'Ессентуки №4':name)+' · '+r.day+' · '+r.city,note:r.note});
  };
  pages[7]=evidenceSection;
  sections[7]=t('Дәлелдемелер','Доказательства');

  const legalSources=[
    {kind:'01 / ҚР',title:t('Қазақстан Республикасының Кәсіпкерлік кодексі','Предпринимательский кодекс Республики Казахстан'),
     articles:'168, 169, 170, 172, 174',
     usage:t('168-бап — бәсекелестер мен келісімдер; 169 — картельдер; 170 — келісілген әрекеттер; 172 — үстемдік; 174 — үстем жағдайды теріс пайдалану. Осы нормалар IRAC талдауының ұлттық құқықтық негізін құрайды.',
       'Ст. 168 — конкуренты и виды соглашений; 169 — картели; 170 — согласованные действия; 172 — доминирование; 174 — злоупотребление. Основа национального анализа IRAC.'),
     url:'https://adilet.zan.kz/rus/docs/K1500000375'},
    {kind:'02 / ҚР',title:t('Тауар нарықтарындағы бәсекелестік жағдайын талдау әдістемесі',
       'Методика анализа состояния конкуренции на товарных рынках'),
     articles:t('03.05.2022 ж. № 13 бұйрық','Приказ № 13 от 03.05.2022'),
     usage:t('Тауарлардың өзара алмастырылуы, нарықтың шекарасы, қатысушылар, нарық көлемі және үлестерін есептеу тәсілдері. Зерттеу сауалнамасы мен есептегіштің әдіснамалық негізі. Қолданыстағы редакцияны тексеру керек.',
       'Определение взаимозаменяемости, границ рынка, состава участников, объёма и долей. Основа опроса и калькулятора. Учитывается актуальная редакция.'),
     url:'https://adilet.zan.kz/rus/docs/V2200027883'},
    {kind:'03 / ЕАЭО',title:t('Еуразиялық экономикалық одақ туралы шарт','Договор о Евразийском экономическом союзе'),
     articles:t('76-бап және № 19 қосымша','Статья 76 и Приложение № 19'),
     usage:t('Жалпы бәсекелестік ережелері және ЕЭК-тің трансшекаралық нарықтардағы өкілеттігі.',
       'Общие правила конкуренции и применение их ЕЭК к трансграничным рынкам.'),
     url:'https://eec.eaeunion.org/upload/medialibrary/222/bifmr5rkj91orf6wc3yg26olge6h0wej/Dogovor.pdf'},
    {kind:'04 / ЕАЭО',title:t('Нарықты трансшекаралық деп тану критерийлері','Критерии отнесения рынка к трансграничному'),
     articles:t('19.12.2012 ж. № 29 шешім','Решение от 19.12.2012 № 29'),
     usage:t('Географиялық шекаралар мен ЕЭК құзыретінің қосымша шарттарын талдау үшін қолданылады.',
       'Определение географических границ и дополнительных условий компетенции ЕЭК.'),
     url:'https://adilet.zan.kz/rus/docs/H12B0000029'}
  ];
  function normativeSources(){
    return '<div class="overview-heading"><div><h2>'+t('Құқықтық дереккөздер','Правовые источники')+
      '</h2><p>'+t('Зерттеу мен платформаның құқықтық негізіне алынған ресми құжаттар',
        'Официальные нормы, использованные для правовой методики и анализа')+'</p></div></div>'+
      '<section class="legal-source-grid">'+legalSources.map(x=>
        '<article class="case-card"><div class="case-date">'+escTxt(x.kind)+'</div>'+
        '<h3>'+escTxt(x.title)+'</h3><p class="norm-articles">'+escTxt(x.articles)+'</p>'+
        '<p>'+escTxt(x.usage)+'</p><a href="'+escTxt(x.url)+
        '" target="_blank" rel="noopener noreferrer">'+t('Ресми құжат ↗','Открыть нормативный акт ↗')+
        '</a></article>').join('')+'</section>'+
      '<section class="panel"><h3>'+t('Сот және ЕЭК практикасы','Практика ЕЭК и Суда ЕАЭС')+'</h3><p>'+
      t('«Дельрус», НЛМК/ВИЗ-Сталь, Cochlear / Pharm Express және «Атамекен» істері 2017–2021 жж. жинағы негізінде арнайы тарауда талданады.',
        '«Дельрус», НЛМК/ВИЗ-Сталь, Cochlear / Pharm Express и «Атамекен» разобраны в отдельном разделе на основе сборника практики 2017–2021 гг.')+
      '</p><button class="btn outline" onclick="nav(18)">'+t('Істерге өту','Перейти к практике')+
      '</button></section><p class="overview-note">'+t('Сауда бағаларының дереккөзі — Arzan.kz; бастапқы скриншоттар «Дәлелдемелер» бөлімінде орналасқан. Нормативтік актілер тауар бағаларын дәлелдемейді.',
        'Ценовой источник — Arzan.kz; скриншоты хранятся в разделе «Доказательства». Нормативные акты не являются доказательствами розничных цен.')+
      '</p>';
  }
  pages[9]=normativeSources;
  sections[9]=t('Құқықтық дереккөздер','Правовые источники');

  const previousMarket=pages[4];
  function marketPanel(){
    return '<div class="overview-heading"><div><h2>'+t('Астана қаласының тауар нарығы','Товарный рынок Астаны')+
      '</h2><p>'+t('Релевантты шекаралар мен нарықтық үлесті есептеу','Границы релевантного рынка и расчёт рыночной доли')+
      '</p></div></div>'+
      '<section class="panel market-formula-card"><div class="case-date">'+t('НАРЫҚ ҮЛЕСІН ЕСЕПТЕУ','РАСЧЁТ РЫНОЧНОЙ ДОЛИ')+'</div>'+
      '<h3>'+t('Негізгі формула','Основная формула')+'</h3>'+
      '<div class="market-formula" aria-label="S i равно Q i делённое на Q рынка, умножить на 100 процентов">'+
        'S<sub>i</sub> = ( Q<sub>i</sub> / Q<sub>market</sub> ) × 100%'+'</div>'+
      '<p>'+t('Qᵢ — таңдалған брендтің Астана қаласындағы бір кезеңдегі сатылымы; Qmarket — дәл осы географиялық, тауарлық және уақыттық шекарадағы бүкіл нарықтың сатылымы.',
        'Qᵢ — продажи выбранного бренда в Астане за период; Qmarket — общий объём того же товарного рынка, в том же городе, за тот же период.')+'</p>'+
      '<div class="market-calculator"><div class="market-calculator-heading">'+t('Онлайн есептегіш','Онлайн-калькулятор')+'</div>'+
      '<div class="market-form-grid">'+
      '<label>'+t('Бренд','Бренд')+'<select id="market-brand"><option>TASSAY</option><option>TURAN</option><option>Ессентуки №4</option></select></label>'+
      '<label>'+t('Бренд сатылымы (литр)','Продажи бренда (литров)')+'<input id="market-brand-sales" type="number" min="0" step="any" placeholder="Например: 1200" inputmode="decimal"></label>'+
      '<label>'+t('Нарықтың жалпы сатылымы (литр)','Общий объём рынка (литров)')+'<input id="market-total-sales" type="number" min="0" step="any" placeholder="Например: 15000" inputmode="decimal"></label>'+
      '<label>'+t('Кезең','Период')+'<input id="market-sales-period" type="text" placeholder="2026, октябрь"></label>'+
      '<label class="market-source-field">'+t('Сату көлемдерінің дереккөзі','Источник объёмов продаж')+'<input id="market-sales-source" type="text" placeholder="'+
      t('Компания есебі / статистика','Отчёт компании / статистика')+'"></label>'+
      '</div><button class="btn" onclick="calculateAstanaMarketShare()">'+t('Үлесті есептеу','Рассчитать долю')+'</button>'+
      '<div id="market-calc-result" class="market-calc-result" aria-live="polite">'+
      t('Есептеу үшін сатылым көлемдерін енгізіңіз','Введите объёмы продаж для расчёта')+'</div></div>'+
      '<p class="overview-note">'+t('Бөлшек бағалар мен брендтер бойынша бақылаулар нарық үлесін есептеуге жеткіліксіз. Нәтиже енгізілген санға ғана негізделеді; тексерілген сату статистикасынсыз оны нақты нарықтық үлес деп жарияламаңыз.',
        'Розничные цены сами по себе не дают объёма продаж. Результат зависит только от введённых чисел; без подтверждённых источников это не установленная рыночная доля.')+'</p></section>'+
      '<section class="panel"><h3>'+t('Релевантты нарықты анықтау','Определение релевантного рынка')+'</h3>'+
      '<p>'+t('Географиялық шекара ретінде Астана қарастырылады. Тауарлық шекара үш өнімнің мақсаттары, минералдық құрамы, бағасы және тұтынушылардың ауысуға дайындығы бойынша нақтыланады. Сауалнама өзара алмастырылу гипотезасын тексеруге көмектеседі.',
        'Рабочая географическая граница — Астана. Товарную границу необходимо уточнить по назначению, минерализации, ценам и готовности покупателей переключаться между брендами. Опрос проверяет гипотезу о взаимозаменяемости.')+
      '</p><p><button type="button" class="btn outline" onclick="nav(27)">'+
      t('Тұтынушылар сауалнамасын ашу ↗','Открыть результаты опроса ↗')+'</button></p>'+
      '<a href="https://adilet.zan.kz/rus/docs/V2200027883" target="_blank" rel="noopener noreferrer">'+
      t('ҚР бәсекелестікті талдау әдістемесі ↗','Методика анализа конкуренции РК ↗')+'</a></section>';
  }
  pages[4]=marketPanel;
  window.calculateAstanaMarketShare=function(){
    const get=id=>document.getElementById(id);
    const numerator=get('market-brand-sales').value.trim();
    const denominator=get('market-total-sales').value.trim();
    const period=get('market-sales-period').value.trim();
    const source=get('market-sales-source').value.trim();
    const target=get('market-calc-result');
    const a=Number(numerator),b=Number(denominator);
    if(!numerator||!denominator||!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=0||a>b){
      target.textContent=t('Дұрыс көлемдерді енгізіңіз: 0 ≤ бренд сатылымы ≤ нарықтың жалпы сатылымы, ал нарық көлемі 0-ден үлкен болуы тиіс.',
        'Укажите корректные объёмы: 0 ≤ продажи бренда ≤ общий объём рынка; общий объём должен быть больше нуля.');
      return;
    }
    const pct=(a/b*100).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2});
    const status=(period&&source)?
       t('Енгізілген деректер бойынша есеп. Ресми статистикалық факт ретінде пайдаланбас бұрын дереккөзді тексеріңіз.',
         'Расчёт по введённым данным. Перед использованием как реальной доли проверьте первичный источник.') :
       t('Шартты есеп: уақыт кезеңі және сату дереккөзі көрсетілмеген.',
         'Условный расчёт: не заполнены период и/или источник объёмов продаж.');
    const brand=get('market-brand').value;
    target.innerHTML='<strong>'+escTxt(brand)+': '+pct+'%</strong><span>'+
      escTxt(a.toLocaleString('ru-RU'))+' / '+escTxt(b.toLocaleString('ru-RU'))+
      ' × 100% · '+escTxt(status)+'</span>';
  };
  if(Array.isArray(data)&&data.length)render();
})();