// app/shop/success/page.tsx
export default function SuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  return (
    <main className="container-xl py-16 text-center">
      <h1 className="text-3xl font-bold mb-2">Thank you! 🎉</h1>
      <p className="text-brand-black/70">Your payment was successful{searchParams.order ? ` (Order ${searchParams.order})` : ''}.</p>
      <p className="text-brand-black/60 mt-2">A receipt and shipping confirmation will be emailed to you.</p>
    </main>
  );
}
