import { vi } from 'vitest'

type StorageKey = 'localStorage' | 'sessionStorage'

const isStorage = (value: unknown): value is Storage => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Storage).getItem === 'function'
  )
}

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear: () => {
      store.clear()
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

const installStorage = (
  target: Record<string, unknown>,
  property: StorageKey
) => {
  if (!isStorage(target[property])) {
    Object.defineProperty(target, property, {
      configurable: true,
      enumerable: true,
      value: createMemoryStorage(),
    })
  }
}

const ensureStorage = (property: StorageKey) => {
  installStorage(globalThis as Record<string, unknown>, property)

  if (typeof window !== 'undefined') {
    installStorage(window as unknown as Record<string, unknown>, property)
  }
}

;(['localStorage', 'sessionStorage'] as StorageKey[]).forEach(ensureStorage)

const createMatchMedia = (): ((query: string) => MediaQueryList) => {
  return (query: string) => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()

    const mediaQueryList = {
      matches: false,
      media: query,
      onchange: null as MediaQueryList['onchange'],
      addEventListener: vi.fn(
        (_event: string, listener: EventListenerOrEventListenerObject) => {
          if (typeof listener === 'function') {
            listeners.add(listener as (event: MediaQueryListEvent) => void)
          }
        }
      ),
      removeEventListener: vi.fn(
        (_event: string, listener: EventListenerOrEventListenerObject) => {
          if (typeof listener === 'function') {
            listeners.delete(listener as (event: MediaQueryListEvent) => void)
          }
        }
      ),
      dispatchEvent: vi.fn((event: Event) => {
        mediaQueryList.onchange?.(event as MediaQueryListEvent)
        listeners.forEach(listener => listener(event as MediaQueryListEvent))
        return true
      }),
      addListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener)
      }),
      removeListener: vi.fn(
        (listener: (event: MediaQueryListEvent) => void) => {
          listeners.delete(listener)
        }
      ),
    } satisfies Partial<MediaQueryList>

    return mediaQueryList as MediaQueryList
  }
}

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: createMatchMedia(),
  })
}
