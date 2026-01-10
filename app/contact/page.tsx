// app/contact/page.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <main>
      <section className="container-xl py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: copy + actions */}
          <div>
            <div className="badge mb-4">Contact</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-black">
              Let’s get you booked.
            </h1>
            <p className="text-lg text-brand-black/70 mb-6">
              Scan the QR code to open a WhatsApp chat with the barber. You can also call or email
              using the details below.
            </p>

            <div className="space-y-2 text-brand-black">
              <div><b>Phone:</b> <a className="link" href="tel:+27672791851">067 279 1851</a></div>
              <div><b>Email:</b> <a className="link" href="mailto:modebarber1@gmail.com">modebarber1@gmail.com</a></div>
              <div><b>Hours:</b> Mon–Sat 09:00–18:00</div>
              <div className="text-sm text-brand-black/60 mt-1">
                The QR code opens WhatsApp directly to MoDeBarber’s chat.
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Link
                href="https://wa.me/27672791851"
                className="btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </Link>
              <Link href="/book" className="btn-outline">Book Online</Link>
            </div>
          </div>

          {/* Right: QR image */}
          <div className="card overflow-hidden relative h-[360px]">
            <Image
              src="/QRCode.jpg"
              alt="Scan to WhatsApp MoDeBarber"
              fill
              className="object-contain p-6 bg-brand-white"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
            />
          </div>
        </div>
      </section>
      {/* No Popular Services section on the contact page */}
    </main>
  );
}
