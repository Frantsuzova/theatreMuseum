
const $ = (id) => document.getElementById(id);
const introScreen=$('introScreen'), prologueScreen=$('prologueScreen'), routesScreen=$('routesScreen'), yandexScreen=$('yandexScreen');
const routeTitle=$('routeTitle'), routeText=$('routeText'), mapPointTitle=$('mapPointTitle'), pointCounter=$('pointCounter'), mapPointText=$('mapPointText'), pointPreview=$('pointPreview');
const pointSheet=$('pointSheet'), sheetPeek=$('sheetPeek'), peekRouteText=$('peekRouteText'), peekPointPin=$('peekPointPin'), peekPointNum=$('peekPointNum'), geoAction=$('geoAction');
const audio=$('routeAudio'), audioPlay=$('audioPlay'), audioSeek=$('audioSeek'), audioCurrent=$('audioCurrent'), audioDuration=$('audioDuration');
const drawer=$('routeDrawer'), drawerList=$('drawerRouteList'), drawerRouteChip=$('drawerRouteChip'), drawerProgressLine=$('drawerProgressLine'), drawerProgressLabel=$('drawerProgressLabel');
const drawerTabs=[...document.querySelectorAll('.drawer-tab')];
const drawerPanels={points:$('drawerPanelPoints'),project:$('drawerPanelProject'),poster:$('drawerPanelPoster')};
const draftText='Черновик карты маршрута. Сейчас это единая карта с четырьмя стартовыми точками; дальше сюда можно подставить четыре отдельно размеченные карты.';
const routes=[
 {id:1,colorClass:'c1',color:'#ffd33f',title:'1. Музей-квартира Римского-Корсакова → Театральный музей',shortTitle:'Музей-квартира Римского-Корсакова → Театральный музей',blurb:'Маршрут о творческом взаимопонимании, раннем узнавании таланта и прогулке, в которой разговор продолжается на ходу.',coord:[59.924567,30.340964]},
 {id:2,colorClass:'c2',color:'#59c2ff',title:'2. Театральный музей → Шереметевский дворец — Музей музыки',shortTitle:'Театральный музей → Шереметевский дворец — Музей музыки',blurb:'Маршрут о конфликте старого и нового театра, реформе сцены и моменте, когда художественный риск становится поступком.',coord:[59.931145,30.336659]},
 {id:3,colorClass:'c3',color:'#ce68ff',title:'3. Шереметевский дворец — Музей музыки → Музей актеров Самойловых',shortTitle:'Шереметевский дворец — Музей музыки → Музей актеров Самойловых',blurb:'Маршрут о Фонтанном доме, памяти музыкального салона и дружеской встрече, из которой рождается разговор о прошлом.',coord:[59.936012,30.345461]},
 {id:4,colorClass:'c4',color:'#7ee36a',title:'4. Музей актеров Самойловых → Музей-квартира Н.А. Римского-Корсакова',shortTitle:'Музей актеров Самойловых → Музей-квартира Н.А. Римского-Корсакова',blurb:'Маршрут о преемственности, художественном взгляде двух поколений и движении между памятью и ожиданием нового.',coord:[59.931140,30.350735]}
];
const landmarks=[
 {title:'Думская башня',coord:[59.934684,30.329620],img:'./assets/dumskaya.png'},
 {title:'Собор Владимирской иконы Божией Матери',coord:[59.928181,30.348258],img:'./assets/vladimir.png'},
 {title:'Аничков мост',coord:[59.933203,30.343375],img:'./assets/anichkov.png'}
];
let selectedRoute=Number(sessionStorage.getItem('gm_current_route')||1);
const legacyVisited=JSON.parse(sessionStorage.getItem('gm_visited_routes')||'[]');
let passed=new Set(JSON.parse(sessionStorage.getItem('gm_passed_routes')||'[]'));
let viewed=new Set(JSON.parse(sessionStorage.getItem('gm_viewed_routes')||'[]'));
if(!passed.size && legacyVisited.length) legacyVisited.forEach(id=>viewed.add(Number(id)));
viewed.add(selectedRoute);
let ymap=null, yandexReadyPromise=null, routeObjects=[], userMark=null, mapSource='intro';
const drawerBottomHint=document.querySelector('.drawer-bottom-hint');
function route(){return routes.find(r=>r.id===selectedRoute)||routes[0]}
function saveState(){sessionStorage.setItem('gm_current_route',String(selectedRoute));sessionStorage.setItem('gm_passed_routes',JSON.stringify([...passed]));sessionStorage.setItem('gm_viewed_routes',JSON.stringify([...viewed]));}
function markViewed(id){viewed.add(Number(id));saveState();}
function markPassed(id){passed.add(Number(id));saveState();}
function statusFor(id){id=Number(id); if(passed.has(id)) return 'passed'; if(viewed.has(id)) return 'viewed'; return 'unvisited';}
function labelFor(id){const st=statusFor(id); return st==='passed'?'пройдена':st==='viewed'?'просмотрена':'впереди'}
function exploredCount(){return new Set([...passed,...viewed]).size}
function show(name,source='intro'){
 introScreen.hidden=name!=='intro'; prologueScreen.hidden=name!=='prologue'; routesScreen.hidden=name!=='routes'; yandexScreen.hidden=name!=='yandex';
 if(name==='prologue' || name==='routes'){ updateRouteUI(); }
 if(name==='yandex'){
   mapSource=source;
   closeDrawer();
   updateRouteUI();
   closeSheet();
   initMapWhenVisible();
   setTimeout(resizeMapSoon, 120);
 }
}
function updateRouteUI(){
 const r=route();
 routeTitle.textContent=r.title; routeText.textContent=r.blurb || draftText;
 pointCounter.textContent=`Точка ${r.id} из 4`; mapPointTitle.textContent=r.shortTitle; mapPointText.textContent=draftText;
 pointPreview.className=`point-preview ${r.colorClass}`; pointPreview.textContent=r.id;
 peekRouteText.textContent=`#${r.id}`; peekPointNum.textContent=r.id; peekPointPin.className=`peek-pin ${r.colorClass}`;
 document.querySelectorAll('.pin,.tab,.route-choice').forEach(el=>el.classList.toggle('active',Number(el.dataset.route)===r.id));
 renderDrawerList(); updateMapMarkers();
}
function setSelectedRoute(id){
 selectedRoute=Number(id);
 markViewed(selectedRoute);
 updateRouteUI();
 resetAudio();
}
function selectRoute(id,{fromMap=false}={}){
 setSelectedRoute(id);
 openSheet();
}

