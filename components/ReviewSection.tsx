'use client';
import { useEffect, useState } from 'react';

function Stars({ value }: { value: number }) {
  return (
    <div aria-label={`${value} out of 5 stars`} className="text-amber-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < value ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

export default function ReviewSection() {
  const [items, setItems] = useState<any[]>([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/reviews', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) {
      setItems(data.items || []);
      setAvg(Number(data.average || 0));
      setCount(Number(data.count || 0));
    }
  }
  useEffect(() => { load(); }, []);

  async function submit() {
    setError(null);
    if (!comment || comment.trim().length < 10) {
      setError('Please share at least 10 characters of feedback.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Could not send review');

      // clear + refresh list
      setRating(5);
      setName('');
      setComment('');
      await load();
      alert('Thanks for your feedback!');
    } catch (e: any) {
      setError(e?.message || 'Failed to send review');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="container-xl py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-brand-black">Reviews</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-brand-black/70">
            <Stars value={Math.round(avg)} />
            <span>{avg.toFixed(1)} / 5 • {count} reviews</span>
          </div>
        </div>
      </div>

      {/* list */}
      <div className="grid md:grid-cols-2 gap-6">
        {items.map(r => (
          <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.name || 'Anonymous'}</div>
              <Stars value={r.rating} />
            </div>
            <p className="mt-2 text-sm text-brand-black/80 whitespace-pre-wrap">{r.comment}</p>
          </div>
        ))}

        {/* form */}
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="font-semibold mb-2">Leave a review</div>
          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="mb-2">
            <label className="block text-sm text-brand-black/70 mb-1">Rating</label>
            <div className="flex gap-2">
              {([1,2,3,4,5] as const).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl ${n <= rating ? 'text-amber-500' : 'text-black/20'}`}
                  aria-label={`${n} star`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <input
            className="mb-2 w-full rounded-xl border border-black/10 p-3"
            placeholder="Your name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea
            className="mb-3 w-full rounded-xl border border-black/10 p-3"
            rows={4}
            placeholder="What went well? What can we improve?"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button className="btn-primary" disabled={sending} onClick={submit}>
            {sending ? 'Sending…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </section>
  );
}
