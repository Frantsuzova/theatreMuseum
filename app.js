
const $ = (id) => document.getElementById(id);
const introScreen=$('introScreen'), prologueScreen=$('prologueScreen'), routesScreen=$('routesScreen'), yandexScreen=$('yandexScreen');
const routeTitle=$('routeTitle'), routeText=$('routeText'), mapPointTitle=$('mapPointTitle'), pointCounter=$('pointCounter'), mapPointText=$('mapPointText'), pointPreview=$('pointPreview');
const pointSheet=$('pointSheet'), sheetPeek=$('sheetPeek'), peekRouteText=$('peekRouteText'), peekPointPin=$('peekPointPin'), peekPointNum=$('peekPointNum'), geoAction=$('geoAction');
const audio=$('routeAudio'), audioPlay=$('audioPlay'), audioSeek=$('audioSeek'), audioCurrent=$('audioCurrent'), audioDuration=$('audioDuration');
const drawer=$('routeDrawer'), drawerList=$('drawerRouteList'), drawerRouteChip=$('drawerRouteChip'), drawerProgressLine=$('drawerProgressLine'), drawerProgressLabel=$('drawerProgressLabel');
const drawerTabs=[...document.querySelectorAll('.drawer-tab')];
const drawerPanels={points:$('drawerPanelPoints'),project:$('drawerPanelProject'),poster:$('drawerPanelPoster')};
const prologueMenuDrawer=$('prologueMenuDrawer');
const prologueMenuTabs=[...document.querySelectorAll('.prologue-menu-tab')];
const prologueMenuPanels={project:$('prologueMenuProject'),poster:$('prologueMenuPoster'),contact:$('prologueMenuContact')};
const contactModeButtons=[...document.querySelectorAll('.contact-mode')];
const contactForms={technical:$('technicalContactForm'),feedback:$('feedbackContactForm')};
const posterFilterButtons=[...document.querySelectorAll('.poster-filter-chip')];
const museumEvents=[...document.querySelectorAll('.museum-event')];
const prologueMenuBottomHint=$('prologueMenuBottomHint');
const draftText='Черновик карты маршрута. Сейчас это единая карта с четырьмя стартовыми точками; дальше сюда можно подставить четыре отдельно размеченные карты.';
const routes=[
 {id:1,colorClass:'c1',color:'#ffd33f',title:'1. Музей-квартира Римского-Корсакова → Театральный музей',shortTitle:'Музей-квартира Римского-Корсакова → Театральный музей',blurb:'Маршрут о творческом взаимопонимании, раннем узнавании таланта и прогулке, в которой разговор продолжается на ходу.',coord:[59.924567,30.340964],previewImg:'./assets/point-1.png',previewAlt:'Музей-квартира Н.А. Римского-Корсакова'},
 {id:2,colorClass:'c2',color:'#59c2ff',title:'2. Театральный музей → Шереметевский дворец — Музей музыки',shortTitle:'Театральный музей → Шереметевский дворец — Музей музыки',blurb:'Маршрут о конфликте старого и нового театра, реформе сцены и моменте, когда художественный риск становится поступком.',coord:[59.931145,30.336659],previewImg:'./assets/point-2.png',previewAlt:'Театральный музей'},
 {id:3,colorClass:'c3',color:'#ce68ff',title:'3. Шереметевский дворец — Музей музыки → Музей актеров Самойловых',shortTitle:'Шереметевский дворец — Музей музыки → Музей актеров Самойловых',blurb:'Маршрут о Фонтанном доме, памяти музыкального салона и дружеской встрече, из которой рождается разговор о прошлом.',coord:[59.936012,30.345461],previewImg:'./assets/point-3.png',previewAlt:'Шереметевский дворец — Музей музыки'},
 {id:4,colorClass:'c4',color:'#7ee36a',title:'4. Музей актеров Самойловых → Музей-квартира Н.А. Римского-Корсакова',shortTitle:'Музей актеров Самойловых → Музей-квартира Н.А. Римского-Корсакова',blurb:'Маршрут о преемственности, художественном взгляде двух поколений и движении между памятью и ожиданием нового.',coord:[59.931140,30.350735],previewImg:'./assets/point-4.png',previewAlt:'Музей актеров Самойловых'}
];
const landmarks=[
 {title:'Думская башня',coord:[59.934684,30.329620],img:'./assets/dumskaya.png'},
 {title:'Собор Владимирской иконы Божией Матери',coord:[59.928181,30.348258],img:'./assets/vladimir.png'},
 {title:'Аничков мост',coord:[59.933203,30.343375],img:'./assets/anichkov.png'}
];
const PROGRESS_STORAGE_KEY='gm_progress_v1';
function readProgressState(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)||'null');
    if(saved && saved.version===1) return saved;
  }catch(error){}
  const legacyVisited=JSON.parse(sessionStorage.getItem('gm_visited_routes')||'[]');
  const legacyPassed=JSON.parse(sessionStorage.getItem('gm_passed_routes')||'[]');
  const legacyViewed=JSON.parse(sessionStorage.getItem('gm_viewed_routes')||'[]');
  return {
    version:1,
    selectedRoute:Number(sessionStorage.getItem('gm_current_route')||1),
    passed:legacyPassed,
    viewed:legacyViewed.length?legacyViewed:legacyVisited,
    updatedAt:Date.now()
  };
}
const persistedProgress=readProgressState();
let selectedRoute=Number(persistedProgress.selectedRoute||1);
let passed=new Set((persistedProgress.passed||[]).map(Number));
let viewed=new Set((persistedProgress.viewed||[]).map(Number));
viewed.add(selectedRoute);
let ymap=null, yandexReadyPromise=null, routeObjects=[], userMark=null, mapSource='intro';
const drawerBottomHint=document.querySelector('.drawer-bottom-hint');
const pointGalleryOverlay=$('pointGalleryOverlay'), pointStoryOverlay=$('pointStoryOverlay');
const pointGalleryBoard=$('pointGalleryBoard'), pointStoryScroll=$('pointStoryScroll');
const storyHeaderKicker=$('storyHeaderKicker'), pointStoryScrollHint=$('pointStoryScrollHint');
const galleryTitle=$('galleryTitle'), galleryHeaderKicker=$('galleryHeaderKicker');
const galleryThumbs=$('galleryThumbs'), galleryMainImage=$('galleryMainImage');
const galleryActiveNumber=$('galleryActiveNumber'), galleryActiveTitle=$('galleryActiveTitle'), galleryActiveText=$('galleryActiveText');
const galleryCounter=$('galleryCounter');
const galleryScrollHint=document.querySelector('.camera-gallery-scroll-hint');
const galleryViewfinder=$('galleryViewfinder'), galleryFullscreen=$('galleryFullscreen'), galleryFullscreenToggle=$('galleryFullscreenToggle'), galleryFullscreenImage=$('galleryFullscreenImage'), galleryFullscreenTitle=$('galleryFullscreenTitle'), galleryFullscreenText=$('galleryFullscreenText');
const galleryState={items:[],activeIndex:0,isSwitching:false,isExpanded:false};
function route(){return routes.find(r=>r.id===selectedRoute)||routes[0]}
function saveState(){
  const state={version:1,selectedRoute,passed:[...passed],viewed:[...viewed],updatedAt:Date.now()};
  try{localStorage.setItem(PROGRESS_STORAGE_KEY,JSON.stringify(state));}catch(error){}
  sessionStorage.setItem('gm_current_route',String(selectedRoute));
  sessionStorage.setItem('gm_passed_routes',JSON.stringify([...passed]));
  sessionStorage.setItem('gm_viewed_routes',JSON.stringify([...viewed]));
}
function markViewed(id){viewed.add(Number(id));saveState();}
function markPassed(id){passed.add(Number(id));saveState();}
function statusFor(id){id=Number(id); if(passed.has(id)) return 'passed'; if(viewed.has(id)) return 'viewed'; return 'unvisited';}
function labelFor(id){const st=statusFor(id); return st==='passed'?'пройдена':st==='viewed'?'просмотрена':'впереди'}
function exploredCount(){return new Set([...passed,...viewed]).size}
function show(name,source='intro'){
 if(name!=='prologue') closePrologueMenu();
 introScreen.hidden=name!=='intro'; prologueScreen.hidden=name!=='prologue'; routesScreen.hidden=name!=='routes'; yandexScreen.hidden=name!=='yandex';
 if(name==='prologue' || name==='routes'){
   updateRouteUI();
   requestAnimationFrame(()=>{
     if(name==='prologue') fitPrologueLayout();
     if(name==='routes') fitRouteSelectLayout();
   });
 }
 if(name==='yandex'){
   mapSource=source;
   closeDrawer();
   closePointOverlay(pointGalleryOverlay);
   closePointOverlay(pointStoryOverlay);
   updateRouteUI();
   closeSheet();
   initMapWhenVisible();
   setTimeout(resizeMapSoon, 120);
 } else {
   closePointOverlay(pointGalleryOverlay);
   closePointOverlay(pointStoryOverlay);
 }
}
function updateRouteUI(){
 const r=route();
 routeTitle.textContent=r.title; routeText.textContent=r.blurb || draftText;
 pointCounter.textContent=`Точка ${r.id} из 4`; mapPointTitle.textContent=r.shortTitle; mapPointText.textContent=draftText;
 pointPreview.className=`point-preview ${r.colorClass}`; pointPreview.innerHTML=r.previewImg?`<img src="${r.previewImg}" alt="${r.previewAlt||r.shortTitle}">`:String(r.id);
 peekRouteText.textContent=`#${r.id}`; peekPointNum.textContent=r.id; peekPointPin.className=`peek-pin ${r.colorClass}`;
 document.querySelectorAll('.pin,.tab,.route-choice').forEach(el=>el.classList.toggle('active',Number(el.dataset.route)===r.id));
 renderDrawerList(); updateMapMarkers();
 if(pointGalleryOverlay && !pointGalleryOverlay.hidden) renderPointGallery();
 closeGalleryFullscreen();
 if(pointStoryOverlay && !pointStoryOverlay.hidden) renderPointStory();
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

function updatePrologueMenuHint(){
 const scroll=$('prologueMenuScroll');
 if(!scroll||!prologueMenuBottomHint||prologueMenuDrawer.hidden) return;

 // Measure only the currently visible section and ignore the extra bottom space
 // reserved for the hint itself. This keeps the hint hidden on compact forms
 // that already fit completely on screen.
 scroll.classList.remove('has-scroll-hint');
 const activePanel=[...scroll.children].find(node=>!node.hidden);
 const contentHeight=activePanel?activePanel.scrollHeight:0;
 const canScroll=contentHeight>scroll.clientHeight+12;

 prologueMenuBottomHint.hidden=!canScroll;
 scroll.classList.toggle('has-scroll-hint',canScroll);
 if(!canScroll){
   scroll.scrollTop=0;
   return;
 }

 const atTop=scroll.scrollTop<=2;
 const atBottom=scroll.scrollTop+scroll.clientHeight>=scroll.scrollHeight-2;
 prologueMenuBottomHint.querySelector('span').textContent=atTop?'↓ листайте':(atBottom?'↑ наверх':'↕ листайте');
}
function setPrologueMenuTab(tab){
 prologueMenuTabs.forEach(btn=>btn.classList.toggle('active',btn.dataset.prologueTab===tab));
 Object.entries(prologueMenuPanels).forEach(([key,panel])=>{
   if(!panel) return;
   panel.hidden=key!==tab;
   panel.classList.toggle('active',key===tab);
 });
 const scroll=$('prologueMenuScroll');
 if(scroll) scroll.scrollTop=0;
 setTimeout(updatePrologueMenuHint,30);
}
function setPosterFilter(filter){
 posterFilterButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.posterFilter===String(filter)));
 museumEvents.forEach(event=>{
   const visible=filter==='all'||event.dataset.venue===String(filter);
   event.hidden=!visible;
 });
 const scroll=$('prologueMenuScroll');
 if(scroll) scroll.scrollTop=0;
 setTimeout(updatePrologueMenuHint,30);
}
function openPrologueMenu(tab='project'){
 if(!prologueMenuDrawer) return;
 prologueMenuDrawer.hidden=false;
 prologueMenuDrawer.removeAttribute('hidden');
 setPrologueMenuTab(tab);
 requestAnimationFrame(()=>prologueMenuDrawer.classList.add('open'));
 setTimeout(updatePrologueMenuHint,80);
}
function closePrologueMenu(){
 if(!prologueMenuDrawer) return;
 prologueMenuDrawer.classList.remove('open');
 setTimeout(()=>{if(!prologueMenuDrawer.classList.contains('open'))prologueMenuDrawer.hidden=true},260);
}
function setContactMode(mode){
 contactModeButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.contactMode===mode));
 Object.entries(contactForms).forEach(([key,form])=>{
   if(!form) return;
   form.hidden=key!==mode;
   form.classList.toggle('active',key===mode);
 });
 const active=contactForms[mode];
 if(active){
   const status=active.querySelector('.contact-form-status');
   if(status) status.textContent='';
 }
 setTimeout(updatePrologueMenuHint,30);
}