function changeRoute(step){let n=selectedRoute+step;if(n>routes.length)n=1;if(n<1)n=routes.length;selectRoute(n)}
function openSheet(){pointSheet.classList.remove('closed');yandexScreen.classList.add('sheet-open');yandexScreen.classList.remove('sheet-closed');resizeMapSoon(); focusActiveRouteForOpenSheet(); }
function closeSheet(){pointSheet.classList.add('closed');yandexScreen.classList.add('sheet-closed');yandexScreen.classList.remove('sheet-open');resizeMapSoon(); focusActiveRouteForClosedSheet(); }
function toggleSheet(){pointSheet.classList.contains('closed')?openSheet():closeSheet()}
function focusActiveRouteForOpenSheet(){
 if(!ymap) return;
 const r=route();
 const target=[r.coord[0]-0.0082,r.coord[1]];
 setTimeout(()=>ymap.setCenter(target, ymap.getZoom(), {duration:260}), 40);
 setTimeout(()=>ymap.setCenter(target, ymap.getZoom(), {duration:180}), 320);
}
function focusActiveRouteForClosedSheet(){
 if(!ymap) return;
 const r=route();
 const target=[r.coord[0]-0.0011,r.coord[1]];
 setTimeout(()=>ymap.setCenter(target, ymap.getZoom(), {duration:260}), 60);
}
function renderDrawerList(){
 if(!drawerList)return;
 const completed=exploredCount();
 drawerRouteChip.innerHTML=`Вы проходите маршрут <strong>#${selectedRoute}</strong>`;
 drawerProgressLabel.textContent=`${Math.min(completed,routes.length)} / ${routes.length}`;
 drawerProgressLine.style.width=`${Math.min(completed,routes.length)/routes.length*100}%`;
 drawerList.innerHTML=routes.map(r=>`<button class="route-list-item ${r.colorClass} ${statusFor(r.id)} ${selectedRoute===r.id?'active current-origin':''}" data-route="${r.id}" type="button"><span class="badge">${r.id}</span><span class="title">${r.shortTitle}</span><span class="status">${labelFor(r.id)}</span></button>`).join('');
 drawerList.querySelectorAll('[data-route]').forEach(btn=>btn.addEventListener('click',()=>selectRoute(btn.dataset.route)));
 updateDrawerHint();
}
function setDrawerTab(tab){
 drawerTabs.forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 Object.entries(drawerPanels).forEach(([k,p])=>{p.hidden=k!==tab;p.classList.toggle('active',k===tab)});
 if(tab==='points') renderDrawerList();
 updateDrawerHint();
}
function openDrawer(tab='points'){
 drawer.hidden=false;drawer.removeAttribute('hidden');
 requestAnimationFrame(()=>drawer.classList.add('open'));
 setDrawerTab(tab);
 setTimeout(updateDrawerHint,60);
}
function closeDrawer(){drawer.classList.remove('open');setTimeout(()=>{if(!drawer.classList.contains('open'))drawer.hidden=true},260)}
function updateDrawerHint(){
 const area=$('drawerScrollArea');
 if(!area||!drawerBottomHint||drawer.hidden) return;
 const activePanel=[...area.children].find(node=>!node.hidden);
 const canScroll=!!activePanel && area.scrollHeight>area.clientHeight+8;
 drawerBottomHint.hidden=!canScroll;
 if(canScroll){
   const atTop=area.scrollTop<=2;
   const atBottom=area.scrollTop+area.clientHeight>=area.scrollHeight-2;
   drawerBottomHint.textContent=atTop?'↕ листайте':(atBottom?'↑ листайте':'↕ листайте');
 }
}

