class CacheItem {
  ttl: number
  value: unknown
  constructor (ttl: number, value: unknown) {
    this.ttl = ttl
    this.value = value
  }
}

export class MemCache {
  cache: Record<string, CacheItem>
  constructor () {
    this.cache = {}
  }

  update (key: string, value: unknown, ttlSeconds: number) {
    const item = this.cache[key]
    if (item) {
      item.value = value
      item.ttl = Math.floor(Date.now() / 1000) + ttlSeconds
      this.cache[key] = item
    } else {
      this.add(key, value, ttlSeconds)
    }
  }

  get (key: string): unknown {
    const item = this.cache[key]
    if (item) {
      if (item.ttl > Math.floor(Date.now() / 1000)) {
        return item.value
      } else {
        delete this.cache[key]
      }
    }
    return null
  }

  add (key: string, value: unknown, ttlSeconds: number) {
    this.cache[key] = new CacheItem(
      Math.floor(Date.now() / 1000) + ttlSeconds,
      value
    )
  }

  remove (key: string) {
    delete this.cache[key]
  }

  getAll (): CacheItem[] {
    return Object.values(this.cache)
  }
}

export class LocalStorageCache {
  cache: Record<string, CacheItem>
  cacheName: string
  constructor (cacheName?: string) {
    this.cacheName = cacheName || 'cache'
    this.cache = JSON.parse(localStorage.getItem(this.cacheName) || '{}')
    // console.info(this.cacheName, this.cache, localStorage.getItem('UMS_CACHE'))
  }

  clearAll () {
    this.cache = {}
    localStorage.setItem(this.cacheName, JSON.stringify(this.cache))
  }

  update (key: string, value: unknown, ttlSeconds: number) {
    const item = this.cache[key]
    if (item) {
      item.value = value
      item.ttl = Math.floor(Date.now() / 1000) + ttlSeconds
      this.cache[key] = item
    } else {
      this.add(key, value, ttlSeconds)
    }
    localStorage.setItem(this.cacheName, JSON.stringify(this.cache))
  }

  get (key: string): unknown {
    this.cache = JSON.parse(localStorage.getItem('cache') || '{}')
    const item = this.cache[key]
    if (item) {
      if (item.ttl > Math.floor(Date.now() / 1000)) {
        if (key === 'conversationId') console.info(this.cacheName)
        return item.value
      } else {
        delete this.cache[key]
        localStorage.setItem(this.cacheName, JSON.stringify(this.cache))
      }
    }
    return null
  }

  add (key: string, value: unknown, ttlSeconds: number) {
    this.cache[key] = new CacheItem(
      Math.floor(Date.now() / 1000) + ttlSeconds,
      value
    )
    localStorage.setItem(this.cacheName, JSON.stringify(this.cache))
  }

  remove (key: string) {
    delete this.cache[key]
    localStorage.setItem(this.cacheName, JSON.stringify(this.cache))
  }

  getAll (): CacheItem[] {
    return Object.values(this.cache)
  }
}
