// app/prepay/page.tsx
'use client';

import { useMemo, useState } from 'react';

const DEFAULT_PRICE =
  Number(process.env.NEXT_PUBLIC_PREPAY_CUT_PRICE || 250) || 250;

export default function PrepayPage() {
  const [amount, setAmount] = useState<number>(DEFAULT_PRICE);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const pricePerCut = DEFAULT_PRICE;
  const cuts = useMemo(() => Math.floor(amount / pricePerCut), [amount, pricePerCut]);
  const remainder = useMemo(
    () => Math.max(0, +(amount - cuts * pricePerCut).toFixed(2)),
    [amount, cuts, pricePerCut]
  );

  const presets = [250, 500, 750, 1000, 1500];

  async function submit() {
    setError(null);
    if (!email) {
      setError('Please enter your email to receive the invoice.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (cuts < 1) {
      setError(`Minimum amount is R${pricePerCut.toFixed(2)} (1 haircut).`);
      return;
    }

    try {
      setSending(true);
      const res = await fetch('/api/prepay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          note,
          customer: { email, name, phone, address },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not create invoice');
      alert(
        `Invoice ${data.reference} created for R${(data.amount ?? 0).toFixed(
          2
        )}. Check your email.`
      );
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container-xl py-10">
      <h1 className="text-2xl font-semibold mb-6">Prepay Haircuts</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: selector + explainer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="font-medium text-brand-black mb-2">Choose Amount</div>
            <div className="flex flex-wrap gap-3 mb-4">
              {presets.map((v) => (
                <button
                  key={v}
                  className={`btn ${amount === v ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setAmount(v)}
                >
                  R{v}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={pricePerCut}
                step="10"
                className="w-48 border border-black/10 rounded-xl p-3"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value || 0))}
              />
              <span className="text-sm text-brand-black/70">
                Price per haircut: <strong>R{pricePerCut.toFixed(2)}</strong>
              </span>
            </div>

            <div className="mt-4 text-sm text-brand-black/80">
              This buys <strong>{cuts}</strong> haircut{cuts !== 1 ? 's' : ''}{' '}
              {remainder > 0 && (
                <>
                  and <strong>R{remainder.toFixed(2)}</strong> wallet credit.
                </>
              )}
            </div>
          </div>

          <div className="card p-5">
            <div className="font-medium text-brand-black mb-2">How it works</div>
            <ul className="list-disc ml-5 text-sm text-brand-black/70 space-y-1">
              <li>We’ll email you an invoice with EFT details.</li>
              <li>
                Use the exact reference so we can match your payment. Credits are added
                to your name/email.
              </li>
              <li>You can redeem a prepaid haircut at your next appointment.</li>
            </ul>
          </div>
        </div>

        {/* Right: details + submit */}
        <aside className="card p-5 h-fit sticky top-6">
          <div className="font-semibold mb-2">Your Details</div>

          <div className="text-sm text-brand-black/70 mb-3">
            Total: <strong>R{amount.toFixed(2)}</strong> • {cuts} haircut
            {cuts !== 1 ? 's' : ''}{' '}
            {remainder > 0 && <>+ R{remainder.toFixed(2)} credit</>}
          </div>

          <div className="space-y-2">
            <input
              className="w-full border border-black/10 rounded-xl p-3"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full border border-black/10 rounded-xl p-3"
              placeholder="Email for invoice"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border border-black/10 rounded-xl p-3"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <textarea
              className="w-full border border-black/10 rounded-xl p-3"
              placeholder="Address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <textarea
              className="w-full border border-black/10 rounded-xl p-3"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <p className="text-xs text-brand-black/60">
              No online payment. We’ll email your invoice with EFT banking details and a
              simple reference.
            </p>
          </div>

          <button
            disabled={!email || sending || cuts < 1}
            className="btn-primary mt-4 w-full"
            onClick={submit}
          >
            {sending ? 'Creating…' : 'Create Prepay Invoice'}
          </button>
        </aside>
      </div>
    </main>
  );
}
