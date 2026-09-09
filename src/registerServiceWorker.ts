export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  const localHostnames = new Set(['localhost', '127.0.0.1', '[::1]'])
  if (localHostnames.has(window.location.hostname)) return
  if (window.location.protocol !== 'https:') return

  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('sw.js', document.baseURI)
    navigator.serviceWorker.register(serviceWorkerUrl, { scope: './' }).catch((error) => {
      console.warn('Service Worker konnte nicht registriert werden.', error)
    })
  })
}
