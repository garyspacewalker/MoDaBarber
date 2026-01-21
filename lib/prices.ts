// lib/prices.ts
export type PriceItem = { name: string; price: number | string; note?: string };

export const SHOP_PRICES: PriceItem[] = [
  // Edge ups
  { name: 'Edge Up (Trim)', price: 10 },
  { name: 'Edge Up + Black Dye', price: 20 },

  // Shaves
  { name: 'Shave', price: 10 },
  { name: 'Shave + Steam', price: 60 },
  { name: 'Blade Shave', price: 20 },
  { name: 'Blade Shave + Steam', price: 70 },

  // Chiskop (bald)
  { name: 'Clipper Chiskop & Wash', price: 25 },
  { name: 'Chiskop Shave', price: 35 },
  { name: 'Chiskop + Hot Towel/Steam', price: 85 },
  { name: 'Blade Chiskop & Wash', price: 50 },
  { name: 'Blade Chiskop Shave', price: 60 },
  { name: 'Blade Chiskop + Hot Towel/Steam', price: 110 },

  // Plain haircut
  { name: 'Haircut & Wash', price: 100 },
  { name: 'Haircut & Shave', price: 110 },
  { name: 'Haircut + Hot Towel/Steam', price: 160 },

  // Cut & dye applications
  { name: 'Haircut & Shave + Black Dye (with Wash)', price: 150 },
  { name: 'Black Fiber (add-on)', price: 130 },
  { name: 'Haircut & Dye + Hot Towel/Steam', price: 200 },

  // Kids
  { name: "Kids' Haircut & Wash (3–12)", price: 80 },
  { name: "Kids' Dye Application", price: 110 },
];

// House calls (your existing mobile pricing – adjust as needed)
export const HOUSE_PRICES: PriceItem[] = [
  { name: 'Haircut & Shave (House Call)', price: 250 },
  { name: "Kids' Cut (House Call)", price: 150 },
  { name: 'Haircut & Dye Application (House Call)', price: 300 },
];
