import { X } from 'lucide-react';
import { Button } from '@/shared/components';
import { statusOptions, typeOptions } from './filter-bar.options';

interface FilterBarSheetProps {
  open: boolean;
  closing: boolean;
  selectedStatus: string | null;
  selectedType: string | null;
  onStatusChange: (status: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onReset: () => void;
  onClose: () => void;
  activeCount: number;
}

export function FilterBarSheet({
  open,
  closing,
  selectedStatus,
  selectedType,
  onStatusChange,
  onTypeChange,
  onReset,
  onClose,
  activeCount,
}: FilterBarSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal lg:hidden">
      <div
        className={`absolute inset-0 bg-bg-overlay animate-fade-in ${closing ? 'overlay-closing' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-bg-page/55 backdrop-blur-glass rounded-t-xl shadow-[0_-0.5px_0_rgba(15,23,42,0.08),0_-12px_40px_rgba(15,23,42,0.12)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up-sheet ${closing ? 'sheet-closing' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-sm">필터</h2>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer"
            aria-label="필터 닫기"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-label-lg text-text-secondary mb-2">상태</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  onStatusChange(selectedStatus === opt.value ? null : opt.value)
                }
                className={[
                  'px-4 py-2 rounded-full text-label-lg transition-colors cursor-pointer active:scale-95',
                  selectedStatus === opt.value
                    ? 'bg-neutral-500 text-text-inverse shadow-sm'
                    : 'bg-neutral-200 text-text-secondary',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-label-lg text-text-secondary mb-2">유형</p>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  onTypeChange(selectedType === opt.value ? null : opt.value)
                }
                className={[
                  'px-4 py-2 rounded-full text-label-lg transition-colors cursor-pointer active:scale-95',
                  selectedType === opt.value
                    ? 'bg-neutral-500 text-text-inverse shadow-sm'
                    : 'bg-neutral-200 text-text-secondary',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {activeCount > 0 && (
            <Button variant="secondary" size="lg" onClick={onReset} className="flex-1">
              초기화
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={onClose}
            className="flex-1"
          >
            적용
          </Button>
        </div>
      </div>
    </div>
  );
}
