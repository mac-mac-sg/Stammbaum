export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  const localHostnames = new Set(['localhost', '127.0.0.1', '[::1]'])
  if (localHostnames.has(window.location.hostname)) return
  if (window.location.protocol !== 'https:') return

  window.addEventListener('load', () => {
    const moduleScript = Array.from(document.scripts).find((script) => script.type === 'module' && script.src)
    const buildKey = moduleScript
      ? new URL(moduleScript.src).pathname.split('/').pop() ?? 'app'
      : 'app'
    const serviceWorkerUrl = new URL('sw.js', document.baseURI)
    serviceWorkerUrl.searchParams.set('build', buildKey)

    navigator.serviceWorker
      .register(serviceWorkerUrl, { scope: './' })
      .then((registration) => registration.update())
      .catch((error) => {
        console.warn('Service Worker konnte nicht registriert werden.', error)
      })
  })
}
