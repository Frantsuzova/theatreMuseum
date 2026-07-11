const CACHE='gorod-muzyki-v6';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/logo.png','./assets/intro-bg.jpg','./assets/hero.png','./assets/old-map.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});
