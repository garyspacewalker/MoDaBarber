import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'MoDeBarber',
  description: 'Book cuts, shop products, and pay online.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-brand-white border-b border-black/10">
          <div className="container-xl flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="MoDeBarber" className="h-10 w-10 rounded-full" />
              <span className="font-semibold text-xl text-brand-black">MoDeBarber</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link className="nav-link" href="/book">Book</Link>
              <Link className="nav-link" href="/shop">Shop</Link>
              <Link className="nav-link" href="/contact">Contact</Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-20 bg-brand-black text-brand-white">
          <div className="container-xl py-10 grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-semibold mb-2">MoDeBarber</div>
              <p>Mobile haircut services. Johannesburg, South Africa.</p>
            </div>
            <div>
              <div className="font-semibold mb-2">Hours</div>
              <p>Mon–Sat: 09:00–18:00</p>
            </div>
            <div>
              <div className="font-semibold mb-2">Contact</div>
              <p>Phone: 067 279 1851</p>
              <p>Email: <a className="link" href="mailto:moleferantekane@gmail.com">moleferantekane@gmail.com</a></p>
            </div>
          </div>

          {/* in app/layout.tsx footer block */}
<div className="text-xs">
  <a href="/barber/appointments" className="text-brand-black/50 hover:text-brand-blue" rel="nofollow">Barber</a>
</div>

        </footer>
      </body>
    </html>
  );
}
