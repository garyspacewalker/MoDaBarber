'use client';
import { useEffect, useState } from 'react';

export function ServicesStep({ selection, onNext }: any) {
  const [services, setServices] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selection.services?.map((s: any) => s.id) || []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setError('Failed to load services. Please reload.'));
  }, []);

  const toggle = (id: string) => {
    setError(null);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const chosen = services.filter((s) => selectedIds.includes(s.id));

  const handleNext = () => {
    if (chosen.length === 0) {
      setError('Please select at least one service to continue.');
      return;
    }
    onNext(chosen);
  };

  return (
    <div>
      <div className="grid gap-4">
        {services.map((s: any) => {
          const isSelected = selectedIds.includes(s.id);
          return (
            <label
              key={s.id}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition
                ${isSelected ? 'border-brand-blue bg-brand-blue/5' : 'border-black/10 hover:border-brand-blue/50'}`}
            >
              <div>
                <div className="font-medium text-brand-black">{s.name}</div>
                <div className="text-xs text-brand-black/60">{s.duration} min</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-semibold text-brand-black">R{s.price}</div>
                <input
                  type="checkbox"
                  className="accent-brand-blue h-4 w-4"
                  checked={isSelected}
                  onChange={() => toggle(s.id)}
                />
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button className="btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