function galleryItemsForRoute(r){
 const shots=[
   {src:'./assets/gallery-photo-canal.png', alt:'Набережная канала в Петербурге', title:'Lorem ipsum dolor', text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.', position:'center center'},
   {src:'./assets/gallery-photo-arcade.png', alt:'Аркада здания в Петербурге', title:'Dolor sit amet', text:'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.', position:'center center'}
 ];
 const titles=[
   ['Lorem ipsum dolor','Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore. Pellentesque habitant morbi tristique senectus et netus.'],
   ['Dolor sit amet','Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore. Vestibulum congue enim vitae est porttitor, ac vulputate leo facilisis.'],
   ['Consectetur elit','Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo vel augue. Aenean dictum lectus nec ante ultrices, a dapibus odio luctus.'],
   ['Adipiscing elit','Curabitur blandit, velit risus maximus tellus, vitae posuere sapien justo non pretium. Mauris interdum massa nec dui mollis, ac tempus magna iaculis.'],
   ['Sed do eiusmod','Praesent commodo neque at fermentum ultrices. Etiam gravida cursus est at sodales. Duis sit amet erat non tortor tempor sagittis in nec lacus.'],
   ['Tempor incididunt','Aenean feugiat risus eu semper pulvinar. Donec ut pretium nibh, non aliquet nisi. Aliquam at arcu ut neque molestie volutpat non sed lorem.'],
   ['Ut labore','Integer suscipit tortor nec turpis faucibus, vitae auctor purus feugiat. Suspendisse potenti. Fusce sed turpis volutpat, aliquet ante non, facilisis velit.'],
   ['Dolore magna','Morbi feugiat nisi at neque dictum, nec placerat lorem fermentum. Quisque consequat mi sed lectus blandit, sed eleifend orci imperdiet.']
 ];
 return titles.map((entry,index)=>({
   ...shots[index % 2],
   title:entry[0],
   text:entry[1]
 }));
}
function renderGalleryThumbs(){
 if(!galleryThumbs) return;
 galleryThumbs.innerHTML=galleryState.items.map((item,index)=>`<button class="camera-gallery-thumb ${index===galleryState.activeIndex?'active':''}" type="button" data-gallery-index="${index}" aria-label="Открыть фотографию ${index+1}: ${item.title}"><span class="camera-gallery-thumb-image"><img src="${item.src}" alt=""></span><span class="camera-gallery-thumb-copy"><strong>${String(index+1).padStart(2,'0')}. ${item.title}</strong></span></button>`).join('');
}
function getGalleryHiddenThumbCount(){
 if(typeof syncGalleryThumbVisibility==='function') return syncGalleryThumbVisibility().hidden;
 if(!galleryThumbs) return 0;
 const wrapRect=galleryThumbs.getBoundingClientRect();
 const thumbs=[...galleryThumbs.querySelectorAll('.camera-gallery-thumb')];
 let hiddenCount=0;
 thumbs.forEach((thumb)=>{
   const rect=thumb.getBoundingClientRect();
   const hiddenTop=rect.top < wrapRect.top + 1;
   const hiddenBottom=rect.bottom > wrapRect.bottom - 1;
   if(hiddenTop || hiddenBottom) hiddenCount++;
 });
 return hiddenCount;
}
function updateGalleryScrollHint(){
 if(!galleryThumbs || !galleryScrollHint) return;
 const canScroll=galleryThumbs.scrollHeight>galleryThumbs.clientHeight+8;
 if(!canScroll){
   galleryScrollHint.hidden=true;
   galleryThumbs.classList.remove('is-scrollable','needs-hint','single-hidden');
   galleryThumbs.scrollTop=0;
   return;
 }
 const hiddenCount=getGalleryHiddenThumbCount();
 galleryThumbs.classList.add('is-scrollable');
 galleryThumbs.classList.toggle('needs-hint',hiddenCount>=2);
 galleryThumbs.classList.toggle('single-hidden',hiddenCount===1);
 galleryScrollHint.hidden=hiddenCount<2;
 if(hiddenCount<2) return;
 const atTop=galleryThumbs.scrollTop<=2;
 const atBottom=galleryThumbs.scrollTop+galleryThumbs.clientHeight>=galleryThumbs.scrollHeight-2;
 galleryScrollHint.textContent=atBottom?'↑ наверх':(atTop?'↓ листайте':'↕ листайте');
}
function alignGalleryThumbsToActive(){
 if(!galleryThumbs) return;
 const activeThumb=galleryThumbs.querySelector('.camera-gallery-thumb.active');
 const canScroll=galleryThumbs.scrollHeight>galleryThumbs.clientHeight+8;
 if(!activeThumb || !canScroll) return;
 const viewTop=galleryThumbs.scrollTop;
 const maxScroll=Math.max(0,galleryThumbs.scrollHeight-galleryThumbs.clientHeight);
 let target=viewTop;
 if(galleryState.activeIndex<=0){
   target=0;
 }else if(galleryState.activeIndex>=galleryState.items.length-1){
   target=maxScroll;
 }else{
   const itemTop=activeThumb.offsetTop;
   const itemBottom=itemTop+activeThumb.offsetHeight;
   const viewBottom=viewTop+galleryThumbs.clientHeight;
   const thumbGap=parseFloat(galleryThumbs.style.gap || getComputedStyle(galleryThumbs).gap || '4') || 4;
   const thumbHeight=activeThumb.offsetHeight || 0;
   const topInset=Math.max(4, Math.round(Math.max(thumbGap * 0.8, thumbHeight * 0.10)));
   const bottomInset=Math.max(4, Math.round(Math.max(thumbGap * 0.75, thumbHeight * 0.10)));
   if(itemTop < viewTop + topInset){
     target=itemTop-topInset;
   }else if(itemBottom > viewBottom - bottomInset){
     target=itemBottom-galleryThumbs.clientHeight+bottomInset;
   }
   target=Math.max(0,Math.min(maxScroll,target));
 }
 if(Math.abs(target-viewTop) > 1) galleryThumbs.scrollTo({top:target,behavior:'auto'});
}
function updateGalleryView(){
 const item=galleryState.items[galleryState.activeIndex];
 if(!item) return;
 if(galleryMainImage){
   galleryMainImage.src=item.src;
   galleryMainImage.alt=item.alt;
   galleryMainImage.style.objectPosition=item.position||'center center';
 }
 if(galleryActiveNumber) galleryActiveNumber.textContent=String(galleryState.activeIndex+1).padStart(2,'0');
 if(galleryActiveTitle) galleryActiveTitle.textContent=item.title;
 if(galleryActiveText) galleryActiveText.textContent=item.text;
 if(galleryCounter) galleryCounter.textContent=`${String(galleryState.activeIndex+1).padStart(2,'0')} / ${String(galleryState.items.length).padStart(2,'0')}`;
 if(galleryFullscreenImage){ galleryFullscreenImage.src=item.src; galleryFullscreenImage.alt=item.alt; }
 if(galleryFullscreenTitle) galleryFullscreenTitle.textContent=item.title;
 if(galleryFullscreenText) galleryFullscreenText.textContent=item.text;
 if(galleryThumbs){
   galleryThumbs.querySelectorAll('[data-gallery-index]').forEach((button,index)=>{
     const active=index===galleryState.activeIndex;
     button.classList.toggle('active',active);
     button.setAttribute('aria-current',active?'true':'false');
   });
   alignGalleryThumbsToActive();
   [0,80,200].forEach(delay=>window.setTimeout(()=>{syncGalleryThumbVisibility(); updateGalleryScrollHint();},delay));
 }
}
function openGalleryFullscreen(){
 if(!galleryFullscreen || !galleryFullscreenImage || !galleryState.items.length) return;
 galleryState.isExpanded=true;
 galleryFullscreen.hidden=false;
 galleryFullscreen.setAttribute('aria-hidden','false');
 requestAnimationFrame(()=>galleryFullscreen.classList.add('open'));
}
function closeGalleryFullscreen(){
 if(!galleryFullscreen) return;
 galleryState.isExpanded=false;
 galleryFullscreen.classList.remove('open');
 galleryFullscreen.setAttribute('aria-hidden','true');
 setTimeout(()=>{ if(!galleryFullscreen.classList.contains('open')) galleryFullscreen.hidden=true; },220);
}
function toggleGalleryFullscreen(){
 if(galleryState.isExpanded) closeGalleryFullscreen();
 else openGalleryFullscreen();
}

function selectGalleryItem(index){
 if(!pointGalleryBoard||galleryState.isSwitching||!galleryState.items.length) return;
 const total=galleryState.items.length;
 const nextIndex=(index+total)%total;
 if(nextIndex===galleryState.activeIndex) return;
 galleryState.isSwitching=true;
 pointGalleryBoard.classList.remove('is-blinking');
 void pointGalleryBoard.offsetWidth;
 pointGalleryBoard.classList.add('is-blinking');
 window.setTimeout(()=>{
   galleryState.activeIndex=nextIndex;
   updateGalleryView();
 },130);
 window.setTimeout(()=>{
   pointGalleryBoard.classList.remove('is-blinking');
   galleryState.isSwitching=false;
 },360);
}
function renderPointGallery(){
 if(!pointGalleryBoard || !galleryTitle || !galleryHeaderKicker) return;
 const r=route();
 galleryHeaderKicker.textContent=`Точка маршрута #${r.id}`;
 galleryTitle.textContent=r.shortTitle;
 galleryState.items=galleryItemsForRoute(r);
 galleryState.activeIndex=0;
 galleryState.isSwitching=false;
 renderGalleryThumbs();
 updateGalleryView();
 window.setTimeout(()=>{fitGalleryLayout();updateGalleryScrollHint();}, 90);
}

function updatePointStoryHint(){
 if(!pointStoryScroll || !pointStoryScrollHint) return;
 const canScroll=pointStoryScroll.scrollHeight>pointStoryScroll.clientHeight+8;
 pointStoryScrollHint.hidden=!canScroll;
 if(!canScroll) return;
 const atTop=pointStoryScroll.scrollTop<=3;
 const atBottom=pointStoryScroll.scrollTop+pointStoryScroll.clientHeight>=pointStoryScroll.scrollHeight-4;
 pointStoryScrollHint.querySelector('span').textContent=atBottom?'↑ наверх':(atTop?'↓ листайте':'↕ листайте');
}
function renderPointStory(){
 if(!pointStoryScroll) return;
 const r=route();
 const locationTitle=(r.shortTitle.split('→')[0]||r.shortTitle).trim();
 if(storyHeaderKicker) storyHeaderKicker.textContent=`Точка маршрута #${r.id}`;
 pointStoryScroll.innerHTML=`
   <article class="story-article">
     <div class="story-opening-meta story-opening-meta-compact">
       <span>Маршрут ${String(r.id).padStart(2,'0')}</span>
       <i></i>
       <b>${locationTitle} <span class="story-address-note">(адрес точки)</span></b>
     </div>

     <div class="story-rule story-rule-first"><span>История места</span><i></i></div>

     <section class="story-section">
       <h6>Lorem ipsum dolor sit amet, consectetur adipiscing elit</h6>
       <div class="story-columns">
         <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec mi nec massa tincidunt hendrerit. Integer ac dui at orci accumsan gravida. Maecenas feugiat nisl sed lectus dignissim, non faucibus odio tempor.</p>
         <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Donec sodales ligula id sapien sagittis, in posuere enim pellentesque. Aenean feugiat risus eu semper pulvinar.</p>
       </div>
     </section>

     <blockquote class="story-quote">
       <span class="story-quote-mark">“</span>
       <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.</p>
       <cite>— Lorem ipsum, dolor sit amet</cite>
     </blockquote>

     <figure class="story-image-band">
       <img src="./assets/gallery-photo-arcade.png" alt="Lorem ipsum dolor sit amet">
       <figcaption><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></figcaption>
     </figure>

     <div class="story-rule story-rule-second"><span>Контекст</span><i></i></div>

     <section class="story-section story-section-accent story-context-section">
       <h6>Praesent commodo neque at fermentum ultrices</h6>
       <div class="story-context-copy">
         <p>Phasellus efficitur neque vel nibh mollis, vitae porta lectus suscipit. Aliquam erat volutpat. Etiam gravida cursus est, at sodales augue tristique sit amet. Nunc commodo, justo ac luctus consequat, augue erat fermentum ipsum, non gravida est erat a magna.</p>
         <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus at orci vitae arcu posuere luctus. Morbi feugiat nisi at neque dictum, nec placerat lorem fermentum. Praesent sit amet luctus lectus.</p>
       </div>
       <div class="story-end-mark" aria-hidden="true"><span></span><i></i><span></span></div>
     </section>
   </article>`;
 pointStoryScroll.scrollTop=0;
 requestAnimationFrame(updatePointStoryHint);
}
function closePointOverlay(overlay){
 if(!overlay) return;
 if(overlay===pointGalleryOverlay) closeGalleryFullscreen();
 overlay.classList.remove('open');
 setTimeout(()=>{if(!overlay.classList.contains('open')) overlay.hidden=true},260);
}
function openPointOverlay(overlay){
 if(!overlay) return;
 [pointGalleryOverlay,pointStoryOverlay].forEach(item=>{if(item&&item!==overlay) closePointOverlay(item)});
 if(overlay===pointGalleryOverlay) renderPointGallery();
 if(overlay===pointStoryOverlay) renderPointStory();
 overlay.hidden=false;
 overlay.removeAttribute('hidden');
 requestAnimationFrame(()=>{overlay.classList.add('open'); if(overlay===pointGalleryOverlay) fitGalleryLayout(); if(overlay===pointStoryOverlay||overlay===pointGalleryOverlay) fitPrologueLayout();});
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
   let savedMapView=null;
  try{savedMapView=JSON.parse(localStorage.getItem('gm_map_view_v1')||'null');}catch(error){}
  const initialCenter=Array.isArray(savedMapView?.center)?savedMapView.center:[59.931,30.3405];
  const initialZoom=Number(savedMapView?.zoom)||14;
  ymap=new ymaps.Map(el,{center:initialCenter,zoom:initialZoom,controls:['zoomControl']},{suppressMapOpenBlock:true,yandexMapDisablePoiInteractivity:true});
  let saveMapTimer=0;
  ymap.events.add('boundschange',()=>{
    window.clearTimeout(saveMapTimer);
    saveMapTimer=window.setTimeout(()=>{
      try{localStorage.setItem('gm_map_view_v1',JSON.stringify({center:ymap.getCenter(),zoom:ymap.getZoom(),updatedAt:Date.now()}));}catch(error){}
    },400);
  });
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
   if(!savedMapView){
     ymap.setBounds([[59.9225,30.3268],[59.9378,30.3528]],{checkZoomRange:true,zoomMargin:[48,24,116,24]});
   }
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
safeOn('openPrologueMenu','click',()=>openPrologueMenu('project'));
safeOn('openIntroMenu','click',()=>openPrologueMenu('project'));
safeOn('closePrologueMenu','click',closePrologueMenu);
safeOn('goRouteSelect','click',()=>show('routes'));
safeOn('backToPrologue','click',()=>show('prologue'));
safeOn('mapLogoHome','click',()=>show('intro'));
safeOn('goHome','click',()=>show('intro'));
safeOn('openDrawer','click',()=>openDrawer('points'));
safeOn('openRouteList','click',()=>openDrawer('points'));
safeOn('openPhotoGallery','click',(e)=>{e.preventDefault();e.stopPropagation();openPointOverlay(pointGalleryOverlay);});
safeOn('openPointStory','click',(e)=>{e.preventDefault();e.stopPropagation();openPointOverlay(pointStoryOverlay);});
safeOn('closePointGallery','click',(e)=>{e.preventDefault();e.stopPropagation();closePointOverlay(pointGalleryOverlay);});
safeOn('closePointStory','click',(e)=>{e.preventDefault();e.stopPropagation();closePointOverlay(pointStoryOverlay);});
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
prologueMenuTabs.forEach(b=>b.addEventListener('click',()=>setPrologueMenuTab(b.dataset.prologueTab)));
posterFilterButtons.forEach(b=>b.addEventListener('click',()=>setPosterFilter(b.dataset.posterFilter)));
contactModeButtons.forEach(b=>b.addEventListener('click',()=>setContactMode(b.dataset.contactMode)));
if(prologueMenuDrawer) prologueMenuDrawer.addEventListener('click',e=>{if(e.target===prologueMenuDrawer)closePrologueMenu()});
if(pointGalleryOverlay) pointGalleryOverlay.addEventListener('click',e=>{if(e.target===pointGalleryOverlay)closePointOverlay(pointGalleryOverlay)});
if(pointGalleryBoard) pointGalleryBoard.addEventListener('click',e=>{
 const thumb=e.target.closest('[data-gallery-index]');
 if(!thumb||!pointGalleryBoard.contains(thumb)) return;
 e.preventDefault();
 e.stopPropagation();
 selectGalleryItem(Number(thumb.dataset.galleryIndex));
});
if(pointStoryOverlay) pointStoryOverlay.addEventListener('click',e=>{if(e.target===pointStoryOverlay)closePointOverlay(pointStoryOverlay)});
if(galleryViewfinder) galleryViewfinder.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleGalleryFullscreen();});
if(galleryFullscreenToggle) galleryFullscreenToggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleGalleryFullscreen();});
if(galleryFullscreen) galleryFullscreen.addEventListener('click',e=>{ if(e.target===galleryFullscreen) closeGalleryFullscreen(); });
safeOn('galleryPrev','click',(e)=>{e.preventDefault();e.stopPropagation();selectGalleryItem(galleryState.activeIndex-1);});
safeOn('galleryNext','click',(e)=>{e.preventDefault();e.stopPropagation();selectGalleryItem(galleryState.activeIndex+1);});
document.querySelectorAll('.demo-contact-form').forEach(form=>form.addEventListener('submit',e=>{
 e.preventDefault();
 const status=form.querySelector('.contact-form-status');
 if(status) status.textContent='Спасибо! Интерфейс формы готов; отправку подключим к серверу на следующем этапе.';
}));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){closePrologueMenu();closeDrawer();closePointOverlay(pointGalleryOverlay);closePointOverlay(pointStoryOverlay);}
 if(pointGalleryOverlay && !pointGalleryOverlay.hidden && pointGalleryOverlay.classList.contains('open')){
   if(e.key==='ArrowLeft') selectGalleryItem(galleryState.activeIndex-1);
   if(e.key==='ArrowRight') selectGalleryItem(galleryState.activeIndex+1);
 }
});
$('drawerScrollArea').addEventListener('scroll',updateDrawerHint);
const prologueMenuScroll=$('prologueMenuScroll');
if(prologueMenuScroll) prologueMenuScroll.addEventListener('scroll',updatePrologueMenuHint);
window.addEventListener('resize',()=>{updateDrawerHint();updatePrologueMenuHint();});
document.querySelectorAll('.pin,.tab').forEach(el=>el.addEventListener('click',()=>selectRoute(el.dataset.route)));
document.querySelectorAll('.route-choice').forEach(el=>el.addEventListener('click',()=>setSelectedRoute(el.dataset.route)));
document.querySelectorAll('.museum-event').forEach(event=>event.addEventListener('click',e=>e.preventDefault()));
audio.addEventListener('play',()=>audioPlay.classList.add('playing'));audio.addEventListener('pause',()=>audioPlay.classList.remove('playing'));audio.addEventListener('loadedmetadata',()=>audioDuration.textContent=formatTime(audio.duration));audio.addEventListener('timeupdate',()=>{audioCurrent.textContent=formatTime(audio.currentTime);if(audio.duration)audioSeek.value=String(audio.currentTime/audio.duration*100)});audioSeek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=Number(audioSeek.value)/100*audio.duration});audioPlay.addEventListener('click',toggleAudio);
markViewed(selectedRoute); updateRouteUI(); renderDrawerList(); closeSheet();

