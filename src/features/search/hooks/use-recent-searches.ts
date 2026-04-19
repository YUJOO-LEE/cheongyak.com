import { useCallback, useState } from 'react';

const STORAGE_KEY = 'cheongyak-recent-searches';
const MAX_RECENT = 10;

function readFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeToStorage(query: string): void {
  const recent = readFromStorage().filter((q) => q !== query);
  recent.unshift(query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function removeFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

interface UseRecentSearchesReturn {
  items: string[];
  add: (query: string) => void;
  clear: () => void;
}

export function useRecentSearches(): UseRecentSearchesReturn {
  const [items, setItems] = useState<string[]>(() => readFromStorage());

  const add = useCallback((query: string) => {
    writeToStorage(query);
    setItems(readFromStorage());
  }, []);

  const clear = useCallback(() => {
    removeFromStorage();
    setItems([]);
  }, []);

  return { items, add, clear };
}
