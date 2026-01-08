import type { AxiosResponse, AxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios'
import { api as axios } from 'boot/axios'
import axiosRetry from 'axios-retry'
import AuthService from './AuthService'
import { v4 as uuidv4 } from 'uuid'
import { APP_TRACE_ID } from 'src/constants'
import { useUserStore } from 'src/stores/store-user';

axiosRetry(axios, { retries: 3, retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount) })

class ApiService {
  inFlightRequests: Map<string, AbortController> = new Map()


  constructor (private authService: typeof AuthService) {}

  private get base () {
    return (
      ''
      // import.meta.env.VITE_PROXY_URL || import.meta.env.VITE_BASE_API_URL || ''
    )
  }

  accessTokenFromBearer = (token: string) => {
    return token.replace('Bearer ', '')
  }

  private getUserId (): string | null {
    // Dynamically import to avoid circular dependency
    try {
      const userStore = useUserStore()
      return userStore.user?.id?.toString() || null
    } catch {
      return null
    }
  }

  private getHeaders (t?: string) {
    const headers: Record<string, string> = { [APP_TRACE_ID]: uuidv4() }

    // Inject user-id header for LP API routes that need it
    const userId = this.getUserId()
    if (userId) {
      headers['user-id'] = userId
    }

    // If token is explicitly passed, use it as Bearer token (override)
    if (t) {
      return {
        ...headers,
        Authorization: `Bearer ${t}`,
        'access-token': this.accessTokenFromBearer(t)
      }
    }

    // Get auth headers from AuthService (handles shell vs standalone mode)
    const authHeaders = this.authService.getAuthHeaders()
    if (Object.keys(authHeaders).length > 0) {
      const token = this.authService.getToken()
      return {
        ...headers,
        ...authHeaders,
        // Also include access-token for backwards compatibility (not in shell mode)
        ...(token && !this.authService.isShellMode() ? { 'access-token': this.accessTokenFromBearer(token) } : {})
      }
    }

    return headers
  }

  private cancelAndCache (key: string) {
    if (this.inFlightRequests.has(key)) {
      this.inFlightRequests.get(key)?.abort()
    }

    const controller = new AbortController()
    this.inFlightRequests.set(key, controller)
    return controller
  }

  hasInflightRequest (key: string) {
    return this.inFlightRequests.has(key)
  }

  private async handleInflight<T> (
    response: Promise<AxiosResponse<T>>,
    key: string
  ) {
    return response
      .then((res) => {
        this.inFlightRequests.delete(key)
        return res
      })
      .catch((err: AxiosError) => {
        if (err.code === AxiosError.ERR_CANCELED) {
          throw err
        }
        this.inFlightRequests.delete(key)
        throw err
      })
  }

  async get<T> (
    path: string,
    key: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
    ignoreBase = false
  ) {
    const controller = this.cancelAndCache(key)
    const t = config?.headers?.authorization
    console.info(config?.headers)
    const authHeader = this.getHeaders(t)
    const baseURL = ignoreBase ? '' : ''
    const axiosConfig = {
      ...config,
      headers: { ...config?.headers || {}, ...authHeader },
      signal: controller.signal,
      params
    }
    console.info('axiosConfig', axiosConfig)
    const url = `${baseURL}/${path}`
    // console.info(axiosConfig)
    return this.handleInflight<T>(
      axios.get<T>(url, axiosConfig),
      key
    )
  }

  async post<T> (path: string, data: unknown, key: string, headers?: Record<string, string>, showProgress?: boolean) {
    const controller = this.cancelAndCache(key)
    console.info('headers?.authorization', headers)
    const authHeader = this.getHeaders(headers?.authorization)

    console.warn('authHeader', authHeader)
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${path}`,
      headers: { ...authHeader, ...headers },
      signal: controller.signal,
      data
    }
    if (showProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
        console.info(`percentCompleted: ${percentCompleted}`)
      }
    }

    return this.handleInflight<T>(
      axios(config),
      key
    )
  }

  async postMultiple (path: string, data: unknown, headers?: Record<string, string>) {
    console.info('headers?.authorization', headers)
    const authHeader = this.getHeaders(headers?.authorization)

    console.warn('authHeader', authHeader)
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${path}`,
      headers: { ...authHeader, ...headers },
      data
    }
    return axios(config)
  }

  async put<T> (path: string, body: unknown, key: string, customHeaders?: Record<string, string>) {
    const controller = this.cancelAndCache(key)
    const authHeader = this.getHeaders()
    const headers = { ...authHeader, ...customHeaders || {} }
    return this.handleInflight<T>(
      axios.put<T>(path, body, {
        headers,
        signal: controller.signal
      }),
      key
    )
  }

  async patch<T> (path: string, body: unknown, key: string) {
    const controller = this.cancelAndCache(key)
    const authHeader = this.getHeaders()
    return this.handleInflight<T>(
      axios.patch<T>(`${this.base}/${path}`, body, {
        headers: authHeader,
        signal: controller.signal
      }),
      key
    )
  }

  async delete<T> (path: string, key: string, params?: Record<string, unknown>, body?: unknown, headers?: Record<string, string>) {
    const controller = this.cancelAndCache(key)
    const authHeader = this.getHeaders()
    const finalHeaders = headers ? { ...authHeader, ...headers } : authHeader
    return this.handleInflight(
      axios.delete<T>(path, {
        headers: finalHeaders,
        signal: controller.signal,
        params,
        data: body
      }),
      key
    )
  }
}

export default new ApiService(AuthService)
