import Link from 'next/link';
import Image from 'next/image';
import PromoBanner from '../components/PromoBanner';
import PriceTabs from '../components/PriceTabs';
import ReviewSection from '../components/ReviewSection';

export default function Home() {
  return (
    <>
      {/* PROMO */}
      <PromoBanner start="2026-01-10" end="2026-01-14" />

      <main>
        {/* HERO */}
        <section className="container-xl py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="badge mb-4">Barbershop</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-black">
                Mo Precision. Mo Confidence.
              </h1>
              <p className="text-lg text-brand-black/70 mb-8">
                Fresh haircuts, on your time. Book an appointment or shop products that keep you sharp.
              </p>
              <div className="flex gap-3">
                <Link href="/book" className="btn-primary">Book Now</Link>
                <Link href="/shop" className="btn-outline">Shop Products</Link>
              </div>
            </div>

            <div className="card overflow-hidden relative h-[360px]">
              <Image
                src="/MDB.png"
                alt="MoDeBarber hero"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        </section>

        {/* Prices block on the main UI */}
        <PriceTabs />

        {/* POPULAR SERVICES */}
        <section className="container-xl py-12">
          <h2 className="text-2xl font-semibold mb-6 text-brand-black">Popular Services</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Haircut and Shave', minutes: 90, price: 250, image: '/services/Cut-Shave(6).jfif', alt: 'Adult fade haircut example' },
              { name: 'Kids HairCut', minutes: 45, price: 150, image: '/services/Kids-Cut(2).jfif', alt: 'Kids Cut example' },
              { name: 'Haircut and dye application', minutes: 150, price: 300, image: '/services/Cut-Dye(7).jfif', alt: 'Cut and dye application example' },
            ].map((s) => (
              <div key={s.name} className="card overflow-hidden">
                <div className="relative w-full aspect-[4/3] bg-brand-black/5">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  />
                </div>

                <div className="p-5">
                  <div className="font-medium text-brand-black">{s.name}</div>
                  <div className="text-sm text-brand-black/60">{s.minutes} min</div>
                  <div className="mt-4 font-semibold text-brand-black">R{s.price}</div>
                  <Link href="/book" className="btn-primary mt-4">Book</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prepay CTA (compact) */}
        <div className="container-xl">
          <div className="mt-8 rounded-2xl border border-black/10 p-4 md:flex md:items-center md:justify-between bg-white/60">
            <div>
              <div className="font-medium text-brand-black">Prepay Haircuts</div>
              <p className="text-sm text-brand-black/70">Pay upfront, redeem later. Quick invoice via email.</p>
            </div>
            <a href="/prepay" className="btn-primary mt-3 md:mt-0">Prepay</a>
          </div>
        </div>

        {/* NEW: Reviews */}
        <ReviewSection />
      </main>
    </>
  );
}
