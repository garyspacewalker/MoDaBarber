// components/PriceTabs.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SHOP_PRICES, HOUSE_PRICES, type PriceItem } from '../lib/prices';

function Money({ v }: { v: number | string }) {
  const n = typeof v === 'number' ? v : Number(v);
  return <span className="font-semibold">R{Number.isFinite(n) ? n.toFixed(0) : v}</span>;
}

function List({ items }: { items: PriceItem[] }) {
  return (
    <ul className="divide-y divide-black/5">
      {items.map((it, i) => (
        <li key={i} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="text-brand-black">
            <div>{it.name}</div>
            {it.note && <div className="text-xs text-brand-black/60">{it.note}</div>}
          </div>
          <div className="shrink-0 text-brand-black"><Money v={it.price} /></div>
        </li>
      ))}
    </ul>
  );
}

export default function PriceTabs() {
  const [tab, setTab] = useState<'shop' | 'house'>('shop');

  const active = tab === 'shop' ? SHOP_PRICES : HOUSE_PRICES;
  // show a short preview (change 8 to show more/less)
  const preview = active.slice(0, 8);

  return (
    <section className="container-xl py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-brand-black">Prices</h2>
        <div className="rounded-xl border border-black/10 p-1 bg-white">
          <button
            className={`px-3 py-1 rounded-lg text-sm ${tab==='shop' ? 'bg-brand-black text-white' : 'text-brand-black'}`}
            onClick={() => setTab('shop')}
            aria-pressed={tab==='shop'}
          >
            Shop
          </button>
          <button
            className={`px-3 py-1 rounded-lg text-sm ${tab==='house' ? 'bg-brand-black text-white' : 'text-brand-black'}`}
            onClick={() => setTab('house')}
            aria-pressed={tab==='house'}
          >
            House Calls
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden">
        <List items={preview} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Link href="/prices" className="btn-outline">View full price list</Link>
        <Link href="/book" className="btn-primary">Book</Link>
      </div>
    </section>
  );
}
