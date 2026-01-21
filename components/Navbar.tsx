"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-brand-white border-b border-black/10">
      <div className="container-xl flex h-16 items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image
            src="/logo.jpg"
            alt="MoDeBarber"
            width={40}
            height={40}
            className="shrink-0 rounded-full"
            priority
          />
          <span className="font-semibold text-lg sm:text-xl text-brand-black truncate">
            MoDeBarber
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link className="nav-link" href="/book">Book</Link>
          <Link className="nav-link" href="/shop">Shop</Link>
          <Link className="nav-link" href="/prices">Prices</Link>
          <Link className="nav-link" href="/contact">Contact</Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-lg border border-black/20 px-3 py-2 text-sm"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="md:hidden border-t border-black/10 bg-brand-white">
          <div className="container-xl flex flex-col py-3 gap-3 text-sm">
            <Link className="nav-link" onClick={() => setOpen(false)} href="/book">Book</Link>
            <Link className="nav-link" onClick={() => setOpen(false)} href="/shop">Shop</Link>
            <Link className="nav-link" onClick={() => setOpen(false)} href="/prices">Prices</Link>
            <Link className="nav-link" onClick={() => setOpen(false)} href="/contact">Contact</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
