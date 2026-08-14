// 健脑乐园 Service Worker —— 离线缓存 Web 版全部资源
// 仅浏览器环境注册（Capacitor 原生 App 内不注册，见 index.html 守卫）
const CACHE = 'jiannao-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/icons.js',
  './js/science.js',
  './js/db.js',
  './js/app.js',
  './js/lib/sql-wasm.js',
  './js/lib/sql-wasm.wasm',
  './js/games/schulte.js',
  './js/games/cancellation.js',
  './js/games/memory.js',
  './js/games/trail.js',
  './js/games/difference.js',
  './icon/pwa-192.png',
  './icon/pwa-512.png',
  './icon/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // 导航请求：网络优先（确保 PWA 始终拿到最新页面），离线回退缓存
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // 静态资源：缓存优先，缺失则网络拉取并补缓存
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