window.addEventListener('pagehide',()=>{
  if(!ymap) return;
  try{localStorage.setItem('gm_map_view_v1',JSON.stringify({center:ymap.getCenter(),zoom:ymap.getZoom(),updatedAt:Date.now()}));}catch(error){}
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', async () => {
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloadingForUpdate = false;

    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        updateViaCache: 'none'
      });

      if (hadController) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (reloadingForUpdate) return;
          reloadingForUpdate = true;
          window.location.reload();
        });
      }

      let lastUpdateCheck = 0;
      const checkForUpdate = () => {
        const now = Date.now();
        if (now - lastUpdateCheck < 15 * 60 * 1000) return;
        lastUpdateCheck = now;
        registration.update().catch(() => {});
      };

      checkForUpdate();
      window.setInterval(checkForUpdate, 30 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });
      window.addEventListener('focus', checkForUpdate);
    } catch (error) {
      // The app remains usable even when service workers are unavailable.
    }
  });
}

if(galleryThumbs) galleryThumbs.addEventListener('scroll', ()=>{ syncGalleryThumbVisibility(); updateGalleryScrollHint(); }, {passive:true});
if(pointStoryScroll) pointStoryScroll.addEventListener('scroll', updatePointStoryHint, {passive:true});
window.addEventListener('resize', ()=>window.requestAnimationFrame(()=>{fitGalleryLayout();fitPrologueLayout();fitRouteSelectLayout();updateGalleryScrollHint();}));
window.addEventListener('load', ()=>window.requestAnimationFrame(()=>{fitGalleryLayout();fitPrologueLayout();fitRouteSelectLayout();updateGalleryScrollHint();}));

