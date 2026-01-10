'use client';

import Image from 'next/image';
import Link from 'next/link';

type Props = {
  start?: string; // e.g. '2026-01-10'
  end?: string;   // e.g. '2026-01-14'
  forceShow?: boolean;
};

function isActive(start?: string, end?: string) {
  if (!start || !end) return true;
  const tz = 'Africa/Johannesburg';
  const today = new Date(new Date().toLocaleString('en-ZA', { timeZone: tz }));
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T23:59:59');
  return today >= s && today <= e;
}

export default function PromoBanner({
  start = '2026-01-10',
  end   = '2026-01-14',
  forceShow = false,
}: Props) {
  const show = forceShow || isActive(start, end);
  if (!show) return null;

  return (
    <section className="container-xl mt-8">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="grid md:grid-cols-2">
          {/* Image fills its half fully, no side bars */}
          <div className="relative aspect-[3/2] md:h-full">
            <Image
              src="/services/Promo.jpg"
              alt="Back to school promo — 50% off kids haircuts, 10th–14th. MoDeBarber."
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-6 md:p-8 flex flex-col justify-center">
            <span className="inline-flex w-max items-center rounded-full bg-brand-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Back to School
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-brand-black">
              50% OFF Kids’ Cuts
            </h2>
            <p className="mt-2 text-brand-black/70">
              Valid <strong>10th–14th</strong>. Fresh fades for school-going kids.
              Blue Lagoon Shop • Open daily 9am–6pm.
            </p>
            <div className="mt-4">
              <Link href="/book" className="btn-primary">Book now</Link>
            </div>
            <p className="mt-2 text-xs text-brand-black/50">Call 067 279 1851</p>
          </div>
        </div>
      </div>
    </section>
  );
}
