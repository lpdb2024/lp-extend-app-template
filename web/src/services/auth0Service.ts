// import { injectAuth } from 'vue-auth0-plugin'

// class AuthService {
//   async getToken () {
//     // return window.sessionStorage.getItem('token')
//     const token = useUserStore().getToken()
//     return token
//   }

//   authLogin () {
//     window.addEventListener('message', (event) => {
//       if (event.origin === process.env.OAUTH2_ORIGIN && event.data.type === 'authorization_response') {
//         window.removeEventListener('message', () => {})
//         // this.$emit('changeSlide', 1)
//       }
//     })
//     this.auth.loginWithPopup({ auto_login: false })
//   }
// }
