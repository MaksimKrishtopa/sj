const prices: Record<string, Record<string, number>> = {
  gravel: { М100: 4150, М150: 4300, М200: 4700, М250: 4900, М300: 5100, М350: 5250, М400: 5450, М450: 5650 },
  granite: { М100: 4600, М200: 5150, М300: 5550, М400: 5900, М500: 6300, М600: 6600 },
};

const mat = document.getElementById('bt-mat') as HTMLSelectElement | null;
const mark = document.getElementById('bt-mark') as HTMLSelectElement | null;
const vol = document.getElementById('bt-vol') as HTMLInputElement | null;
const del = document.getElementById('bt-del') as HTMLSelectElement | null;
const out = document.getElementById('bt-out');

function recalc() {
  if (!mat || !mark || !vol || !del || !out) return;
  const p = prices[mat.value]?.[mark.value] || 5100;
  const v = Number(vol.value) || 1;
  const d = Number(del.value) || 0;
  out.textContent = `Итого: ${((p + d) * v).toLocaleString('ru-RU')} ₽`;
}

[mat, mark, vol, del].forEach((el) => el?.addEventListener('change', recalc));
vol?.addEventListener('input', recalc);
recalc();
