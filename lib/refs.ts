// lib/refs.ts
export function simpleRef(prefix = 'MB', digits = 5) {
  const max = 10 ** digits;
  const n = Math.floor(Math.random() * max)
    .toString()
    .padStart(digits, '0');
  return `${prefix}-${n}`; // e.g. MB-04217
}
