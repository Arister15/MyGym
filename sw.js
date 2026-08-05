const CACHE_NAME = 'gym-app-v3';
const ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'icon.png'
];

// Εγκατάσταση του Service Worker και αποθήκευση των αρχείων στην Cache
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Ενεργοποίηση και καθαρισμός παλιών caches αν αλλάξει η έκδοση
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Στρατηγική Cache-First: Αν υπάρχει στην cache, φόρτωσε το από εκεί, αλλιώς κάνε network request
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request);
        })
    );
});