function syncGalleryThumbVisibility(){
 if(!galleryThumbs) return {hidden:0,total:0};
 const wrapRect=galleryThumbs.getBoundingClientRect();
 const thumbs=[...galleryThumbs.querySelectorAll('.camera-gallery-thumb')];
 let hidden=0;
 thumbs.forEach((thumb)=>{
   const rect=thumb.getBoundingClientRect();
   const fullyVisible=rect.top>=wrapRect.top-1 && rect.bottom<=wrapRect.bottom+1;
   thumb.classList.toggle('is-outside', !fullyVisible);
   thumb.setAttribute('aria-hidden', fullyVisible ? 'false' : 'true');
   if(!fullyVisible) hidden++;
 });
 return {hidden,total:thumbs.length};
}

function fitGalleryLayout(){
 const scene=document.querySelector('.camera-gallery-scene');
 const artboard=document.querySelector('.camera-gallery-artboard');
 const desc=document.querySelector('.camera-gallery-description');
 const descNum=document.querySelector('.camera-gallery-number');
 const descTitle=document.getElementById('galleryActiveTitle');
 const descText=document.getElementById('galleryActiveText');
 const descDivider=document.querySelector('.camera-gallery-divider');
 const prevBtn=document.querySelector('.camera-gallery-prev');
 const nextBtn=document.querySelector('.camera-gallery-next');
 const viewfinder=document.querySelector('.camera-gallery-viewfinder');
 const scrollHint=document.querySelector('.camera-gallery-scroll-hint');
 const bg=artboard?.querySelector('.camera-gallery-background');
 if(!scene || !galleryThumbs || !artboard || pointGalleryOverlay?.hidden) return;
 const rect=scene.getBoundingClientRect();
 if(rect.width<40 || rect.height<40) return;
 const w=rect.width, h=rect.height;
 const shortScreen=h<700;
 const mediumScreen=h<840;
 const tallScreen=h>=900;
 const narrow=w<345;
 const sidePad=narrow?8:10;
 const topAir=shortScreen?8:(tallScreen?12:10);
 const bottomAir=shortScreen?4:(tallScreen?8:6);
 const rowGap=shortScreen?4:(mediumScreen?5:6);
 const visibleCount=7;
 const assetW=(bg && bg.naturalWidth) || 1086;
 const assetH=(bg && bg.naturalHeight) || 947;
 const assetRatio=assetW/assetH;
 const camBottom=shortScreen?2:6;
 const camW=Math.min(w*(narrow?1.03:1.06), narrow?342:(tallScreen?404:392));
 const camH=Math.round(camW/assetRatio);
 const camLeft=(w-camW)/2;
 const cameraTop=h-camBottom-camH;
 artboard.style.width=`${camW}px`;
 artboard.style.height=`${camH}px`;
 artboard.style.left='50%';
 artboard.style.bottom=`${camBottom}px`;
 artboard.style.transform='translateX(-50%)';
 artboard.style.aspectRatio=`${assetW} / ${assetH}`;
 scene.style.setProperty('--cam-w',`${camW}px`);
 scene.style.setProperty('--cam-h',`${camH}px`);
 scene.style.setProperty('--cam-bottom',`${camBottom}px`);

 const thumbs=[...galleryThumbs.querySelectorAll('.camera-gallery-thumb')];
 const itemCount=Math.max(1, thumbs.length);
 const listTop=Math.round(topAir);
 const objectiveTop=Math.round(cameraTop + camH*(shortScreen?0.558:(tallScreen?0.565:0.562)));
 const listBottom=Math.max(listTop + 120, objectiveTop - bottomAir);
 const availableHeight=Math.max(140, listBottom - listTop);
 let rowHeight=Math.floor((availableHeight - rowGap*(visibleCount-1)) / visibleCount);
 if(shortScreen) rowHeight=Math.max(28, Math.min(40, rowHeight));
 else if(tallScreen) rowHeight=Math.max(34, Math.min(56, rowHeight));
 else rowHeight=Math.max(32, Math.min(48, rowHeight));
 const listHeight=Math.min(availableHeight, (rowHeight*visibleCount) + rowGap*(visibleCount-1));
 const listLeft=Math.round(w*(narrow?0.405:0.415));
 const descWidth=Math.round(w*(narrow?0.305:0.31));

 galleryThumbs.style.position='absolute';
 galleryThumbs.style.left=`${listLeft}px`;
 galleryThumbs.style.right=`${sidePad}px`;
 galleryThumbs.style.top=`${listTop}px`;
 galleryThumbs.style.height=`${listHeight}px`;
 galleryThumbs.style.bottom='auto';
 galleryThumbs.style.overflowY='auto';
 galleryThumbs.style.overflowX='hidden';
 galleryThumbs.style.padding='0';
 galleryThumbs.style.gap=`${rowGap}px`;
 galleryThumbs.style.webkitMaskImage='none';
 galleryThumbs.style.maskImage='none';
 galleryThumbs.style.clipPath='none';
 galleryThumbs.style.scrollPaddingTop='0px';
 galleryThumbs.style.scrollPaddingBottom='0px';
 galleryThumbs.style.scrollSnapType='y proximity';

 thumbs.forEach((thumb,index)=>{
   const portrait=index%2===1;
   const img=thumb.querySelector('.camera-gallery-thumb-image');
   const strong=thumb.querySelector('.camera-gallery-thumb-copy strong');
   const imageW=Math.round(rowHeight*(portrait?0.76:1.08));
   const imageH=Math.round(rowHeight*(portrait?1.08:0.78));
   thumb.style.setProperty('position','relative','important');
   thumb.style.setProperty('grid-template-columns',`${Math.max(28,imageW+5)}px minmax(0,1fr)`,'important');
   thumb.style.setProperty('gap',narrow?'5px':'6px','important');
   thumb.style.setProperty('height',`${rowHeight}px`,'important');
   thumb.style.setProperty('min-height',`${rowHeight}px`,'important');
   thumb.style.setProperty('align-items','center','important');
   thumb.style.scrollSnapAlign='start';
   if(img){
     img.style.setProperty('width',`${imageW}px`,'important');
     img.style.setProperty('height',`${imageH}px`,'important');
     img.style.setProperty('margin-left',portrait?'3px':'0','important');
   }
   if(strong){
     strong.style.setProperty('font-size',`${Math.max(7.2,Math.min(9.8,rowHeight*0.235))}px`,'important');
     strong.style.setProperty('line-height','1.08','important');
   }
 });

 if(desc){
   desc.style.position='absolute';
   desc.style.left=`${sidePad}px`;
   desc.style.top=`${listTop}px`;
   desc.style.width=`${descWidth}px`;
   desc.style.height=`${listHeight}px`;
   desc.style.minHeight='0';
   desc.style.padding=narrow?'9px 8px':'12px 10px 11px';
   desc.style.boxSizing='border-box';
   desc.style.overflow='hidden';
 }
 if(descNum){descNum.style.fontSize=narrow?'9px':'10px';descNum.style.marginBottom='8px';}
 if(descTitle){descTitle.style.fontSize=narrow?'15px':'18px';descTitle.style.lineHeight='1.02';descTitle.style.margin='0';}
 if(descText){descText.style.fontSize=narrow?'8.2px':'10px';descText.style.lineHeight='1.29';descText.style.margin='0';}
 if(descDivider) descDivider.style.margin=narrow?'7px 0':'9px 0';

 if(viewfinder){
   viewfinder.style.width=`${Math.round(camW*0.372)}px`;
   viewfinder.style.left='50%';
   viewfinder.style.top=`${Math.round(cameraTop+camH*0.642)}px`;
   viewfinder.style.transform='translate(-50%,-50%)';
 }

 const navWidth=narrow?58:68;
 const navHeight=narrow?25:28;
 const navTop=Math.round(cameraTop+camH*0.805-navHeight/2);
 const prevLeft=Math.round(camLeft+camW*0.035);
 const nextLeft=Math.round(camLeft+camW-navWidth-camW*0.035);
 [prevBtn,nextBtn].forEach(btn=>{
   if(!btn) return;
   btn.style.width=`${navWidth}px`;
   btn.style.height=`${navHeight}px`;
   btn.style.top=`${navTop}px`;
   btn.style.bottom='auto';
   btn.style.right='auto';
   btn.style.position='absolute';
 });
 if(prevBtn) prevBtn.style.left=`${prevLeft}px`;
 if(nextBtn) nextBtn.style.left=`${nextLeft}px`;
 if(scrollHint){
   scrollHint.style.right='5px';
   scrollHint.style.top=`${listTop+8}px`;
 }
 updateGalleryView();
 syncGalleryThumbVisibility();
 updateGalleryScrollHint();
}

