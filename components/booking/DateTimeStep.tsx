'use client';
import { useEffect, useState } from 'react';

export function DateTimeStep({ selection, onBack, onNext }: any) {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date();
    const d = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    setDate(d.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!date) return;
    fetch('/api/availability?date=' + date)
      .then((r) => r.json())
      .then((d) => setSlots(d?.slots || []));
  }, [date]);

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-brand-black">Date</label>
          <input
            type="date"
            className="w-full border border-black/10 rounded-xl p-3 outline-none focus:ring-0 focus:border-brand-blue"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-brand-black">Time</label>
          <div className="grid grid-cols-3 gap-3">
            {slots.map((s: string) => (
              <button
                key={s}
                onClick={() => setTime(s)}
                className={`btn ${time === s ? 'bg-brand-blue text-brand-white' : 'btn-outline'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button className="btn-outline" onClick={onBack}>
          Back
        </button>
        <button
          className="btn-primary"
          disabled={!date || !time}
          onClick={() => onNext(date, time)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
