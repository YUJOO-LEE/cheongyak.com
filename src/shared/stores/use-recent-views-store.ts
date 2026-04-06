import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentView {
  id: string;
  viewedAt: number;
}

interface RecentViewsState {
  views: RecentView[];
  addView: (id: string) => void;
  clearViews: () => void;
}

const MAX_VIEWS = 20;

export const useRecentViewsStore = create<RecentViewsState>()(
  persist(
    (set) => ({
      views: [],

      addView: (id) =>
        set((state) => {
          const filtered = state.views.filter((v) => v.id !== id);
          return {
            views: [{ id, viewedAt: Date.now() }, ...filtered].slice(0, MAX_VIEWS),
          };
        }),

      clearViews: () => set({ views: [] }),
    }),
    {
      name: 'cheongyak-recent-views',
    },
  ),
);
