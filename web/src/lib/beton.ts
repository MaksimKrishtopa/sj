import fs from 'node:fs';
import path from 'node:path';
import { BETON_DIR, rewriteSiteLinks } from './paths';
import type { PageDoc } from './types';
import {
  dropProcessSections,
  extractFaq,
  extractField,
  extractH1,
  extractLead,
  extractLinks,
  extractUrl,
  mdToHtml,
  stripMetaPreamble,
} from './md';

const SKIP = new Set([
  'page-blueprints-beton-zhukovskiy.md',
  'design-brief.md',
]);

function slugFromName(name: string): string {
  return name.replace(/^content-/, '').replace(/^blog-/, '').replace(/\.md$/, '');
}

function fallbackUrl(file: string, isBlog: boolean): string {
  const slug = slugFromName(path.basename(file));
  if (slug === 'glavnaya') return '/';
  if (isBlog) return `/blog/${slug}/`;
  return `/${slug}/`;
}

function parseBetonFile(file: string, isBlog: boolean): PageDoc | null {
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.length < 80) return null;
  const url = extractUrl(raw, fallbackUrl(file, isBlog));
  const title =
    extractField(raw, ['Title']) ||
    extractH1(raw) ||
    slugFromName(path.basename(file));
  const description =
    extractField(raw, ['Description', 'Meta Description']) ||
    extractLead(raw).slice(0, 160);
  const h1 = extractH1(raw) || title;
  const lead = extractLead(raw);
  const body = dropProcessSections(stripMetaPreamble(raw));
  const html = rewriteSiteLinks(mdToHtml(body), 'beton');
  return {
    url,
    title,
    description,
    h1,
    lead,
    html,
    faq: extractFaq(raw),
    links: extractLinks(raw),
    kind: isBlog ? 'blog' : url === '/' ? 'home' : 'page',
  };
}

let cache: PageDoc[] | null = null;

export function loadBetonPages(): PageDoc[] {
  if (cache) return cache;
  const pages: PageDoc[] = [];
  const seen = new Set<string>();
  const rootFiles = fs.readdirSync(BETON_DIR).filter((f) => f.startsWith('content-') && f.endsWith('.md'));
  for (const f of rootFiles) {
    if (SKIP.has(f)) continue;
    const doc = parseBetonFile(path.join(BETON_DIR, f), false);
    if (!doc || seen.has(doc.url)) continue;
    seen.add(doc.url);
    pages.push(doc);
  }
  const blogDir = path.join(BETON_DIR, 'blog');
  if (fs.existsSync(blogDir)) {
    for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith('.md'))) {
      const doc = parseBetonFile(path.join(blogDir, f), true);
      if (!doc || seen.has(doc.url)) continue;
      seen.add(doc.url);
      pages.push(doc);
    }
  }
  cache = pages;
  return pages;
}

export function betonByUrl(url: string): PageDoc | undefined {
  return loadBetonPages().find((p) => p.url === url);
}

export const BETON_PRICES = {
  gravel: [
    { mark: 'М100', cls: 'B7,5', use: 'Подбетонка, подготовка', price: 4150, href: '/m100/' },
    { mark: 'М150', cls: 'B12,5', use: 'Дорожки, отмостки', price: 4300, href: '/m150/' },
    { mark: 'М200', cls: 'B15', use: 'Фундаменты, стяжки, заборы', price: 4700, href: '/m200/' },
    { mark: 'М250', cls: 'B20', use: 'Перекрытия, лестницы', price: 4900, href: '/m250/' },
    { mark: 'М300', cls: 'B22,5', use: 'Несущие конструкции, дороги', price: 5100, href: '/m300/' },
    { mark: 'М350', cls: 'B25', use: 'Промышленные полы, мосты', price: 5250, href: '/m350/' },
    { mark: 'М400', cls: 'B30', use: 'Гидротехнические сооружения', price: 5450, href: '/m400/' },
    { mark: 'М450', cls: 'B35', use: 'Особо ответственные конструкции', price: 5650, href: '/m450/' },
  ],
  granite: [
    { mark: 'М100', cls: 'B7,5', use: 'Подготовка', price: 4600, href: '/m100/' },
    { mark: 'М200', cls: 'B15', use: 'Фундаменты повышенной прочности', price: 5150, href: '/m200/' },
    { mark: 'М300', cls: 'B22,5', use: 'Монолит, промышленные объекты', price: 5550, href: '/m300/' },
    { mark: 'М400', cls: 'B30', use: 'Мосты, путепроводы', price: 5900, href: '/m400/' },
    { mark: 'М500', cls: 'B40', use: 'Спецконструкции', price: 6300, href: '/m500/' },
    { mark: 'М600', cls: 'B45', use: 'Уникальные объекты', price: 6600, href: '/m600/' },
  ],
};

export const BETON_DELIVERY = [
  { zone: 'Раменский район', price: 'Бесплатно' },
  { zone: 'до 5 км', price: '500 ₽/м³' },
  { zone: '5–10 км', price: '600 ₽/м³' },
  { zone: '10–15 км', price: '700 ₽/м³' },
  { zone: '15–20 км', price: '650 ₽/м³' },
  { zone: '20–25 км', price: '700 ₽/м³' },
  { zone: '25–30 км', price: '750 ₽/м³' },
  { zone: '30–40 км', price: '800–850 ₽/м³' },
  { zone: '40–50 км', price: '900 ₽/м³' },
];

export const BETON_CITIES = [
  { name: 'Жуковский', href: '/zhukovskiy/' },
  { name: 'Раменское', href: '/ramenskoe/' },
  { name: 'Кратово', href: '/kratovo/' },
  { name: 'Малаховка', href: '/malakhovka/' },
  { name: 'Удельная', href: '/udelnaya/' },
  { name: 'Ильинский', href: '/ilinskiy/' },
  { name: 'Лыткарино', href: '/lytkarino/' },
  { name: 'Быково', href: '/bykovo/' },
];

export const BETON_REVIEWS = [
  {
    name: 'Алексей К.',
    city: 'Жуковский',
    date: '14 мая 2026',
    text: 'Заказывал М300 на фундамент дома — 34 куба. Позвонил с утра, к обеду уже подъехал первый миксер. Паспорт качества водитель отдал сразу. По цене не подвели: у другого завода вышло на 150 рублей за куб дороже, а здесь сбросили до −100 ₽, как обещали.',
  },
  {
    name: 'Сергей Михайлович Д.',
    city: 'Кратово',
    date: '2 апреля 2026',
    text: 'Сотрудничаем как подрядчики второй год. ТТН, счёт-фактура, паспорт приходят вовремя. Берём от 80 кубов за раз, ни разу не сорвали день. GPS на машинах работает: диспетчер всегда в курсе, где миксер.',
  },
  {
    name: 'Наталья В.',
    city: 'Раменское',
    date: '18 марта 2026',
    text: 'Строю баню, с маркой не разбиралась. Менеджер объяснил, что хватит М200, и посчитал кубатуру по размерам. Оплатила 8 кубов — привезли ровно 8. Весной буду делать отмостку здесь же.',
  },
  {
    name: 'Виктор Н., прораб',
    city: 'Лыткарино',
    date: '6 февраля 2026',
    text: 'Заливали перекрытие в январе при −12 °C, бетон с противоморозными добавками. Приехали по графику, температура смеси в норме — всё в паспорте. Через 28 дней прочность набралась как надо.',
  },
];