function loadYandex(){
 if(window.ymaps) return Promise.resolve(window.ymaps);
 if(yandexReadyPromise) return yandexReadyPromise;
 yandexReadyPromise=new Promise((resolve,reject)=>{
   const existing=document.querySelector('script[data-yandex-api="true"]');
   if(existing){
     existing.addEventListener('load',()=>window.ymaps?window.ymaps.ready(()=>resolve(window.ymaps)):reject(new Error('ymaps missing')));
     existing.addEventListener('error',reject);
     return;
   }
   const s=document.createElement('script');
   s.src='https://api-maps.yandex.ru/2.1/?lang=ru_RU';
   s.async=true;
   s.dataset.yandexApi='true';
   s.onload=()=>window.ymaps?window.ymaps.ready(()=>resolve(window.ymaps)):reject(new Error('ymaps missing'));
   s.onerror=reject;
   document.head.appendChild(s);
 });
 return yandexReadyPromise;
}
function initMapWhenVisible(){
 const loader=$('mapLoader');
 if(loader){ loader.textContent='Загрузка Яндекс.Карты…'; loader.classList.remove('hidden'); }
 // the screen must be visible before Yandex reads container dimensions
 requestAnimationFrame(()=>setTimeout(initYandexMap,120));
}
function initYandexMap(){
 if(ymap){resizeMapSoon();return;}
 const el=$('ymap');
 if(!el || yandexScreen.hidden || el.offsetWidth<20 || el.offsetHeight<20){
   setTimeout(initYandexMap,180);
   return;
 }
 loadYandex().then(()=>{
   const el=$('ymap');
   if(!el || yandexScreen.hidden || el.offsetWidth<20 || el.offsetHeight<20){
     setTimeout(initYandexMap,180);
     return;
   }
   ymap=new ymaps.Map(el,{center:[59.931,30.3405],zoom:14,controls:['zoomControl']},{suppressMapOpenBlock:true,yandexMapDisablePoiInteractivity:true});
   ymap.controls.get('zoomControl').options.set({size:'small',position:{left:12,top:112}});
   const line=new ymaps.Polyline(routes.map(r=>r.coord),{}, {strokeColor:'#7d766d',strokeWidth:4,strokeOpacity:.92,strokeStyle:'shortdash'});
   ymap.geoObjects.add(line);
   routeObjects=routes.map(r=>{
     const pm=new ymaps.Placemark(r.coord,{hintContent:r.shortTitle},{iconLayout:createRouteLayout(r),iconShape:{type:'Rectangle',coordinates:[[-24,-58],[24,0]]},zIndex:120});
     pm.routeId=r.id;
     pm.events.add('click',()=>selectRoute(r.id,{fromMap:true}));
     ymap.geoObjects.add(pm);
     return pm;
   });
   landmarks.forEach(l=>{
     const pm=new ymaps.Placemark(l.coord,{hintContent:l.title},{iconLayout:createLandmarkLayout(l),iconShape:{type:'Rectangle',coordinates:[[-28,-28],[28,28]]},zIndex:90});
     ymap.geoObjects.add(pm);
   });
   ymap.setBounds([[59.9225,30.3268],[59.9378,30.3528]],{checkZoomRange:true,zoomMargin:[48,24,116,24]});
   const loader=$('mapLoader');
   if(loader) loader.classList.add('hidden');
   updateMapMarkers();
   resizeMapSoon();
 }).catch((err)=>{
   const loader=$('mapLoader');
   if(loader) loader.textContent='Не удалось загрузить Яндекс.Карту. Проверьте интернет или запустите через localhost.';
   console.error('Yandex Maps failed:',err);
 });
}
function createRouteLayout(r){
 const st=statusFor(r.id);
 const color=r.color;
 const activeClass = selectedRoute===r.id ? 'active' : '';
 return ymaps.templateLayoutFactory.createClass(`<div class="route-pin-layout ${r.colorClass} ${st} ${activeClass}" style="--route-color:${color};opacity:1;filter:none;" data-route="${r.id}"><span class="pulse-ring ring-a"></span><span class="pulse-ring ring-b"></span><div class="pin-badge" style="background:${color};color:${color};opacity:1;filter:none;"><span class="num">${r.id}</span></div></div>`);
}
function createLandmarkLayout(l){return ymaps.templateLayoutFactory.createClass(`<div class="landmark-layout"><img src="${l.img}" alt=""></div>`)}

