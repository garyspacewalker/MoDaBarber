'use client';
import { useState } from 'react';
import { ServicesStep } from '../../components/booking/ServicesStep';
import { DateTimeStep } from '../../components/booking/DateTimeStep';
import { DetailsStep } from '../../components/booking/DetailsStep';

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [selection, setSelection] = useState<any>({
    services: [],
    date: '',
    time: '',
    customer: {},
  });

  const nextServices = (services: any[]) => {
    setSelection((s: any) => ({ ...s, services }));
    setStep(2);
  };
  const nextDateTime = (date: string, time: string) => {
    setSelection((s: any) => ({ ...s, date, time }));
    setStep(3);
  };

  const confirm = async (customer: any) => {
    if (loading) return; // guard
    setGlobalError(null);
    setLoading(true);
    try {
      const payload = {
        services: selection.services,
        date: selection.date,
        time: selection.time,
        customer,
      };
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Booking failed');
      }

      // Success UI
      if (data?.deposit?.reference) {
        alert(
          `Booking confirmed!\n\nA R${(data.deposit.amount ?? 100).toFixed(
            2
          )} deposit invoice was emailed to you.\nReference: ${data.deposit.reference}\n\nPlease pay within 48 hours using the exact reference.`
        );
      } else {
        alert('Booking confirmed! Check your email.');
      }

      // ✅ CLEAR everything right away to prevent accidental re-clicks
      setSelection({ services: [], date: '', time: '', customer: {} });
      setStep(1);
    } catch (err: any) {
      setGlobalError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-xl py-10">
      {globalError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

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
          loading={loading}      // keeps the Confirm button disabled during submit
        />
      )}
    </main>
  );
}
