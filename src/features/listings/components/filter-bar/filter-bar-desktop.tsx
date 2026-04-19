import { RotateCcw } from 'lucide-react';
import { statusOptions, typeOptions } from './filter-bar.options';

interface FilterBarDesktopProps {
  selectedStatus: string | null;
  selectedType: string | null;
  onStatusChange: (status: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onReset: () => void;
  activeCount: number;
}

export function FilterBarDesktop({
  selectedStatus,
  selectedType,
  onStatusChange,
  onTypeChange,
  onReset,
  activeCount,
}: FilterBarDesktopProps) {
  return (
    <div className="hidden lg:flex items-center gap-3 sticky top-16 z-dropdown bg-bg-card/80 backdrop-blur-glass px-6 py-3 rounded-lg shadow-sm mb-6 animate-fade-in-up">
      <span className="text-label-lg text-text-secondary shrink-0">상태</span>
      <div className="flex gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              onStatusChange(selectedStatus === opt.value ? null : opt.value)
            }
            className={[
              'px-3 py-1.5 rounded-full text-label-md transition-colors duration-fast cursor-pointer active:scale-95',
              selectedStatus === opt.value
                ? 'bg-neutral-500 text-text-inverse shadow-sm'
                : 'bg-chip-bg text-text-secondary hover:bg-chip-bg-hover',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-border-divider mx-2" />

      <span className="text-label-lg text-text-secondary shrink-0">유형</span>
      <div className="flex gap-2">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              onTypeChange(selectedType === opt.value ? null : opt.value)
            }
            className={[
              'px-3 py-1.5 rounded-full text-label-md transition-colors duration-fast cursor-pointer active:scale-95',
              selectedType === opt.value
                ? 'bg-neutral-500 text-text-inverse shadow-sm'
                : 'bg-chip-bg text-text-secondary hover:bg-chip-bg-hover',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="ml-auto flex items-center gap-1 text-label-md text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        >
          <RotateCcw size={14} aria-hidden="true" />
          초기화
        </button>
      )}
    </div>
  );
}
