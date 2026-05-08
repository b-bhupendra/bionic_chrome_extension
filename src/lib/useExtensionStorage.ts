import { useState, useEffect } from 'react';

export function useExtensionStorage<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // @ts-ignore
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      // @ts-ignore
      chrome.storage.sync.get([key], (result) => {
        if (result[key] !== undefined) {
          setStoredValue(result[key]);
        }
      });
    } else {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn('Error reading localStorage', error);
      }
    }
  }, [key]);

  const setValue = (value: T) => {
    setStoredValue(value);
    // @ts-ignore
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      // @ts-ignore
      chrome.storage.sync.set({ [key]: value });
    } else {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Error setting localStorage', error);
      }
    }
  };

  return [storedValue, setValue];
}
