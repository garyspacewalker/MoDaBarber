// app/barber/appointments/page.tsx
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="container-xl py-10">
      <h1 className="text-2xl font-semibold mb-6">Appointments</h1>
      <div className="space-y-4">
        {bookings.map((b) => {
          const services = JSON.parse(b.services) as Array<{ name: string; price: number; duration: number }>;
          return (
            <div key={b.id} className="card p-5">
              <div className="flex flex-wrap gap-6 justify-between">
                <div>
                  <div className="font-semibold text-brand-black">{b.date} • {b.time}</div>
                  <div className="text-sm text-brand-black/70">Ref: {b.id}</div>
                </div>
                <div className="text-sm">
                  <div><b>Customer:</b> {b.first} {b.last ?? ''}</div>
                  <div><b>Phone:</b> {b.phone}</div>
                  {b.email && <div><b>Email:</b> {b.email}</div>}
                </div>
              </div>
              <ul className="mt-3 text-sm list-disc pl-5">
                {services.map((s) => (
                  <li key={s.name}>{s.name} — R{s.price} • {s.duration} min</li>
                ))}
              </ul>
            </div>
          );
        })}
        {!bookings.length && <div className="text-sm text-brand-black/60">No bookings yet.</div>}
      </div>
    </main>
  );
}
