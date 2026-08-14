// 健脑乐园 Service Worker —— 离线缓存 Web 版全部资源
// 仅浏览器环境注册（Capacitor 原生 App 内不注册，见 index.html 守卫）
// 策略：网络优先（每次部署后立即拿到最新资源）+ 离线回退缓存
//      缓存名随版本递增（v2→v3→…），新 SW 激活时自动清除旧缓存，避免旧资源残留
const CACHE = 'jiannao-v3';
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

  // 网络优先：始终尝试拉取最新资源（确保每次部署后立即生效），
  // 仅在网络失败（离线）时回退到缓存；成功响应补入缓存以支撑离线可用。
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) =>
          cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
  );
});
