'use client';
import { useState } from 'react';

export function DetailsStep({ selection, onBack, onConfirm }: any) {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border border-black/10 rounded-xl p-3 outline-none focus:ring-0 focus:border-brand-blue"
            placeholder="First name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
          <input
            className="border border-black/10 rounded-xl p-3 outline-none focus:ring-0 focus:border-brand-blue"
            placeholder="Last name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border border-black/10 rounded-xl p-3 outline-none focus:ring-0 focus:border-brand-blue"
            placeholder="Phone (+27...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="border border-black/10 rounded-xl p-3 outline-none focus:ring-0 focus:border-brand-blue"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button className="btn-outline" onClick={onBack}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={() => onConfirm({ first, last, phone, email })}
        >
          Confirm Appointment
        </button>
      </div>
    </div>
  );
}
