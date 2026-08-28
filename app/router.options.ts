import type { RouterConfig } from '@nuxt/schema'
import { START_LOCATION } from 'vue-router'

export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    if (_from === START_LOCATION)
      return false

    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    return {
      top: 0,
      behavior: 'smooth',
    }
  },
}
