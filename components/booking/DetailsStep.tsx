'use client';
import { useState } from 'react';

type Props = {
  selection: { services: any[]; date: string; time: string };
  onBack: () => void;
  onConfirm: (customer: {
    first: string;
    last?: string;
    phone?: string;
    email: string;
    address?: string;
  }) => Promise<void> | void;
  loading?: boolean;
};

export function DetailsStep({ selection, onBack, onConfirm, loading }: Props) {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validPhone = (v: string) => v === '' || /^[0-9 +()-]{9,}$/.test(v);

  const handleConfirm = async () => {
    // validations with helpful messages
    if (selection.services?.length === 0) {
      setError('Please pick at least one service.');
      return;
    }
    if (!selection.date || !selection.time) {
      setError('Please choose a date and time.');
      return;
    }
    if (!first.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!email.trim() || !validEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validPhone(phone)) {
      setError('Please enter a valid phone number (or leave it blank).');
      return;
    }

    setError(null);
    await onConfirm({
      first: first.trim(),
      last: last.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim(),
      address: address.trim() || undefined,
    });
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          className="w-full border border-black/10 rounded-xl p-3"
          placeholder="First name"
          value={first}
          onChange={(e) => {
            setError(null);
            setFirst(e.target.value);
          }}
        />
        <input
          className="w-full border border-black/10 rounded-xl p-3"
          placeholder="Last name (optional)"
          value={last}
          onChange={(e) => {
            setError(null);
            setLast(e.target.value);
          }}
        />
        <input
          className="w-full border border-black/10 rounded-xl p-3"
          placeholder="Phone (+27… optional)"
          value={phone}
          onChange={(e) => {
            setError(null);
            setPhone(e.target.value);
          }}
        />
        <input
          className="w-full border border-black/10 rounded-xl p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setError(null);
            setEmail(e.target.value);
          }}
        />
        <textarea
          className="md:col-span-2 w-full border border-black/10 rounded-xl p-3"
          placeholder="Address / Notes (optional)"
          value={address}
          onChange={(e) => {
            setError(null);
            setAddress(e.target.value);
          }}
        />
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
        <button className="btn-outline" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={handleConfirm} disabled={!!loading}>
          {loading ? 'Confirming…' : 'Confirm Appointment'}
        </button>
      </div>
    </div>
  );
}
