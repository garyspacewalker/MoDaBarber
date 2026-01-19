// app/prices/page.tsx
import Link from 'next/link';
import { SHOP_PRICES, HOUSE_PRICES } from '../../lib/prices';

function Money({ r }: { r: number | string }) {
  const v = typeof r === 'number' ? r : Number(r);
  return <span className="font-semibold">R{Number.isFinite(v) ? v.toFixed(0) : r}</span>;
}

function PriceList({
  title,
  items,
  footnote,
}: {
  title: string;
  items: { name: string; price: number | string; note?: string }[];
  footnote?: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-black">{title}</h2>
      <div className="rounded-2xl border border-black/10 bg-white">
        <ul className="divide-y divide-black/5">
          {items.map((it, i) => (
            <li key={i} className="flex items-start justify-between gap-6 px-5 py-3">
              <div>
                <div className="text-brand-black">{it.name}</div>
                {it.note && <div className="text-xs text-brand-black/60">{it.note}</div>}
              </div>
              <div className="shrink-0 text-brand-black">
                <Money r={it.price} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      {footnote && <p className="text-xs text-brand-black/60">{footnote}</p>}
    </section>
  );
}

export default function PricesPage() {
  return (
    <main className="container-xl py-10 space-y-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Price List</h1>
        <div className="flex gap-3">
          <Link href="/book" className="btn-primary">Book Now</Link>
          <Link href="/contact" className="btn-outline">Contact</Link>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-10">
        <PriceList
          title="Shop (In-Store)"
          items={SHOP_PRICES}
          footnote="Steam / hot towel is applied where specified. Prices in ZAR."
        />

        <PriceList
          title="House Calls (Mobile)"
          items={HOUSE_PRICES}
          footnote="House call availability varies by area in Johannesburg."
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <p className="text-sm text-brand-black/70">
          Need something not listed? Message us and we’ll quote you. For house calls we may confirm
          your address and preferred time after booking.
        </p>
      </div>
    </main>
  );
}
