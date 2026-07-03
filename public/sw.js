// Service Worker tối giản cho PWA (giúp app cài được & chạy khi mạng chập chờn)
const CACHE = 'sagri-hrm-v1';
const PRECACHE = [
  '/attendance',
  '/history',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/models/tiny_face_detector_model-weights_manifest.json',
  '/models/tiny_face_detector_model.bin',
  '/models/face_landmark_68_model-weights_manifest.json',
  '/models/face_landmark_68_model.bin',
  '/models/face_recognition_model-weights_manifest.json',
  '/models/face_recognition_model.bin',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Không cache API (dữ liệu động) — luôn lấy từ mạng
  if (url.pathname.startsWith('/api/')) return;

  // Model khuôn mặt & tài nguyên tĩnh: cache-first
  if (url.pathname.startsWith('/models/') || url.pathname.startsWith('/icon') || url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  // Trang: network-first, fallback cache khi offline
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
