const CACHE_NAME = 'gym-app-v5';
const ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'icon.png'
];

// Εγκατάσταση του Service Worker
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Ενεργοποίηση αμέσως χωρίς αναμονή
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Ενεργοποίηση & Διαγραφή παλιών caches
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
        }).then(() => self.clients.claim()) // Αναλαμβάνει αμέσως τον έλεγχο όλων των ανοιχτών καρτελών
    );
});

// Στρατηγική Network-First (Έλεγχος για αλλαγές στο δίκτυο -> Fallback σε Cache αν είσαι Offline)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(e.request);
            })
    );
});
