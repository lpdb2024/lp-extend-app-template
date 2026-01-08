import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type { Router } from 'vue-router'
import router from 'src/router'

declare module 'pinia' {
    export interface PiniaCustomProperties {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        router: Router
    }
}

import { boot } from 'quasar/wrappers'
const pinia = createPinia()

export default boot(({ app }) => {
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use(router as any)
})
