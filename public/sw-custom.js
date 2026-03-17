// Custom service worker additions for StudioDesk
self.addEventListener('fetch', (event) => {
  // Cache Immich thumbnail responses
  if (event.request.url.includes('/api/immich/asset/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
             return response;
          }
          const clone = response.clone()
          caches.open('immich-thumbnails').then(cache => {
            cache.put(event.request, clone)
          })
          return response
        }).catch(() => {
          return caches.match('/offline');
        })
      })
    )
  }

  // Handle offline fallback for pages
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline');
      })
    );
  }
})
