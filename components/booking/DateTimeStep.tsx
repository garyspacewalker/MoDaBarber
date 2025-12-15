'use client';
import { useEffect, useState } from 'react';

export function DateTimeStep({ selection, onBack, onNext }: any) {
  const [date, setDate] = useState<string>(selection.date || '');
  const [time, setTime] = useState<string>(selection.time || '');
  const [slots, setSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // default date = tomorrow
  useEffect(() => {
    if (date) return;
    const today = new Date();
    const d = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    setDate(d.toISOString().slice(0, 10));
  }, [date]);

  // fetch slots when date changes
  useEffect(() => {
    if (!date) return;
    setError(null);
    fetch('/api/availability?date=' + date)
      .then((r) => r.json())
      .then((d) => setSlots(d?.slots || []))
      .catch(() => setError('Could not fetch available times. Please try again.'));
  }, [date]);

  const handleNext = () => {
    if (!date) {
      setError('Please pick a date.');
      return;
    }
    if (!time) {
      setError('Please select a time slot.');
      return;
    }
    onNext(date, time);
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-brand-black">Date</label>
          <input
            type="date"
            className="w-full border border-black/10 rounded-xl p-3 outline-none focus:ring-0 focus:border-brand-blue"
            value={date}
            onChange={(e) => {
              setError(null);
              setDate(e.target.value);
              setTime(''); // reset time when date changes
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-brand-black">Time</label>
          <div className="grid grid-cols-3 gap-3">
            {slots.map((s: string) => (
              <button
                key={s}
                onClick={() => {
                  setError(null);
                  setTime(s);
                }}
                className={`btn ${time === s ? 'bg-brand-blue text-brand-white' : 'btn-outline'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button className="btn-outline" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
