import fs from 'node:fs';
import path from 'node:path';
import { JAZZ_DIR, rewriteSiteLinks } from './paths';
import type { FaqItem, PageDoc, PageLink } from './types';
import {
  extractFaq,
  extractField,
  extractH1,
  extractLead,
  extractLinks,
  extractUrl,
  mdToHtml,
  polishPublicHtml,
  toPublicHtml,
} from './md';

const SKIP = new Set(['kejsy.md', 'tone-of-voice.md']);

function cleanJazzTitle(s: string): string {
  return s
    .replace(/`\[.*?\]`/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function jazzDashBlocks(text: string): string {
  const section = text.match(/## 2[–-]3\. Блоки[\s\S]*?(?=\n## 4\.|$)/);
  if (!section) return '';
  const lines = section[0].split('\n').filter((l) => l.trim().startsWith('- **'));
  const parts: string[] = [];
  for (const line of lines) {
    const m = line.match(/- \*\*([^*]+)\*\*:?\s*(.*)/);
    if (!m) continue;
    const title = cleanJazzTitle(m[1]);
    const body = m[2]
      .replace(/`\[.*?\]`/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/→\s*\/[\w\-./]+/g, '')
      .trim();
    if (!body) continue;
    if (/^hero/i.test(title)) {
      parts.push(`<p>${body}</p>`);
      continue;
    }
    parts.push(`<section class="jz-block"><h2>${title}</h2><p>${body}</p></section>`);
  }
  return parts.join('\n');
}

function jazzNumberedBlocks(text: string): string {
  const section = text.match(/## 3\. Контент по блокам[\s\S]*?(?=\n## 4\.|$)/);
  if (!section) return '';
  const blocks = section[0].split(/\n### Блок \d+\.\s*/).slice(1);
  const parts: string[] = [];
  for (const block of blocks) {
    const title = cleanJazzTitle(block.match(/^([^\n]+)/)?.[1] || '');
    let body = block
      .replace(/^[^\n]+\n/, '')
      .replace(/\*\*H1:[^*]+\*\*\.?\s*/g, '')
      .replace(/`\[.*?\]`/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();
    if (!body) continue;
    if (/^hero/i.test(title)) {
      parts.push(`<p>${body}</p>`);
      continue;
    }
    parts.push(`<section class="jz-block"><h2>${title}</h2>${mdToHtml(body)}</section>`);
  }
  return parts.join('\n');
}

function blocksToHtml(text: string): string {
  const fromDash = jazzDashBlocks(text);
  if (fromDash.length > 80) return fromDash;
  const fromNum = jazzNumberedBlocks(text);
  if (fromNum.length > 80) return fromNum;
  return toPublicHtml(text);
}

function rewriteJazzRoutes(html: string): string {
  return html
    .replace(/\/cases\//g, '/kejsy/')
    .replace(/\/tariffs\//g, '/tarify/');
}

function parseJazzFile(file: string): PageDoc | null {
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.length < 60) return null;
  const slug = path.basename(file, '.md');
  const url = extractUrl(raw, `/${slug}/`);
  const title = extractField(raw, ['Title']) || extractH1(raw) || slug;
  const description = extractField(raw, ['Description']) || extractLead(raw).slice(0, 160);
  const h1 = extractH1(raw) || title;
  const lead = extractLead(raw);
  let html = polishPublicHtml(blocksToHtml(raw));
  html = rewriteJazzRoutes(rewriteSiteLinks(html, 'seojazz'));
  const faq = extractFaq(raw);
  const links = extractLinks(raw);
  return { url, title, description, h1, lead, html, faq, links, kind: 'page' };
}

let cache: PageDoc[] | null = null;

export function loadJazzPages(): PageDoc[] {
  if (cache) return cache;
  const dir = path.join(JAZZ_DIR, '04-kontent');
  const pages: PageDoc[] = [];
  const seen = new Set<string>();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    if (SKIP.has(f)) continue;
    const doc = parseJazzFile(path.join(dir, f));
    if (!doc || seen.has(doc.url)) continue;
    seen.add(doc.url);
    pages.push(doc);
  }
  cache = pages;
  return pages;
}

export function jazzByUrl(url: string): PageDoc | undefined {
  return loadJazzPages().find((p) => p.url === url);
}

export const JAZZ_CASES = [
  { name: 'Antos+', niche: 'Стоматология', metric: 'видимость 10% → 78%', extra: 'посетители ×4,5' },
  { name: 'premiumzdravclinic.ru', niche: 'Ортопедия / неврология', metric: 'посетители ×227', extra: '75% ТОП-10' },
  { name: 'super-manipulyator.ru', niche: 'Аренда манипуляторов', metric: '+412 заявок', extra: 'трафик ×10,8' },
  { name: 'ksg-beton.ru', niche: 'Завод бетона', metric: 'трафик ×21', extra: '90% ТОП-10' },
  { name: 'ils-school.com', niche: 'Языковая школа', metric: 'конверсия до 53%', extra: 'трафик ×35' },
  { name: 'ggpack.ru', niche: 'FBO / маркетплейсы', metric: '2% → 79% ТОП-10', extra: 'за 5 мес, ×32' },
  { name: 'vsemanipulyatory.ru', niche: 'GEO / спецтехника', metric: '+21,21% в ИИ', extra: 'Perplexity 43%' },
  { name: 'fluffywhite.moscow', niche: 'Элитная недвижимость', metric: 'трафик ×9', extra: '85% ТОП-10' },
];

export const JAZZ_TARIFFS = [
  { name: 'Старт', price: '45 000 ₽/мес', text: 'Базовый контур SEO под заявки и прозрачные KPI.' },
  { name: 'Рост', price: '65 000 ₽/мес', text: 'Масштабирование семантики, контента и конверсии.' },
  { name: 'Бизнес', price: '95 000 ₽/мес', text: 'Комплекс каналов и контроль стоимости заявки.' },
  { name: 'Лидер', price: '140 000 ₽/мес', text: 'SEO + GEO/AI, финансовая гарантия по KPI.' },
  { name: 'Под ключ', price: '220 000 ₽/мес', text: 'Полная система привлечения: поиск, ИИ, площадки.' },
];

export const JAZZ_NAV: { href: string; text: string }[] = [
  { href: '/uslugi/', text: 'Услуги' },
  { href: '/geo-prodvizhenie/', text: 'GEO / AI' },
  { href: '/seo-po-otraslyam/', text: 'Отрасли' },
  { href: '/seo-prodvizhenie-po-cms/', text: 'CMS' },
  { href: '/sozdanie-sajtov/', text: 'Сайты' },
  { href: '/kejsy/', text: 'Кейсы' },
  { href: '/tarify/', text: 'Тарифы' },
  { href: '/kontakty/', text: 'Контакты' },
];

export function jazzRelated(doc: PageDoc): PageLink[] {
  if (doc.links.length) return doc.links.slice(0, 8);
  return JAZZ_NAV;
}

export function jazzFaqFallback(): FaqItem[] {
  return [
    {
      q: 'За что мы платим — за позиции или за заявки?',
      a: 'За заявки, обращения и выручку. Позиции и трафик — промежуточные метрики, не цель договора.',
    },
    {
      q: 'Есть ли финансовая гарантия?',
      a: 'Да. KPI по заявкам фиксируется в договоре. На старших тарифах — финансовая гарантия, на среднем — бесплатный месяц или перенос бюджета, если KPI не достигнуты.',
    },
    {
      q: 'Что такое GEO и зачем оно нужно?',
      a: 'GEO — продвижение в ответах нейросетей: ChatGPT, Алиса, Perplexity, Gemini, AI Overview. Клиент спрашивает ИИ — система должна называть вас, а не конкурента.',
    },
  ];
}
