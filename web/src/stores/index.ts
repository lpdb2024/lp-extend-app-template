import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import { markRaw } from 'vue'
import router from 'src/router'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * with the Store instance.
 * async/await or return a Promise which resolves
 */

export default store((/* { ssrContext } */) => {
  const pinia = createPinia()
  pinia.use(({ store }) => {
    store.$router = markRaw(router)
  })
  return pinia
})
