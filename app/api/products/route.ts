// app/api/products/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const products = [
    {
      id: 'white-t-shirt',
      name: 'MDB White T-Shirt',
      price: 400,
      image: '/shop/white-t-shirt.jpg',
      description:
        'Classic white 100% cotton tee with centred MoDeBarber chest logo and subtle sleeve prints. Soft, breathable and pre-shrunk for everyday wear.',
    },
    {
      id: 'black-t-shirt',
      name: 'MDB Black T-shirt',
      price: 400,
      image: '/shop/black-t-shirt.jpg',
      description:
        'Premium black 100% cotton tee with a bold MoDeBarber graphic across the chest. Midweight, durable and comfortable.',
    },
    {
      id: 'beard-oil',
      name: 'Beard Oil',
      price: 180,
      image: '/shop/beard-oil.jpg',
      description:
        'Lightweight, non-greasy blend that softens hair, reduces itch and adds a healthy natural sheen with a subtle barbershop scent.',
    },
    {
      id: 'beard-balm',
      name: 'Beard Balm',
      price: 150,
      image: '/shop/beard-balm.jpg',
      description:
        'Conditioning balm with medium hold to tame flyaways, shape your beard, and lock in moisture all day.',
    },
  ];
  return NextResponse.json(products);
}
