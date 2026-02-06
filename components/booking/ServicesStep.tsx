'use client';
import { useEffect, useMemo, useState } from 'react';

type Location = 'house' | 'shop';

type Service = {
  id: string;
  name: string;
  price: number;
  duration?: number;
};

function makeId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[’']/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\//g, '-');
}

/** Canonical in-store services (matches your Prices tab + server enforcement) */
const SHOP_SERVICES: Service[] = [
  { id: makeId('Edge Up (Trim)'), name: 'Edge Up (Trim)', price: 10, duration: 10 },
  { id: makeId('Edge Up + Black Dye'), name: 'Edge Up + Black Dye', price: 20, duration: 15 },

  { id: makeId('Shave'), name: 'Shave', price: 10, duration: 15 },
  { id: makeId('Shave + Steam'), name: 'Shave + Steam', price: 60, duration: 25 },

  { id: makeId('Blade Shave'), name: 'Blade Shave', price: 20, duration: 15 },
  { id: makeId('Blade Shave + Steam'), name: 'Blade Shave + Steam', price: 70, duration: 25 },

  { id: makeId('Clipper Chiskop & Wash'), name: 'Clipper Chiskop & Wash', price: 25, duration: 30 },
  { id: makeId('Chiskop Shave'), name: 'Chiskop Shave', price: 35, duration: 40 },
  { id: makeId('Chiskop + Hot Towel/Steam'), name: 'Chiskop + Hot Towel/Steam', price: 85, duration: 60 },

  { id: makeId('Blade Chiskop & Wash'), name: 'Blade Chiskop & Wash', price: 50, duration: 40 },
  { id: makeId('Blade Chiskop Shave'), name: 'Blade Chiskop Shave', price: 60, duration: 50 },
  { id: makeId('Blade Chiskop + Hot Towel/Steam'), name: 'Blade Chiskop + Hot Towel/Steam', price: 110, duration: 70 },

  { id: makeId('Haircut & Wash'), name: 'Haircut & Wash', price: 100, duration: 60 },
  { id: makeId('Haircut & Shave'), name: 'Haircut & Shave', price: 110, duration: 70 },
  { id: makeId('Haircut + Hot Towel/Steam'), name: 'Haircut + Hot Towel/Steam', price: 160, duration: 90 },

  { id: makeId('Haircut & Shave + Black Dye (with Wash)'), name: 'Haircut & Shave + Black Dye (with Wash)', price: 150, duration: 120 },

  { id: makeId('Kids Cut (3–12) + Wash'), name: 'Kids Cut (3–12) + Wash', price: 80, duration: 40 },
  { id: makeId('Kids Cut (3–12) + Dye'), name: 'Kids Cut (3–12) + Dye', price: 110, duration: 60 },
];

export function ServicesStep({ selection, onNext }: any) {
  const location: Location = selection?.location || 'house';

  const [houseServices, setHouseServices] = useState<Service[]>([]);
  const [loadingHouse, setLoadingHouse] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // selected IDs (per location)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selection.services?.map((s: any) => s.id) || []
  );

  // When location changes, reset selection
  useEffect(() => {
    setSelectedIds([]);
    setError(null);
    // Also clear any pre-selected services coming from previous location
    // (Book page also resets, but this makes step robust)
  }, [location]);

  // Load house-call services from API only when location=house
  useEffect(() => {
    if (location !== 'house') return;

    setLoadingHouse(true);
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        // Ensure every service has an id (if API doesn’t provide one)
        const normalized: Service[] = (Array.isArray(data) ? data : []).map((s: any) => ({
          id: s.id || makeId(s.name),
          name: s.name,
          price: Number(s.price) || 0,
          duration: s.duration ? Number(s.duration) : undefined,
        }));
        setHouseServices(normalized);
      })
      .catch(() => setError('Failed to load services. Please reload.'))
      .finally(() => setLoadingHouse(false));
  }, [location]);

  const services: Service[] = useMemo(() => {
    return location === 'shop' ? SHOP_SERVICES : houseServices;
  }, [location, houseServices]);

  const toggle = (id: string) => {
    setError(null);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const chosen = useMemo(
    () => services.filter((s) => selectedIds.includes(s.id)),
    [services, selectedIds]
  );

  const handleNext = () => {
    if (chosen.length === 0) {
      setError('Please select at least one service to continue.');
      return;
    }
    onNext(chosen);
  };

  return (
    <div>
      {/* Optional hint */}
      <div className="mb-4 text-sm text-brand-black/70">
        {location === 'shop' ? (
          <span>Showing <strong>In-Store</strong> prices.</span>
        ) : (
          <span>Showing <strong>House Call</strong> services.</span>
        )}
      </div>

      {location === 'house' && loadingHouse && (
        <div className="mb-4 text-sm text-brand-black/60">Loading services…</div>
      )}

      <div className="grid gap-4">
        {services.map((s: Service) => {
          const isSelected = selectedIds.includes(s.id);
          return (
            <label
              key={s.id}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition
                ${isSelected ? 'border-brand-blue bg-brand-blue/5' : 'border-black/10 hover:border-brand-blue/50'}`}
            >
              <div>
                <div className="font-medium text-brand-black">{s.name}</div>
                {typeof s.duration === 'number' && (
                  <div className="text-xs text-brand-black/60">{s.duration} min</div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="font-semibold text-brand-black">R{s.price}</div>
                <input
                  type="checkbox"
                  className="accent-brand-blue h-4 w-4"
                  checked={isSelected}
                  onChange={() => toggle(s.id)}
                />
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button className="btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
