
import { NextResponse } from 'next/server';

export async function GET() {
  const products = [
    { id:'wave-cream', name:'Wave Cream', price:120, image:'/prod-wave.jpg', description:'Helps set and maintain waves.' },
    { id:'beard-oil', name:'Beard Oil Kit', price:180, image:'/prod-beard.jpg', description:'Growth + conditioning.' },
    { id:'legendary-shampoo', name:'Legendary Shampoo', price:160, image:'/prod-shampoo.jpg', description:'Cleansing without dryness.' }
  ];
  return NextResponse.json(products);
}
