// app/barber/appointments/page.tsx
import { prisma } from '../../../lib/prisma';   // ⬅️ changed
import type { Booking } from '@prisma/client';
import AppointmentList from './ui/AppointmentList';

export const dynamic = 'force-dynamic';

type Service = { name: string; price: number; duration: number };
type BookingParsed = Booking & { servicesParsed: Service[] };

function parseServices(raw: string): Service[] {
  try {
    return JSON.parse(raw) as Service[];
  } catch {
    return [];
  }
}

export default async function BarberAppointmentsPage() {
  const rows: Booking[] = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const bookings: BookingParsed[] = rows.map((b) => ({
    ...b,
    servicesParsed: parseServices(b.services),
  }));

  return (
    <main className="container-xl py-10">
      <h1 className="text-2xl font-semibold mb-6 text-brand-black">Appointments</h1>
      <AppointmentList initial={bookings} />
    </main>
  );
}
