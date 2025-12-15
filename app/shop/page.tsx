'use client';
import { useEffect, useMemo, useState } from 'react';

/* ------------------ tiny toast (self-contained) ------------------ */
type Toast = { id: number; kind?: 'ok' | 'warn' | 'error'; msg: string };
function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (msg: string, kind: Toast['kind'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  const ToastViewport = () => (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[320px] flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ${
            t.kind === 'error'
              ? 'bg-red-50 text-red-800 ring-red-200'
              : t.kind === 'warn'
              ? 'bg-amber-50 text-amber-900 ring-amber-200'
              : 'bg-emerald-50 text-emerald-900 ring-emerald-200'
          }`}
          role="status"
          aria-live="polite"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { push, ToastViewport };
}
/* ----------------------------------------------------------------- */

type Product = { id: string; name: string; price: number; image?: string; description?: string };
type CartLine = { id: string; qty: number };

export default function ShopPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const { push, ToastViewport } = useToasts();

  // load products
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setItems)
      .catch(() => push('Could not load products. Please refresh.', 'error'));
  }, []); // eslint-disable-line

  // cart persistence (ONLY {id, qty})
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed.filter((l: any) => l?.id));
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const itemsById = useMemo(() => new Map(items.map(p => [p.id, p])), [items]);

  const add = (id: string) => {
    setCart(prev => {
      const found = prev.find(l => l.id === id);
      if (found) {
        const updated = prev.map(l => (l.id === id ? { ...l, qty: Math.min(999, l.qty + 1) } : l));
        return updated;
      }
      return [...prev, { id, qty: 1 }];
    });
    const p = itemsById.get(id);
    if (p) push(`Added ${p.name} to cart`);
  };

  const removeOne = (id: string) => {
    setCart(prev =>
      prev
        .map(l => (l.id === id ? { ...l, qty: Math.max(0, l.qty - 1) } : l))
        .filter(l => l.qty > 0),
    );
  };
  const removeAll = (id: string) => {
    const p = itemsById.get(id);
    if (p) push(`Removed ${p.name} from cart`, 'warn');
    setCart(prev => prev.filter(l => l.id !== id));
  };

  const total = cart.reduce((sum, l) => {
    const p = itemsById.get(l.id);
    return sum + (p?.price || 0) * l.qty;
  }, 0);

  const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

  async function createInvoice() {
    // Client-side guards with clear messages
    if (!cart.length) {
      push('Your cart is empty — add an item first.', 'warn');
      return;
    }
    if (!email.trim()) {
      push('Please enter your email so we can send the invoice.', 'warn');
      return;
    }
    if (!validEmail(email)) {
      push('That email looks invalid. Example: name@example.com', 'warn');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart, // ONLY {id, qty}
          customer: { email, name, phone, address },
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create invoice');
      push(`Invoice ${data.reference} created for R${(data.amount ?? 0).toFixed(2)}. Check your email.`);
      // setCart([]); // uncomment to clear cart after issuing an invoice
    } catch (e: any) {
      push(String(e.message || e), 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container-xl py-10">
      <ToastViewport />

      <h1 className="text-2xl font-semibold mb-6">Shop Products</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          {items.map(p => (
            <div key={p.id} className="card overflow-hidden">
              {/* product image (shows full image like haircuts) */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-white">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>

              <div className="p-4">
                <div className="font-medium text-brand-black">{p.name}</div>
                {p.description && <div className="text-sm text-brand-black/60">{p.description}</div>}
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-semibold text-brand-black">R{p.price.toFixed(2)}</div>
                  <button className="btn-primary" onClick={() => add(p.id)}>Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card sticky top-6 h-fit p-5">
          <div className="font-semibold mb-2">Your Cart</div>
          <ul className="space-y-2 text-sm">
            {cart.map(l => {
              const p = itemsById.get(l.id);
              if (!p) return null;
              return (
                <li key={l.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <button className="rounded border px-2" aria-label={`Decrease ${p.name}`} onClick={() => removeOne(l.id)}>-</button>
                    <span aria-live="polite">x {l.qty}</span>
                    <button className="rounded border px-2" aria-label={`Increase ${p.name}`} onClick={() => add(l.id)}>+</button>
                    <button className="text-xs text-red-600" onClick={() => removeAll(l.id)}>Remove</button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between font-semibold">
            <span>Total</span><span>R{total.toFixed(2)}</span>
          </div>

          <div className="mt-4 space-y-2">
            <input className="w-full rounded-xl border border-black/10 p-3" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} />
            <input className="w-full rounded-xl border border-black/10 p-3" placeholder="Email for invoice" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="w-full rounded-xl border border-black/10 p-3" placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
            <textarea className="w-full rounded-xl border border-black/10 p-3" placeholder="Delivery address (optional)" value={address} onChange={e => setAddress(e.target.value)} />
            <textarea className="w-full rounded-xl border border-black/10 p-3" placeholder="Order note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            <p className="text-xs text-brand-black/60">No online payment. We’ll email your invoice with EFT details and a simple reference.</p>
          </div>

          <button
            disabled={sending}
            className="btn-primary mt-4 w-full"
            onClick={createInvoice}
          >
            {sending ? 'Creating…' : 'Create Invoice'}
          </button>
        </aside>
      </div>
    </main>
  );
}
