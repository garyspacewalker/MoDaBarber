
'use client';
import { useState } from 'react';
import { ServicesStep } from '../../components/booking/ServicesStep';
import { DateTimeStep } from '../../components/booking/DateTimeStep';
import { DetailsStep } from '../../components/booking/DetailsStep';

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState<any>({ services: [], date: null, time: null, customer: {} });

  const steps = [
    { title: 'Choose Services' },
    { title: 'Choose Date & Time' },
    { title: 'Customer Info' }
  ];

  return (
    <main className="container-xl py-10">
      <h1 className="text-2xl font-semibold mb-2">Make Appointment</h1>
      <div className="text-neutral-500 mb-6">{steps[step].title}</div>

      <div className="card p-6">
        {step === 0 && (
          <ServicesStep
            selection={selection}
            onNext={(services:any) => { setSelection({ ...selection, services }); setStep(1); }}
          />
        )}
        {step === 1 && (
          <DateTimeStep
            selection={selection}
            onBack={() => setStep(0)}
            onNext={(date:string, time:string) => { setSelection({ ...selection, date, time }); setStep(2); }}
          />
        )}
        {step === 2 && (
          <DetailsStep
            selection={selection}
            onBack={() => setStep(1)}
            onConfirm={async (customer:any) => {
              const payload = { ...selection, customer };
              const res = await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
              const data = await res.json();
              if (data?.ok) alert('Appointment confirmed! Check your email.');
            }}
          />
        )}
      </div>
    </main>
  );
}
