// lib/refs.ts
/** Make a 6-digit numeric reference. Examples: "MB042193", "INV000123". */
export function newRef(prefix = ''): string {
  const code = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return prefix ? `${prefix}${code}` : code;
}

/** Alias if you ever want just the 6 digits */
export const newShortRef = () => newRef('');
