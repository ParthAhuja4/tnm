import React from 'react';

type StorageType = 'local' | 'session';

type StorageOptions = {
  type?: StorageType;
  expiresIn?: number; // in milliseconds
  expiresAt?: number; // timestamp when the item expires
};

interface StoredValue<T> {
  value: T;
  expiresAt?: number;
}

class StorageService {
  private getStorage(type: StorageType): Storage {
    if (typeof window === 'undefined') {
      throw new Error('Storage is not available in this environment');
    }
    
    return type === 'local' ? window.localStorage : window.sessionStorage;
  }

  private isExpired(expiresAt?: number): boolean {
    if (!expiresAt) return false;
    return Date.now() > expiresAt;
  }

  set<T>(
    key: string,
    value: T,
    options: StorageOptions = { type: 'local' }
  ): void {
    try {
      const storage = this.getStorage(options.type);
      const storedValue: StoredValue<T> = {
        value,
      };

      if (options.expiresIn) {
        storedValue.expiresAt = Date.now() + options.expiresIn;
      }

      storage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting ${options.type}Storage key "${key}":`, error);
    }
  }

  get<T>(key: string, type: StorageType = 'local'): T | null {
    try {
      const storage = this.getStorage(type);
      const item = storage.getItem(key);
      
      if (!item) return null;

      const storedValue: StoredValue<T> = JSON.parse(item);

      // Check if the item has expired
      if (this.isExpired(storedValue.expiresAt)) {
        this.remove(key, type);
        return null;
      }

      return storedValue.value;
    } catch (error) {
      console.error(`Error getting ${type}Storage key "${key}":`, error);
      return null;
    }
  }

  remove(key: string, type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${type}Storage key "${key}":`, error);
    }
  }

  clear(type?: StorageType): void {
    try {
      if (type) {
        const storage = this.getStorage(type);
        storage.clear();
      } else {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
    } catch (error) {
      console.error(`Error clearing ${type || 'all'} storage:`, error);
    }
  }

  // Helper methods for common use cases
  setWithExpiry<T>(key: string, value: T, ttl: number, type: StorageType = 'local'): void {
    this.set(key, value, { type, expiresIn: ttl });
  }

  getWithExpiry<T>(key: string, type: StorageType = 'local'): T | null {
    return this.get<T>(key, type);
  }

  // Token management
  setAuthToken(token: string, type: StorageType = 'local'): void {
    this.set('auth_token', token, { type });
  }

  getAuthToken(type: StorageType = 'local'): string | null {
    return this.get<string>('auth_token', type);
  }

  removeAuthToken(type: StorageType = 'local'): void {
    this.remove('auth_token', type);
  }

  // User data
  setUser<T>(user: T, type: StorageType = 'local'): void {
    this.set('user', user, { type });
  }

  getUser<T>(type: StorageType = 'local'): T | null {
    return this.get<T>('user', type);
  }

  removeUser(type: StorageType = 'local'): void {
    this.remove('user', type);
  }

  // Clear all auth-related data
  clearAuth(type?: StorageType): void {
    this.removeAuthToken(type);
    this.removeUser(type);
    // Add any other auth-related keys here
  }
}

export const storage = new StorageService();

// Hook for React components
export function useStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions & {
    sync?: boolean; // Sync changes across tabs
  } = { type: 'local' }
) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = storage.get<T>(key, options.type);
      return item ?? initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        storage.set(key, valueToStore, options);
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue, options]
  );

  // Listen for changes in other tabs/windows
  React.useEffect(() => {
    if (!options.sync) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === key &&
        ((options.type === 'local' && event.storageArea === localStorage) ||
          (options.type === 'session' && event.storageArea === sessionStorage))
      ) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, options.sync, options.type]);

  return [storedValue, setValue] as const;
}

// Hook for local storage
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<StorageOptions, 'type'> & { sync?: boolean } = {}
) {
  return useStorage<T>(key, initialValue, { ...options, type: 'local' });
}

// Hook for session storage
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<StorageOptions, 'type'> & { sync?: boolean } = {}
) {
  return useStorage<T>(key, initialValue, { ...options, type: 'session' });
}
