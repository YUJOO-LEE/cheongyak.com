'use client';

interface CategoryTabsProps {
  categories: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}

export function CategoryTabs({ categories, selected, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={[
            'shrink-0 px-4 py-2 rounded-full text-label-lg transition-all duration-fast ease-default cursor-pointer active:scale-[0.96]',
            selected === cat.value
              ? 'bg-brand-primary-500 text-text-inverse shadow-sm scale-[1.02]'
              : 'bg-bg-sunken text-text-secondary hover:bg-chip-bg-hover hover:scale-[1.02]',
          ].join(' ')}
          aria-current={selected === cat.value ? 'true' : undefined}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
