'use client';
import { useEffect, useState } from 'react';

export default function ShopPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => { fetch('/api/products').then(r=>r.json()).then(setItems); }, []);
  useEffect(() => { const saved = localStorage.getItem('cart'); if (saved) setCart(JSON.parse(saved)); }, []);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  const add = (p:any)=> setCart(prev => [...prev, p]);
  const total = cart.reduce((s,p)=>s+p.price,0);

  const checkout = async () => {
    const res = await fetch('/api/checkout', {
      method:'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ cart, customer: { email, name, phone } })
    });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
    else alert(data?.error || 'Unable to start checkout');
  };

  return (
    <main className="container-xl py-10">
      <h1 className="text-2xl font-semibold mb-6">Shop Products</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          {items.map(p => (
            <div key={p.id} className="card overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-48 object-cover"/>
              <div className="p-4">
                <div className="font-medium text-brand-black">{p.name}</div>
                <div className="text-sm text-brand-black/60">{p.description}</div>
                <div className="flex items-center justify-between mt-4">
                  <div className="font-semibold text-brand-black">R{p.price}</div>
                  <button className="btn-primary" onClick={()=>add(p)}>Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card p-5 h-fit sticky top-6">
          <div className="font-semibold mb-2">Your Cart</div>
          <ul className="space-y-2 text-sm">
            {cart.map((p,i)=> <li key={i} className="flex justify-between"><span>{p.name}</span><span>R{p.price}</span></li>)}
          </ul>
          <div className="flex items-center justify-between mt-4 font-semibold">
            <span>Total</span><span>R{total}</span>
          </div>

          <div className="mt-4 space-y-2">
            <input className="w-full border border-black/10 rounded-xl p-3" placeholder="Your name (optional)" value={name} onChange={e=>setName(e.target.value)} />
            <input className="w-full border border-black/10 rounded-xl p-3" placeholder="Email for receipt" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full border border-black/10 rounded-xl p-3" placeholder="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)} />
            <p className="text-xs text-brand-black/60">Shipping address is collected securely on the payment page.</p>
          </div>

          <button disabled={!cart.length} className="btn-primary mt-4 w-full" onClick={checkout}>Checkout</button>
        </aside>
      </div>
    </main>
  );
}
