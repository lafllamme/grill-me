export default defineNuxtPlugin(() => {
  if ('scrollRestoration' in window.history)
    window.history.scrollRestoration = 'auto'
})
