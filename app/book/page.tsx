// app/book/page.tsx (simplified example orchestrator)
'use client';
import { useState } from 'react';
import { ServicesStep } from '../../components/booking/ServicesStep';
import { DateTimeStep } from '../../components/booking/DateTimeStep';
import { DetailsStep } from '../../components/booking/DetailsStep';

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<any>({ services: [], date:'', time:'', customer:{} });

  const nextServices = (services:any[]) => { setSelection((s:any)=>({...s, services})); setStep(2); };
  const nextDateTime  = (date:string, time:string) => { setSelection((s:any)=>({...s, date, time})); setStep(3); };

  const confirm = async (customer:any) => {
    const payload = { services: selection.services, date: selection.date, time: selection.time, customer };
    const res = await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.ok) alert('Booking confirmed! Check your email.');
    else alert(data?.error || 'Booking failed');
  };

  return (
    <main className="container-xl py-10">
      {step===1 && <ServicesStep selection={selection} onNext={nextServices} />}
      {step===2 && <DateTimeStep selection={selection} onBack={()=>setStep(1)} onNext={nextDateTime} />}
      {step===3 && <DetailsStep selection={selection} onBack={()=>setStep(2)} onConfirm={confirm} />}
    </main>
  );
}
