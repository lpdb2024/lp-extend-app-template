/**
 * Firebase Authentication Boot File
 * Initializes Firebase and VueFire for authentication
 */

import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { VueFire, VueFireAuth } from 'vuefire'

// Firebase configuration for lp-extend
// These are client-side configs and safe to expose
// Values can be overridden via environment variables (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyABGslulkBv0XMu-pm6UDWX4TNDYtpi4fw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lp-extend.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lp-extend',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lp-extend.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '197832732724',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:197832732724:web:1cd1c1e4012efbe7c39a61',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-EKK0B6MF2B',
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

// Connect to emulators in development (if enabled)
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
if (useEmulators && import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
}

export default boot(({ app }) => {
  app.use(VueFire, {
    firebaseApp,
    modules: [
      VueFireAuth(),
    ],
  })
})
