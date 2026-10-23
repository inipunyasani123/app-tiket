// Format angka Indonesia: rasio kecil tidak dibulatkan jadi 0%.
export function persen(bagian, total) {
  if (!total) return '0%';
  const p = (bagian / total) * 100;
  if (bagian > 0 && p < 1) return '<1%';
  if (bagian < total && p > 99) return '>99%';
  return `${Math.round(p)}%`;
}
export const ribuan = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
