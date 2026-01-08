/* eslint-disable @typescript-eslint/no-explicit-any */
 
import VueAuth0Plugin from 'vue-auth0-plugin'
import { boot } from 'quasar/wrappers'

type authOptions = {
  domain: string,
  clientId: string,
  scope: string,
  redirect_uri: string,
  redirectUri: string,
  useRefreshTokens: boolean,
  cacheLocation: string,
  authorizationParams: {
    redirect_uri: string
  },
  audience: 'https://dev-7-obgo2p.au.auth0.com/api/v2/'
}
export default boot(({ app, router }) => {
  const useAuth = () => {
    const redirect_uri = window.location.origin + '/auth0-callback'
    const options: authOptions = {
      domain: 'dev-7-obgo2p.au.auth0.com',
      clientId: 'gcFEFNaN4gIKwMklCGXpCtFG0Q7O3uCh',
      redirect_uri,
      redirectUri: redirect_uri,
      useRefreshTokens: true,
      scope: 'openid profile email',
      cacheLocation: 'localstorage',
      authorizationParams: {
        redirect_uri
      },
      audience: 'https://dev-7-obgo2p.au.auth0.com/api/v2/'
    }
    app.use(VueAuth0Plugin, options as any)
  }
  const authPerRoute = false
  if (authPerRoute) {
    router.beforeEach((to, from, next) => {
      /* boot auth0 plugin IF using demo viewer */
      console.info(to.meta.useOauth)
      if (to.meta.useOauth) {
        useAuth()
      }
      next()
    })
  } else {
    useAuth()
  }
})
