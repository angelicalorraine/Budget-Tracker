const STATIC_CACHE = 'static-cache-v1';
const RUNTIME_CACHE = 'data-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index.js',
  '/db.js',
  '/manifest.webmanifest',
  '/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// install event
self.addEventListener('install', event => {

  // precache transaction data
  event.waitUntil(
    caches
      .open(RUNTIME_CACHE)
      .then(cache => cache.add("/api/transaction"))
  );

  // precache static data
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();
});

// activate event
self.addEventListener('activate', event => {

  // remove old caches
  event.waitUntil(
    caches
      .keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
              console.log("Old cache data removed");
              return caches.delete(key);
            }
          })
        );
      })
  );

  self.clients.claim()
});

// fetch event
self.addEventListener('fetch', event => {

  // cache requests to api
  if (event.request.url.includes("/api/transaction")) {
    event.respondWith(
      caches
        .open(RUNTIME_CACHE)
        .then(cache => {
          return fetch(event.request)

            // clone if response is sucessful
            .then(response => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })

            // get from cache if response is unsuccessful
            .catch(err => cache.match(event.request));
        })
        .catch(err => console.log(err))
    );
    return;
  }

  // cached static files 
  event.respondWith(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        return cache
          .match(event.request)
          .then(response => {
            return response || fetch(event.request);
          });
      })
      .catch(err => console.log(err))
  );
});