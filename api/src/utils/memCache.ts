
export class CacheItem {
  ttl: number;
  value: any;

  constructor(ttl: number, value: any) {
    this.ttl = ttl;
    this.value = value;
  }
}

export class conversationCacheItem {

}

export class MemCache {
  cache: { [key: string]: CacheItem } = {};
  servicesWorker: { [key: string]: string } = {};

  getAll(): { [key: string]: CacheItem } {
    const now = Date.now();
    const validCache: { [key: string]: CacheItem } = {};
    for (const key in this.cache) {
      const item = this.cache[key];
      if (item.ttl > now) {
        validCache[key] = item;
      } else {
        delete this.cache[key];
      }
    }
    return validCache;
  }

  replace (id: string, value: any, ttlSeconds: number): void {
    if (this.cache[id]) {
      this.cache[id].value = value;
      this.cache[id].ttl = Date.now() + ttlSeconds * 1000;
    } else {
      this.add(id, value, ttlSeconds);
    }
  }

  get(key: string): any | null {
    const item = this.cache[key];
    if (item) {
      if (item.ttl > Date.now()) {
        return item.value;
      } else {
        delete this.cache[key];
      }
    }
    return null;
  }

  delete(key: string): void {
    delete this.cache[key];
  }

  updateProperty(key: string, property: string, value: any): void {
    const item = this.cache[key];
    if (item) {
      item.value[property] = value;
    } else {
      this.add(key, { [property]: value }, 60000 /* default ttl */);
    }
  }

  removeFromArray(key: string, value: any): void {
    const item = this.cache[key];
    if (item) {
      const index = item.value.indexOf(value);
      if (index !== -1) {
        item.value.splice(index, 1);
      }
    }
  }

  addToArray(key: string, value: any, unique?: boolean): void {
    const item = this.cache[key];
    if (item) {
      if (unique) {
        const index = item.value.indexOf(value);
        if (index === -1) {
          item.value.push(value);
        }
      } else {
        item.value.push(value);
      }
    } else {
      this.add(key, [value], 60000 /* default ttl */);
    }
  }

  add(key: string, value: any, ttlSeconds: number): void {
    this.cache[key] = new CacheItem(
      Date.now() + ttlSeconds * 1000,
      value
    );
  }
  
  clear(): void {
    this.cache = {};
  }
  // setServiceWorker (token: string): void {
  //   this.token = token;
  // }
  // getServiceWorker (): string | undefined {
  //   return this.token;
  // }
  // removeServiceWorker (): void {
  //   this.token = undefined;
  // }
}

export const cache = new MemCache();

export class AccountCache {
  private caches: { [key: string]: MemCache } = {};

  getCache(accountId: string): MemCache {
    if (!this.caches[accountId]) {
      this.caches[accountId] = new MemCache();
    }
    return this.caches[accountId];
  }

  getAllCaches(): { [key: string]: MemCache } {
    return this.caches;
  }
}

const memcaches: { [key: string]: MemCache } = {};

export const getAllCaches = (): { [key: string]: MemCache } => {
  return memcaches;
}

export const accountCache = (accountId: string): MemCache => {
  if (!accountId) {
    throw new Error('Account ID is required');
  }
  if (!memcaches[accountId]) {
    memcaches[accountId] = new MemCache();
  }
  return memcaches[accountId];
}
