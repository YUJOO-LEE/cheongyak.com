import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterPrefsState {
  lastRegion: string | null;
  lastType: string | null;
  lastSort: string;
  setLastRegion: (region: string | null) => void;
  setLastType: (type: string | null) => void;
  setLastSort: (sort: string) => void;
}

export const useFilterPrefsStore = create<FilterPrefsState>()(
  persist(
    (set) => ({
      lastRegion: null,
      lastType: null,
      lastSort: 'newest',

      setLastRegion: (region) => set({ lastRegion: region }),
      setLastType: (type) => set({ lastType: type }),
      setLastSort: (sort) => set({ lastSort: sort }),
    }),
    {
      name: 'cheongyak-filter-prefs',
    },
  ),
);
