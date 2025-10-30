'use client';

import { useMemo, useState } from 'react';
import type { Booking } from '@prisma/client';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
type Service = { name: string; price: number; duration: number };
type B = Booking & { servicesParsed: Service[] };

export default function AppointmentList({ initial }: { initial: B[] }) {
  const [items, setItems] = useState<B[]>(initial);
  const [query, setQuery] = useState('');
  const [hideCompleted, setHideCompleted] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((b) => {
      if (!showArchived && b.archived) return false;
      if (hideCompleted && b.status === 'COMPLETED') return false;
      if (!query) return true;
      const hay = `${b.first} ${b.last ?? ''} ${b.phone ?? ''} ${b.email ?? ''}`.toLowerCase();
      return hay.includes(query.toLowerCase());
    });
  }, [items, query, hideCompleted, showArchived]);

  async function patch(id: string, data: Partial<B> & { services?: any }) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = (await res.json()) as B;
    // ensure servicesParsed is refreshed
    (updated as any).servicesParsed = updated.services ? JSON.parse(updated.services as any) : [];
    setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
  }

  async function complete(id: string) {
    await patch(id, { status: 'COMPLETED' as BookingStatus });
  }

  async function cancel(id: string) {
    await patch(id, { status: 'CANCELLED' as BookingStatus });
  }

  async function restore(id: string) {
    await patch(id, { archived: false });
  }

  async function archive(id: string) {
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' }); // soft delete
    if (!res.ok) {
      alert('Archive failed');
      return;
    }
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, archived: true } : x)));
  }

  function Item({ b }: { b: B }) {
    const total = b.servicesParsed.reduce((s, x) => s + (x.price ?? 0), 0);

    return (
      <div className={`rounded-2xl border p-4 md:p-5 mb-4 shadow-sm ${b.archived ? 'opacity-60' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <div className="text-sm text-brand-black/60">Ref: {b.id.slice(0, 8)}</div>
            <div className="font-medium mt-1">
              {b.date} • {b.time}{' '}
              <span
                className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                  b.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : b.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {b.status}
              </span>
              {b.archived && (
                <span className="ml-2 inline-block rounded-full px-2 py-0.5 text-xs bg-neutral-100 text-neutral-700">
                  ARCHIVED
                </span>
              )}
            </div>

            <div className="text-sm text-brand-black/70 mt-2">
              <div>
                <b>Customer:</b> {b.first} {b.last ?? ''}
              </div>
              {b.phone && (
                <div>
                  <b>Phone:</b> {b.phone}
                </div>
              )}
              {b.email && (
                <div>
                  <b>Email:</b> {b.email}
                </div>
              )}
            </div>

            <ul className="mt-2 text-sm list-disc pl-5 text-brand-black/80">
              {b.servicesParsed.map((s, i) => (
                <li key={i}>
                  {s.name} — R{s.price} • {s.duration} min
                </li>
              ))}
            </ul>
          </div>

          <div className="text-right min-w-[160px]">
            <div className="text-sm font-semibold mb-2">Total: R{total}</div>

            <div className="flex flex-wrap gap-2 justify-end">
              {b.status !== 'COMPLETED' && !b.archived && (
                <button onClick={() => complete(b.id)} className="btn-primary">
                  ✓ Done
                </button>
              )}

              {b.status !== 'CANCELLED' && !b.archived && (
                <button onClick={() => cancel(b.id)} className="btn-outline">
                  Cancel
                </button>
              )}

              {!b.archived ? (
                <button onClick={() => archive(b.id)} className="btn-outline">
                  Archive
                </button>
              ) : (
                <button onClick={() => restore(b.id)} className="btn-outline">
                  Restore
                </button>
              )}

              <EditPopover
                b={b}
                onSave={async (payload) => {
                  await patch(b.id, payload);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name / phone / email"
            className="border rounded-xl px-3 py-2 w-[260px]"
          />
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
            />
            Hide completed
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show archived
          </label>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-sm text-brand-black/60">No appointments match your filters.</div>
      ) : (
        filtered.map((b) => <Item key={b.id} b={b} />)
      )}
    </div>
  );
}

function EditPopover({
  b,
  onSave,
}: {
  b: B;
  onSave: (payload: Partial<B>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(b.date);
  const [time, setTime] = useState(b.time);
  const [notes, setNotes] = useState(b.notes ?? '');

  async function submit() {
    await onSave({ date, time, notes });
    setOpen(false);
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="btn-outline">
        Edit
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border bg-white shadow-lg p-3">
          <div className="grid gap-3">
            <div>
              <label className="block text-xs mb-1">Date</label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-xl px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Time</label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border rounded-xl px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border rounded-xl px-3 py-2 w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="btn-outline">
                Close
              </button>
              <button onClick={submit} className="btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