function updateStaticMapMarkers(){}
function updateMapMarkers(){if(!routeObjects.length||!window.ymaps)return; routeObjects.forEach(obj=>{const r=routes.find(x=>x.id===obj.routeId); obj.options.set('iconLayout',createRouteLayout(r));})}
function resizeMapSoon(){if(!ymap)return; [50,250,500].forEach(t=>setTimeout(()=>ymap.container.fitToViewport(),t))}
function haversine(a,b){
 const toRad=v=>v*Math.PI/180;
 const R=6371000;
 const dLat=toRad(b[0]-a[0]);
 const dLon=toRad(b[1]-a[1]);
 const lat1=toRad(a[0]);
 const lat2=toRad(b[0]);
 const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
 return 2*R*Math.asin(Math.sqrt(h));
}
function locateUser(){
 if(!ymap||!navigator.geolocation){geoAction.classList.add('error');setTimeout(()=>geoAction.classList.remove('error'),1000);return}
 geoAction.classList.add('active');
 navigator.geolocation.getCurrentPosition(pos=>{
   const coords=[pos.coords.latitude,pos.coords.longitude];
   if(userMark)ymap.geoObjects.remove(userMark);
   userMark=new ymaps.Placemark(coords,{hintContent:'Вы здесь'},{iconLayout:ymaps.templateLayoutFactory.createClass('<div class="route-pin-layout user-layout active" style="--route-color:#c93f7b;opacity:1;filter:none;"><div class="pin-badge" style="background:#c93f7b;color:#c93f7b;opacity:1;filter:none;"><span class="num">◎</span></div></div>'),iconShape:{type:'Rectangle',coordinates:[[-24,-58],[24,0]]},zIndex:140});
   ymap.geoObjects.add(userMark);
   routes.forEach(r=>{if(haversine(coords,r.coord)<=220) markPassed(r.id)});
   ymap.setCenter(coords,15,{duration:300});
   geoAction.classList.remove('active');
   updateRouteUI();
 },()=>{geoAction.classList.remove('active');geoAction.classList.add('error');setTimeout(()=>geoAction.classList.remove('error'),1200)},{enableHighAccuracy:true,timeout:8000,maximumAge:60000})
}
function formatTime(s){if(!isFinite(s))return'00:00';return`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`}
function resetAudio(){audio.pause();audio.currentTime=0;audioPlay.classList.remove('playing');audioSeek.value=0;audioCurrent.textContent='00:00'}
function toggleAudio(){audio.paused?audio.play():audio.pause()}
function safeOn(id,ev,fn){const el=$(id);if(el)el.addEventListener(ev,fn)}
safeOn('chooseRoute','click',()=>show('prologue'));
safeOn('goMapFromIntro','click',()=>show('yandex','intro'));
safeOn('openRouteMap','click',()=>{show('yandex','routes'); setTimeout(()=>{updateRouteUI(); openSheet();},180);});
safeOn('backToIntro','click',()=>show('intro'));
safeOn('goRouteSelect','click',()=>show('routes'));
safeOn('backToPrologue','click',()=>show('prologue'));
safeOn('mapLogoHome','click',()=>show('intro'));
safeOn('goHome','click',()=>show('intro'));
safeOn('openDrawer','click',()=>openDrawer('points'));
safeOn('openRouteList','click',()=>openDrawer('points'));
safeOn('closeDrawer','click',closeDrawer);
safeOn('geoAction','click',locateUser);
safeOn('closePointSheet','click',(e)=>{e.stopPropagation();closeSheet();});
safeOn('sheetToggle','click',(e)=>{e.stopPropagation();toggleSheet();});
safeOn('sheetPeek','click',openSheet);
pointSheet.addEventListener('click',e=>{ if(pointSheet.classList.contains('closed')) openSheet(); });
safeOn('mapBack','click',()=>changeRoute(-1));
safeOn('nextRoute','click',()=>changeRoute(1));
drawer.addEventListener('click',e=>{if(e.target===drawer)closeDrawer()});
drawerTabs.forEach(b=>b.addEventListener('click',()=>setDrawerTab(b.dataset.tab)));
$('drawerScrollArea').addEventListener('scroll',updateDrawerHint);
window.addEventListener('resize',updateDrawerHint);
document.querySelectorAll('.pin,.tab').forEach(el=>el.addEventListener('click',()=>selectRoute(el.dataset.route)));
document.querySelectorAll('.route-choice').forEach(el=>el.addEventListener('click',()=>setSelectedRoute(el.dataset.route)));
audio.addEventListener('play',()=>audioPlay.classList.add('playing'));audio.addEventListener('pause',()=>audioPlay.classList.remove('playing'));audio.addEventListener('loadedmetadata',()=>audioDuration.textContent=formatTime(audio.duration));audio.addEventListener('timeupdate',()=>{audioCurrent.textContent=formatTime(audio.currentTime);if(audio.duration)audioSeek.value=String(audio.currentTime/audio.duration*100)});audioSeek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=Number(audioSeek.value)/100*audio.duration});audioPlay.addEventListener('click',toggleAudio);
markViewed(selectedRoute); updateRouteUI(); renderDrawerList(); closeSheet();
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
