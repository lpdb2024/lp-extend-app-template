import { useUserStore } from 'src/stores/store-user'
import { useFirebaseAuthStore } from 'src/stores/store-firebase-auth'
import {
  isInShellMode,
  isShellAuthenticated,
  getShellToken,
} from 'src/services/shell-auth.service'

class AuthService {
  /**
   * Check if running in shell mode (inside LP Extend iframe)
   */
  isShellMode(): boolean {
    return isInShellMode.value
  }

  /**
   * Get authentication token for API calls
   * Priority: Shell token (if in shell mode) > LP token > Firebase ID token > null
   */
  getToken(): string | null {
    // In shell mode, use shell token
    if (isInShellMode.value) {
      return getShellToken()
    }

    const firebaseAuth = useFirebaseAuthStore()
    const userStore = useUserStore()

    // Check for LP token (active LP session)
    const lpToken = userStore.getToken()
    if (lpToken) {
      return lpToken
    }

    // Fallback to Firebase ID token
    const firebaseToken = firebaseAuth.idToken
    if (firebaseToken) {
      return firebaseToken
    }

    return null
  }

  /**
   * Get auth headers for API calls
   * Returns X-Shell-Token header in shell mode, Authorization header otherwise
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    if (!token) return {}

    if (isInShellMode.value) {
      // Shell tokens use X-Shell-Token header
      return {
        'X-Shell-Token': token,
      }
    }

    // Standalone tokens use standard Authorization header
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  getUser() {
    return useUserStore().user
  }

  /**
   * Check if user is authenticated via any method
   */
  isAuthenticated(): boolean {
    // Check shell auth first
    if (isInShellMode.value) {
      return isShellAuthenticated.value
    }

    const firebaseAuth = useFirebaseAuthStore()
    const userStore = useUserStore()

    return firebaseAuth.isAuthenticated || !!userStore.getToken()
  }
}

export default new AuthService()
