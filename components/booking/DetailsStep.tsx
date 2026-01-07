// components/booking/DetailsStep.tsx
'use client';
import { useState } from 'react';

type Props = {
  selection: { services: any[]; date: string; time: string };
  onBack: () => void;
  onConfirm: (customer: {
    first?: string; last?: string; email?: string; phone?: string; address?: string;
  }) => Promise<void> | void;          // allow async
  loading?: boolean;                    // <— new, used by page.tsx
};

export function DetailsStep({ selection, onBack, onConfirm, loading }: Props) {
  const [first, setFirst]   = useState('');
  const [last, setLast]     = useState('');
  const [email, setEmail]   = useState('');
  const [phone, setPhone]   = useState('');
  const [address, setAddr]  = useState('');
  const [error, setError]   = useState<string | null>(null);

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validPhone = (v: string) => v === '' || /^[0-9 +()-]{9,}$/.test(v);

  const submit = async () => {
    if (!selection.services?.length)  return setError('Please pick at least one service.');
    if (!selection.date || !selection.time) return setError('Please choose a date and time.');
    if (!first.trim())               return setError('Please enter your first name.');
    if (!email.trim() || !validEmail(email)) return setError('Please enter a valid email.');
    if (!validPhone(phone))          return setError('Please enter a valid phone number (or leave blank).');

    setError(null);
    await onConfirm({
      first: first.trim(),
      last: last.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });
  };

  const disabled =
    loading ||
    !selection.services?.length ||
    !selection.date || !selection.time ||
    !first.trim() || !email.trim();

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        <input className="w-full border border-black/10 rounded-xl p-3"
               placeholder="First name"
               value={first}
               onChange={e=>{ setError(null); setFirst(e.target.value); }} />
        <input className="w-full border border-black/10 rounded-xl p-3"
               placeholder="Last name (optional)"
               value={last}
               onChange={e=>{ setError(null); setLast(e.target.value); }} />
        <input className="w-full border border-black/10 rounded-xl p-3"
               placeholder="Phone (+27… optional)"
               value={phone}
               onChange={e=>{ setError(null); setPhone(e.target.value); }} />
        <input className="w-full border border-black/10 rounded-xl p-3"
               placeholder="Email"
               value={email}
               onChange={e=>{ setError(null); setEmail(e.target.value); }} />
        <textarea className="md:col-span-2 w-full border border-black/10 rounded-xl p-3"
                  placeholder="Address / Notes (optional)"
                  value={address}
                  onChange={e=>{ setError(null); setAddr(e.target.value); }} />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <p className="mt-3 text-xs text-brand-black/60">
        A R100 deposit invoice will be emailed after you confirm. Please pay within 48 hours
        using the exact reference to secure your spot.
      </p>

      <div className="flex justify-between mt-6">
        <button className="btn-outline" onClick={onBack}>Back</button>
        <button className="btn-primary" disabled={disabled} onClick={submit}>
          {loading ? 'Confirming…' : 'Confirm Appointment'}
        </button>
      </div>
    </div>
  );
}
