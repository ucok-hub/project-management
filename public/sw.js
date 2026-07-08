// Service worker minimal — cukup untuk menjadikan aplikasi installable (PWA).
// Sengaja tidak meng-cache agresif agar data tidak basi.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Biarkan permintaan berjalan normal ke jaringan.
});
