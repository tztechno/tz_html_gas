


// location-worker.js
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('location-cache').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html'
      ]);
    })
  );
});

self.addEventListener('periodic-background-sync', function(event) {
  if (event.tag === 'location-tracking') {
    event.waitUntil(
      // 位置情報を取得して送信
      navigator.geolocation.getCurrentPosition(function(position) {
        const data = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };

        // データをキャッシュに保存
        caches.open('location-data').then(function(cache) {
          cache.put('/location', new Response(JSON.stringify(data)));
        });
      })
    );
  }
});
