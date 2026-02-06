export type Service = {
  id: string;
  name: string;
  minutes: number;
  price: number;
};

export const HOUSE_CALL_SERVICES: Service[] = [
  { id: 'cut-shave', name: 'Haircut and Shave', minutes: 90, price: 250 },
  { id: 'blade-chiskop', name: 'Blade chiskop', minutes: 40, price: 150 },
  { id: 'clipper-chiskop', name: 'Clipper Chiskop', minutes: 60, price: 100 },
  { id: 'cut-bleach', name: 'Haircut and bleach', minutes: 210, price: 350 },
  { id: 'cut-dye', name: 'Haircut and dye application', minutes: 150, price: 300 },
];

export const IN_STORE_SERVICES: Service[] = [
  { id: 'edge-up', name: 'Edge Up (Trim)', minutes: 10, price: 10 },
  { id: 'edge-up-black-dye', name: 'Edge Up + Black Dye', minutes: 15, price: 20 },

  { id: 'shave', name: 'Shave', minutes: 15, price: 10 },
  { id: 'shave-steam', name: 'Shave + Steam', minutes: 25, price: 60 },

  { id: 'blade-shave', name: 'Blade Shave', minutes: 15, price: 20 },
  { id: 'blade-shave-steam', name: 'Blade Shave + Steam', minutes: 25, price: 70 },

  { id: 'clipper-chiskop-wash', name: 'Clipper Chiskop & Wash', minutes: 30, price: 25 },
  { id: 'chiskop-shave', name: 'Chiskop Shave', minutes: 40, price: 35 },
  { id: 'chiskop-steam', name: 'Chiskop + Hot Towel / Steam', minutes: 60, price: 85 },

  { id: 'blade-chiskop-wash', name: 'Blade Chiskop & Wash', minutes: 40, price: 50 },
  { id: 'blade-chiskop-shave', name: 'Blade Chiskop Shave', minutes: 50, price: 60 },
  { id: 'blade-chiskop-steam', name: 'Blade Chiskop + Hot Towel / Steam', minutes: 70, price: 110 },

  { id: 'haircut-wash', name: 'Haircut & Wash', minutes: 60, price: 100 },
  { id: 'haircut-shave', name: 'Haircut & Shave', minutes: 70, price: 110 },
  { id: 'haircut-steam', name: 'Haircut + Hot Towel / Steam', minutes: 90, price: 160 },

  { id: 'haircut-black-dye', name: 'Haircut & Shave + Black Dye (Wash)', minutes: 120, price: 150 },

  { id: 'kids-cut', name: 'Kids Haircut (3–12)', minutes: 40, price: 80 },
  { id: 'kids-cut-dye', name: 'Kids Haircut + Dye', minutes: 60, price: 110 },
];
