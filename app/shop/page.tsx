'use client';
import { useEffect, useMemo, useState } from 'react';

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
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // load products
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setItems).catch(console.error);
  }, []);

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
      if (found) return prev.map(l => (l.id === id ? { ...l, qty: Math.min(999, l.qty + 1) } : l));
      return [...prev, { id, qty: 1 }];
    });
  };
  const removeOne = (id: string) => {
    setCart(prev =>
      prev
        .map(l => (l.id === id ? { ...l, qty: Math.max(0, l.qty - 1) } : l))
        .filter(l => l.qty > 0),
    );
  };
  const removeAll = (id: string) => setCart(prev => prev.filter(l => l.id !== id));

  const total = cart.reduce((sum, l) => {
    const p = itemsById.get(l.id);
    return sum + (p?.price || 0) * l.qty;
  }, 0);

  async function createInvoice() {
    setError(null);
    setSending(true);
    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart, // <<— ONLY {id, qty}
          customer: { email, name, phone, address },
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create invoice');
      alert(`Invoice ${data.reference} created for R${(data.amount ?? 0).toFixed(2)}. Check your email.`);
      // setCart([]); // uncomment if you want to empty cart after issuing
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container-xl py-10">
      <h1 className="text-2xl font-semibold mb-6">Shop Products</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          {items.map(p => (
            <div key={p.id} className="card overflow-hidden">
              {/* product image */}
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
                <div className="flex items-center justify-between mt-4">
                  <div className="font-semibold text-brand-black">R{p.price.toFixed(2)}</div>
                  <button className="btn-primary" onClick={() => add(p.id)}>Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card p-5 h-fit sticky top-6">
          <div className="font-semibold mb-2">Your Cart</div>
          <ul className="space-y-2 text-sm">
            {cart.map(l => {
              const p = itemsById.get(l.id);
              if (!p) return null;
              return (
                <li key={l.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <button className="rounded border px-2" onClick={() => removeOne(l.id)}>-</button>
                    <span>x {l.qty}</span>
                    <button className="rounded border px-2" onClick={() => add(l.id)}>+</button>
                    <button className="text-xs text-red-600" onClick={() => removeAll(l.id)}>Remove</button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between mt-4 font-semibold">
            <span>Total</span><span>R{total.toFixed(2)}</span>
          </div>

          <div className="mt-4 space-y-2">
            <input className="w-full border border-black/10 rounded-xl p-3" placeholder="Your name (optional)" value={name} onChange={e=>setName(e.target.value)} />
            <input className="w-full border border-black/10 rounded-xl p-3" placeholder="Email for invoice" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full border border-black/10 rounded-xl p-3" placeholder="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)} />
            <textarea className="w-full border border-black/10 rounded-xl p-3" placeholder="Delivery address (optional)" value={address} onChange={e=>setAddress(e.target.value)} />
            <textarea className="w-full border border-black/10 rounded-xl p-3" placeholder="Order note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
            <p className="text-xs text-brand-black/60">No online payment. We’ll email your invoice with EFT banking details and a unique reference.</p>
          </div>

          <button disabled={!cart.length || !email || sending} className="btn-primary mt-4 w-full" onClick={createInvoice}>
            {sending ? 'Creating…' : 'Create Invoice'}
          </button>
        </aside>
      </div>
    </main>
  );
}
