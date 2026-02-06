'use client';
import { useState } from 'react';
import { ServicesStep } from '../../components/booking/ServicesStep';
import { DateTimeStep } from '../../components/booking/DateTimeStep';
import { DetailsStep } from '../../components/booking/DetailsStep';

type Location = 'house' | 'shop';

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [selection, setSelection] = useState<any>({
    services: [],
    date: '',
    time: '',
    customer: {},
    location: 'house' as Location,
  });

  const nextServices = (services: any[]) => {
    setSelection((s: any) => ({ ...s, services }));
    setStep(2);
  };

  const nextDateTime = (date: string, time: string) => {
    setSelection((s: any) => ({ ...s, date, time }));
    setStep(3);
  };

  const setLocation = (loc: Location) => {
    setSelection((s: any) => ({
      ...s,
      location: loc,
      services: [], // ✅ reset services when changing location
      date: '',
      time: '',
    }));
    setStep(1); // ✅ go back to the start
    setGlobalError(null);
  };

  async function confirm(customer: any) {
    setGlobalError(null);
    setLoading(true);

    try {
      const payload = {
        services: selection.services,
        date: selection.date,
        time: selection.time,
        customer,
        location: selection.location,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Booking failed');

      if (data?.deposit?.reference) {
        alert(
          `Booking confirmed (${data.location}).\n\nA R${(data.deposit.amount ?? 100).toFixed(
            2
          )} deposit invoice was emailed to you.\nReference: ${data.deposit.reference}\n\nPlease pay within 48 hours using the exact reference.`
        );
      } else {
        alert(`Booking confirmed (${data.location}). Check your email.`);
      }

      // ✅ Clear on success (prevents double submit)
      setStep(1);
      setSelection((s: any) => ({
        services: [],
        date: '',
        time: '',
        customer: {},
        location: s.location, // keep last chosen location
      }));
    } catch (err: any) {
      setGlobalError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-xl py-10">
      {globalError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      {/* House vs Shop switch */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-brand-black/70">Location:</span>
        <div className="rounded-xl border border-black/10 bg-white p-1">
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              selection.location === 'house' ? 'bg-brand-black text-white' : ''
            }`}
            onClick={() => setLocation('house')}
          >
            House Call
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              selection.location === 'shop' ? 'bg-brand-black text-white' : ''
            }`}
            onClick={() => setLocation('shop')}
          >
            In-Store
          </button>
        </div>
      </div>

      {step === 1 && <ServicesStep selection={selection} onNext={nextServices} />}
      {step === 2 && (
        <DateTimeStep
          selection={selection}
          onBack={() => setStep(1)}
          onNext={nextDateTime}
        />
      )}
      {step === 3 && (
        <DetailsStep
          selection={selection}
          onBack={() => setStep(2)}
          onConfirm={confirm}
          loading={loading}
        />
      )}
    </main>
  );
}
