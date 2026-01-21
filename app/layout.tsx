// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import StructuredData from "./StructuredData";
import Navbar from "../components/Navbar";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "ModeBarber — Johannesburg Barber & Grooming",
    template: "%s · ModeBarber",
  },
  description: "Professional haircuts, fades, beard trims and grooming in Johannesburg. Book online.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ModeBarber — Johannesburg Barber & Grooming",
    description: "Book your cut online. Quality fades, beard trims, and grooming services.",
    url: "/",
    siteName: "ModeBarber",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ModeBarber — Book Online",
    description: "Fades, beard trims and grooming in Johannesburg.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Structured data for local SEO */}
        <StructuredData />

        {/* Header / Nav */}
        <Navbar />

        {/* Page content */}
        {children}

        {/* Footer */}
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
              <p>
                Email:{" "}
                <a className="link" href="mailto:modebarber1@gmail.com">
                  modebarber1@gmail.com
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