function fitPrologueLayout(){
 const screen=document.querySelector('.prologue-screen:not([hidden])');
 if(!screen) return;
 const main=screen.querySelector('.prologue-main');
 const intro=screen.querySelector('.prologue-intro-card');
 const rules=screen.querySelector('.prologue-rules-card');
 const hero=screen.querySelector('.prologue-hero');
 if(!main||!intro||!rules) return;
 const h=screen.getBoundingClientRect().height||window.innerHeight;
 const w=screen.getBoundingClientRect().width||window.innerWidth;
 const shortScreen=h<710;
 const tall=h>=810;
 const veryTall=h>=900;
 const minIntro=shortScreen?0.72:0.82;
 const minRules=shortScreen?0.72:0.82;
 const maxIntro=veryTall?1.52:(tall?1.42:1.24);
 const maxRules=veryTall?1.58:(tall?1.48:1.28);
 let introScale=shortScreen?0.90:(tall?1.14:1.02);
 let rulesScale=shortScreen?0.90:(tall?1.16:1.04);
 let gap=shortScreen?10:(tall?16:13);
 let topGap=shortScreen?4:(tall?12:8);
 const targetFree=shortScreen?12:(tall?54:28);
 main.style.display='flex';
 main.style.flexDirection='column';
 main.style.justifyContent='flex-start';
 main.style.alignItems='stretch';
 main.style.overflow='hidden';
 intro.style.flex='0 0 auto';
 rules.style.flex='0 0 auto';
 intro.style.minHeight='0';
 rules.style.minHeight='0';
 intro.style.height='auto';
 rules.style.height='auto';
 function apply(){
   main.style.setProperty('--prologue-intro-scale',String(introScale));
   main.style.setProperty('--prologue-rules-scale',String(rulesScale));
   main.style.setProperty('--prologue-gap',`${Math.round(gap)}px`);
   main.style.setProperty('--prologue-top-gap',`${Math.round(topGap)}px`);
   main.style.setProperty('--prologue-intro-width',w<350?'68%':(tall?'72%':'70%'));
   if(hero){
     hero.style.height=shortScreen?'43%':(tall?'57%':'51%');
     hero.style.right=w<350?'-54px':'-44px';
   }
 }
 function metrics(){
   const contentBottom=rules.offsetTop+rules.offsetHeight;
   return {free:main.clientHeight-contentBottom,overflow:main.scrollHeight-main.clientHeight};
 }
 apply();
 let guard=0;
 while((metrics().overflow>1 || metrics().free<10) && guard<60){
   introScale=Math.max(minIntro,introScale-0.025);
   rulesScale=Math.max(minRules,rulesScale-0.028);
   gap=Math.max(8,gap-0.5);
   topGap=Math.max(2,topGap-0.3);
   apply();
   guard++;
 }
 guard=0;
 while(metrics().free>targetFree && guard<60){
   const canGrowIntro=introScale<maxIntro;
   const canGrowRules=rulesScale<maxRules;
   if(!canGrowIntro && !canGrowRules){
     if(gap<28) gap+=1.5;
     else if(topGap<22) topGap+=1;
     else break;
   }else{
     if(canGrowIntro) introScale=Math.min(maxIntro,introScale+0.02);
     if(canGrowRules) rulesScale=Math.min(maxRules,rulesScale+0.023);
   }
   apply();
   const m=metrics();
   if(m.overflow>1 || m.free<10){
     introScale=Math.max(minIntro,introScale-0.02);
     rulesScale=Math.max(minRules,rulesScale-0.023);
     apply();
     break;
   }
   guard++;
 }
}

function fitRouteSelectLayout(){
 const screen=document.querySelector('.route-select-screen:not([hidden])');
 if(!screen) return;
 const h=screen.getBoundingClientRect().height||window.innerHeight;
 const w=screen.getBoundingClientRect().width||window.innerWidth;
 const compact=h<720||w<350;
 const tall=h>=820;
 const scale=compact?0.90:(tall?1.08:1.0);
 screen.style.setProperty('--route-scale',String(scale));
 screen.style.setProperty('--route-card-h',`${Math.round((compact?78:(tall?96:88))*scale)}px`);
 screen.style.setProperty('--route-detail-h',`${Math.round((compact?145:(tall?195:170))*scale)}px`);
}

// v29 minor story header cleanup

