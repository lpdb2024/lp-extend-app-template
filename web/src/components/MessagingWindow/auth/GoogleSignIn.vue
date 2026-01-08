<!-- <script>
// eslint-disable-next-line import/no-duplicates
import { GoogleAuthProvider } from 'firebase/auth'
export const googleAuthProvider = new GoogleAuthProvider()
</script>

<script setup>
import {
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

function signinPopup() {
  error.value = null
  signInWithPopup(auth, googleAuthProvider).catch((reason) => {
    console.error('Failed sign', reason)
    error.value = reason
  })
}
</script> -->
