import { marked } from 'marked';
import type { FaqItem } from './types';

marked.setOptions({ gfm: true, breaks: true });

const PLANNING_TITLES = [
  'входные данные',
  'краткий вывод',
  'сводная таблица',
  'сводная таблица страниц',
  'назначение',
  'назначение страницы',
  'интент',
  'мета-теги',
  'метатеги',
  'структура',
  'структура h2-h3',
  'структура h2–h3',
  'коммерческие блоки',
  'внутренние ссылки',
  'alt',
  'доказательства',
  'микроразметка',
  'что проверить человеку',
  'что проверяет человек',
  'конкурентная разведка',
  'json-handoff',
  'для вайб-кодинга',
  'cta',
  'использованные материалы',
  'ограничения',
  'проект',
];

function headingText(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, '')
    .replace(/^\d+(?:\.\d+)*\s+/, '')
    .replace(/^B\d+\s*[—–\-→].?\s*/i, '')
    .replace(/\[.*?\]/g, '')
    .trim();
}

function normTitle(line: string): string {
  return headingText(line)
    .toLowerCase()
    .replace(/[.:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPlanningHeading(line: string): boolean {
  if (!/^#{1,6}\s+/.test(line)) return false;
  const t = normTitle(line);
  if (t.startsWith('контент страницы')) return true;
  if (t.startsWith('контентный пакет')) return true;
  if (t.startsWith('контент-пакет')) return true;
  if (/^b\d+/.test(t) && /шапка|компонент|предзаполн|форма/.test(t)) return true;
  return PLANNING_TITLES.some((x) => t === x || t.startsWith(`${x} `));
}

function humanizeHeading(raw: string): string {
  let s = headingText(raw)
    .replace(/^блок\s+\d+\.?\s*/i, '')
    .replace(/\s*`?\[[^\]]*\]`?/g, '')
    .trim();
  if (!s) return '';
  const words = s.split(/\s+/);
  const allCaps = words.every((w) => w === w.toUpperCase() && /[А-ЯA-Z]/.test(w));
  if (allCaps) {
    s = words
      .map((w, i) => {
        if (/^М\d/i.test(w) || /^\d/.test(w) || /^[A-Z]{1,3}\d/.test(w) || w.length <= 2) return w;
        const lower = w.toLowerCase();
        return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
      })
      .join(' ');
  }
  return s;
}

export function mdToHtml(source: string): string {
  const cleaned = source
    .replace(/→\s*\[КОМПОНЕНТ[^\]]*\]/g, '')
    .replace(/→\s*\[C\d+[^\]]*\]/g, '')
    .replace(/\[ФОТО ОТ КЛИЕНТА\]/g, '')
    .replace(/\[Нужно уточнить[^\]]*\]/g, '')
    .replace(/\[уточнить[^\]]*\]/gi, '')
    .replace(/\[гипотеза[^\]]*\]/gi, '')
    .replace(/\[illustrative[^\]]*\]/gi, '')
    .replace(/`\[ключевой[^\]]*\]`/gi, '')
    .replace(/\[ключевой[^\]]*\]/gi, '')
    .replace(/`\{БРЕНД\}`/g, 'завод')
    .replace(/\{БРЕНД\}/g, 'завод')
    .replace(/`\[цена\]`/g, '')
    .replace(/\[цена\]/g, '')
    .replace(/←\s*выбрана/g, '');
  return String(marked.parse(cleaned));
}

export function stripMetaPreamble(text: string): string {
  const markers = [
    /^##\s+B2\b/m,
    /^####\s+B2\b/m,
    /^###\s+4\.5\b/m,
    /^##\s+4\.5\b/m,
    /^##\s+4\.\s+Контент/m,
    /^###\s+4\.\s+Контент/m,
    /^##\s+1\.\s+МЕТАТЕГИ/m,
    /^##\s+B2\s+—/m,
    /^#\s+(?!content-)/im,
  ];
  for (const re of markers) {
    const m = text.search(re);
    if (m > 80) return text.slice(m);
  }
  return text;
}

export function extractField(text: string, names: string[]): string {
  for (const name of names) {
    const patterns = [
      new RegExp(`\\*\\*${name}:?\\*\\*\\s*(?:\\([^)]*\\))?\\s*:?\\s*\\n?([^\\n]+)`, 'i'),
      new RegExp(`-\\s*\\*\\*${name}:\\*\\*\\s*(.+)`, 'i'),
      new RegExp(`\\|\\s*${name}\\s*\\|\\s*([^|]+)\\|`, 'i'),
      new RegExp(`^${name}:\\s*(.+)$`, 'im'),
    ];
    for (const re of patterns) {
      const m = text.match(re);
      if (m?.[1]) {
        const value = m[1].replace(/\*+/g, '').replace(/`/g, '').trim();
        if (value && !value.startsWith('(') && value.length > 2) return value;
      }
    }
  }
  return '';
}

export function extractUrl(text: string, fallback: string): string {
  const patterns = [
    /\*\*URL:\*\*\s*`?(\/[^`\s*]+)`?/i,
    /#\s*URL:\s*(\/[\w\-./]*)/i,
    /^url:\s*(\/[\w\-./]*)/im,
    /Контент страницы:\s*(\/[\w\-./]*)/i,
    /- \*\*URL:\*\* ·?\s*`?(\/[^`\s*]+)`?/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      let url = m[1].replace(/[.,;]+$/, '');
      if (!url.endsWith('/')) url += '/';
      return url;
    }
  }
  return fallback.endsWith('/') ? fallback : `${fallback}/`;
}

export function extractH1(text: string): string {
  const fromField = extractField(text, ['H1']);
  if (fromField && !fromField.endsWith('.md') && fromField !== 'H1') {
    return fromField.replace(/^#+\s*/, '');
  }
  const matches = [...text.matchAll(/^#\s+(.+)$/gm)];
  for (const m of matches) {
    const value = m[1].replace(/\*+/g, '').trim();
    if (value && !value.endsWith('.md') && !value.startsWith('content-') && !value.startsWith('URL:')) {
      return value;
    }
  }
  return '';
}

export function extractLead(text: string): string {
  const sub = extractField(text, ['Подзаголовок', 'Оффер']);
  if (sub) return cleanInline(sub);
  const hero = text.match(/\*\*Hero:\*\*\s*(.+)/i);
  if (hero?.[1]) return cleanInline(hero[1]);
  const first = text.match(/\*\*Первый экран[^*]*\*\*:\s*(.+)/i);
  if (first?.[1]) return cleanInline(first[1]);
  const p = text.match(/\n([А-ЯA-Z][^#\n]{80,280})\n/);
  return p?.[1]?.trim() || '';
}

function cleanInline(s: string): string {
  return s
    .replace(/\*+/g, '')
    .replace(/`/g, '')
    .replace(/\[Нужно уточнить[^\]]*\]/g, '')
    .replace(/\[уточнить[^\]]*\]/gi, '')
    .replace(/«|»/g, '')
    .trim();
}

export function extractFaq(text: string): FaqItem[] {
  const items: FaqItem[] = [];
  const tableBlock = text.match(/\| Вопрос \| Ответ[\s\S]*?(?:\n\n|$)/);
  if (tableBlock) {
    const rows = tableBlock[0].split('\n').slice(2);
    for (const row of rows) {
      const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 2 && cols[0] !== 'Вопрос') {
        items.push({ q: cleanInline(cols[0]), a: cleanInline(cols[1]) });
      }
    }
  }
  const compact = text.match(/## 4\. FAQ[\s\S]*?(?=\n## |\n```|$)/);
  if (compact && items.length === 0) {
    const line = compact[0].replace(/## 4\. FAQ[^\n]*\n/, '').replace(/\n/g, ' ');
    const numbered = [...line.matchAll(/(\d+)\.\s*([^?]+\?)\s*[—–-]\s*([^.]+\.)/g)];
    for (const m of numbered) {
      items.push({ q: cleanInline(m[2]), a: cleanInline(m[3]) });
    }
    if (!items.length) {
      const parts = line.split(' · ');
      for (const part of parts) {
        const m = part.match(/(.+?)\s*\((.+)\)\s*$/);
        if (m) items.push({ q: cleanInline(m[1]), a: cleanInline(m[2]) });
      }
    }
  }
  const qBlocks = [...text.matchAll(/\*\*Вопрос\s*\d+\*\*\s*\n+([^\n]+)\n+([^\n*][^\n]+)/g)];
  for (const m of qBlocks) {
    items.push({ q: m[1].trim(), a: m[2].trim() });
  }
  const starFaq = [...text.matchAll(/\*\s*\*([^*]+)\*\s*[—-]\s*(.+)/g)];
  for (const m of starFaq) {
    items.push({ q: cleanInline(m[1]), a: cleanInline(m[2]) });
  }
  const seen = new Set<string>();
  return items.filter((it) => {
    if (!it.q || !it.a || seen.has(it.q)) return false;
    if (/нужно уточнить|уточнить у клиента/i.test(it.a) && it.a.length < 40) return false;
    seen.add(it.q);
    return true;
  });
}

export function extractLinks(text: string): { href: string; text: string }[] {
  const links: { href: string; text: string }[] = [];
  const fromJson = [...text.matchAll(/"kuda"\s*:\s*"(\/[^"]+)"[\s\S]*?"ankor"\s*:\s*"([^"]+)"/g)];
  for (const m of fromJson) {
    if (m[1].includes(' или ')) continue;
    links.push({ href: m[1].endsWith('/') ? m[1] : `${m[1]}/`, text: m[2] });
  }
  const md = [...text.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g)];
  for (const m of md) {
    links.push({ href: m[2].endsWith('/') ? m[2] : `${m[2]}/`, text: m[1] });
  }
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.href) || / или /.test(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}

export function dropProcessSections(text: string): string {
  return text
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/## 8\. Конкурентная разведка[\s\S]*?(?=\n## |\n```|$)/g, '')
    .replace(/## 9\. Что проверяет[\s\S]*?(?=\n## |\n```|$)/g, '')
    .replace(/## 10\. JSON-handoff[\s\S]*$/g, '')
    .replace(/### Для вайб-кодинга[\s\S]*?(?=\n## |$)/g, '')
    .replace(/## 1\. Входные данные[\s\S]*?(?=## 4\.|## B2|## 2\. СТРУКТУРА|## 2–3\.|## 3\. Контент)/g, '')
    .replace(/## 2\. Краткий вывод[\s\S]*?(?=## 4\.|## B2|## 3\. Контент)/g, '')
    .replace(/## 3\. Сводная таблица[\s\S]*?(?=## 4\.|## B2)/g, '');
}

function sliceBy(text: string, start: RegExp, end: RegExp): string {
  const s = text.search(start);
  if (s < 0) return '';
  const rest = text.slice(s);
  const e = rest.slice(1).search(end);
  return e >= 0 ? rest.slice(0, e + 1) : rest;
}

function extract45(text: string): string {
  return (
    sliceBy(
      text,
      /^#{2,4}\s+4\.5\s+Контент по блокам/m,
      /^#{2,4}\s+(?:4\.(?:6|7|8|9|10|11|12|13)\b|5\.|8\.|4\. Контент)/m,
    ) ||
    sliceBy(
      text,
      /^#{2,4}\s+\d+\.\s+КОНТЕНТ ПО БЛОКАМ/im,
      /^#{2}\s+(?:4\.|5\.|8\.|FAQ|Что проверить)/m,
    )
  );
}

function extractHeroBlocks(text: string): string {
  return sliceBy(
    text,
    /^#{2,4}\s+B2\b/m,
    /^#{2,3}\s+(?:4\.(?:6|7|8|9|10|11|12|13)\b|5\.|8\.|4\. Контент|B6\b|B7\b)/m,
  );
}

function parseMdTable(block: string): string[][] {
  const rows: string[][] = [];
  for (const line of block.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    if (/^\|?\s*:?-{3,}/.test(line.replace(/\|/g, '').trim()) || /---/.test(line) && !/[^|\-\s:]/.test(line)) {
      continue;
    }
    const cols = line.split('|').map((c) => c.trim()).filter((c, i, arr) => !(c === '' && (i === 0 || i === arr.length - 1)));
    if (cols.length) rows.push(cols);
  }
  return rows;
}

function convertDraftTable(text: string): string {
  if (!/\|\s*Текст/.test(text) || !/\|\s*Блок\s*\|/.test(text)) return text;
  const rows = parseMdTable(text);
  if (rows.length < 2) return text;
  const header = rows[0].map((c) => c.toLowerCase());
  const blockI = header.findIndex((c) => c.includes('блок'));
  const textI = header.findIndex((c) => c.includes('текст'));
  if (blockI < 0 || textI < 0) return text;
  const parts: string[] = [];
  for (const row of rows.slice(1)) {
    const name = cleanInline(row[blockI] || '');
    const body = cleanInline(row[textI] || '');
    if (!body || body.length < 20) continue;
    if (/^см\.?\s*4\.|форма|плитка|слайдер/i.test(body)) continue;
    if (/первый экран|hero/i.test(name)) {
      parts.push(body);
      continue;
    }
    parts.push(`## ${name}\n\n${body}`);
  }
  return parts.length ? parts.join('\n\n') : text;
}

function dropPlanningSections(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let skip = false;
  let skipLevel = 0;
  for (const line of lines) {
    const hm = line.match(/^(#{1,6})\s+/);
    if (hm) {
      const level = hm[1].length;
      if (isPlanningHeading(line)) {
        skip = true;
        skipLevel = level;
        continue;
      }
      if (skip && level <= skipLevel) skip = false;
    }
    if (!skip) out.push(line);
  }
  return out.join('\n');
}

function isDropHeading(title: string): boolean {
  const t = title.replace(/:$/, '').trim().toLowerCase();
  return (
    t === 'hero' ||
    t === 'b1' ||
    t === 'b2' ||
    /^контент по блокам/.test(t) ||
    /^контент страницы/.test(t) ||
    /^страница:/.test(t) ||
    /^метатег/.test(t) ||
    /^структура/.test(t)
  );
}

function cleanBHeadings(text: string): string {
  return text
    .replace(/^#{2,4}\s+(B\d+\s*[—–\-→].+)$/gm, (_, title: string) => {
      const nice = humanizeHeading(title);
      if (!nice || isDropHeading(nice)) return '';
      return `## ${nice}`;
    })
    .replace(/\*\*Заголовок H2:\*\*\s*(.+)/g, (_, t: string) => `## ${cleanInline(t)}`)
    .replace(/^\*\*Заголовок:\*\*\s*(.+)$/gm, (_, t: string) => `## ${cleanInline(t)}`)
    .replace(/^\*\*H2:\*\*\s*(.+)$/gm, (_, t: string) => `## ${cleanInline(t)}`)
    .replace(/^\*\*B\d+[^*]*\*\*\s*$/gm, '');
}

function dropBareHeadings(text: string): string {
  return text.replace(/^#{1,6}\s+(.+)$/gm, (full, title: string) => {
    const t = headingText(String(title));
    return isDropHeading(t) ? '' : full;
  });
}

function stripMetaLines(text: string): string {
  return text
    .replace(/^(?:[-*]\s*)?\*\*(?:H1|Title|URL|Description|Цена|Тип):\*\*.*$/gim, '')
    .replace(/^\*\*(?:H1|Title|URL|Description|Цена|Тип|Значки|Значки-преимущества):\*\*.*$/gim, '')
    .replace(/^\*\*Первый экран[^*]*\*\*:\s*(.+)$/gim, '$1')
    .replace(/^\*\*Подзаголовок:\*\*\s*(.+)$/gim, '$1')
    .replace(/^\*\*Оффер:\*\*\s*(.+)$/gim, '$1')
    .replace(/^\*\*(?:Структура H2|CTA|Микроразметка|Внутренние ссылки)[^*]*\*\*:.*$/gim, '')
    .replace(/^→\s*\[.*$/gm, '')
    .replace(/^\[КОМПОНЕНТ.*$/gm, '')
    .replace(/^→\s*(?:\[C\d+\].*|Кнопка.*)$/gm, '')
    .replace(/^#{1,3}\s+URL:.*$/gm, '')
    .replace(/^#{1,3}\s+content-.*\.md\s*$/gim, '')
    .replace(/^#{1,3}\s+Контентн(ый|ый пакет).*$/gim, '')
    .replace(/^#{1,3}\s+Страница:.*$/gm, '')
    .replace(/^#{1,6}\s+МЕТАТЕГИ\s*$/gim, '')
    .replace(/^#{1,6}\s+\d+\.\s+МЕТАТЕГИ\s*$/gim, '')
    .replace(/^#{2,4}\s+B1\b.*$/gm, '')
    .replace(/^\*\*Таблица параметров:\*\*\s*$/gm, '')
    .replace(/^#{1,6}\s+1\.\s+Мета-теги\s*$/gim, '');
}

function stripEmptyTables(text: string): string {
  return text.replace(/(?:^\|.+\|\s*\n){2,}/gm, (table) => {
    if (/элемент\s*\|\s*текст/i.test(table)) return '';
    if (/блок\s*\|\s*нужен/i.test(table)) return '';
    if (/место\s*\|\s*cta/i.test(table)) return '';
    if (/куда\s*\|\s*анкор/i.test(table)) return '';
    if (/изображение\s*\|\s*alt/i.test(table)) return '';
    if (/url\s*\|\s*тип/i.test(table)) return '';
    return table;
  });
}

function collapse(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export function compactFieldsToMarkdown(block: string): string {
  const parts: string[] = [];
  const first = block.match(/\*\*Первый экран[^*]*\*\*:\s*(.+)/);
  if (first?.[1]) parts.push(cleanInline(first[1]));
  const fieldRe =
    /\*\*([^*]+)\*\*:\s*([\s\S]*?)(?=\n\*\*[^*]+\*\*:|\n### |\n---\s*$|\n\*\*FAQ|\n\*\*CTA|$)/g;
  const skip = /^(url|title|description|h1|цена|структура|cta|микроразметка|внутренние ссылки|тип|первый экран)/i;
  for (const m of block.matchAll(fieldRe)) {
    if (skip.test(m[1].trim())) continue;
    if (/faq/i.test(m[1])) continue;
    const title = m[1].replace(/\s*\(.*\)\s*/g, '').trim();
    const body = cleanInline(m[2].replace(/\n+/g, ' '));
    if (body.length > 12) parts.push(`## ${title}\n\n${body}`);
  }
  return parts.join('\n\n');
}

export function toPublicMarkdown(raw: string): string {
  let text = dropProcessSections(raw);
  const from45 = extract45(text);
  const fromB = extractHeroBlocks(text);
  if (from45 && from45.length > 60) text = from45;
  else if (fromB && fromB.length > 60) text = fromB;
  else text = stripMetaPreamble(text);

  if (/\*\*Первый экран/.test(raw) && (!from45 || from45.length < 80) && (!fromB || fromB.length < 80)) {
    const compact = compactFieldsToMarkdown(raw);
    if (compact.length > 40) text = compact;
  }

  text = convertDraftTable(text);
  text = dropPlanningSections(text);
  text = cleanBHeadings(text);
  text = dropBareHeadings(text);
  text = stripMetaLines(text);
  text = stripEmptyTables(text);
  text = collapse(text);
  return text;
}

const DROP_HTML_H =
  /^(hero:?|b\d+(\s*[—–-].*)?|метатег.*|структура.*|назначение.*|интент.*|контент по блокам.*|контент страницы.*|шапка.*|входные данные|краткий вывод|сводная таблица.*|страница:.*|json-handoff|конкурентная разведка)$/i;

export function polishPublicHtml(html: string): string {
  let out = html.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (full, level, inner) => {
    const text = String(inner)
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\d+\.\s+/, '')
      .trim();
    if (DROP_HTML_H.test(text) || /^B\d+\b/i.test(text)) return '';
    if (/^B\d+/i.test(text.replace(/\s/g, ''))) return '';
    const stripped = text.replace(/^B\d+\s*[—–-]\s*/i, '').trim();
    if (stripped !== text) {
      if (DROP_HTML_H.test(stripped) || /^hero$/i.test(stripped)) return '';
      return `<h${level}>${stripped}</h${level}>`;
    }
    return full;
  });
  out = out.replace(
    /<p>\s*(?:<strong>)?\s*(H1|Title|URL|Description|Подзаголовок|Оффер|Значки(?:-преимущества)?|Заголовок(?:\s*H2)?|H2)\s*:?\s*(?:<\/strong>)?\s*([^<]*)<\/p>/gi,
    (_m, label: string, rest: string) => {
      const t = rest.trim();
      if (/^(h1|title|url|description)$/i.test(label)) return '';
      if (/^(h2|заголовок)/i.test(label) && t) return `<h2>${t}</h2>`;
      if (/подзаголовок|оффер/i.test(label) && t) return `<p>${t}</p>`;
      return t ? `<p>${t}</p>` : '';
    },
  );
  out = out.replace(
    /<p>\s*<strong>\s*(H1|Title|URL|Description|Подзаголовок|Оффер|Значки|Заголовок|H2|Hero)\s*:?\s*<\/strong>\s*([^<]*)<\/p>/gi,
    (_m, label: string, rest: string) => {
      const t = rest.trim();
      if (/^(h1|title|url|description)$/i.test(label)) return '';
      if (/^hero$/i.test(label)) return t ? `<p>${t}</p>` : '';
      if (/^(h2|заголовок)/i.test(label) && t) return `<h2>${t}</h2>`;
      if (/подзаголовок|оффер/i.test(label) && t) return `<p>${t}</p>`;
      return t ? `<p>${t}</p>` : '';
    },
  );
  out = out.replace(/<p>\s*<strong>\s*(?:Hero|Первый экран)[^<]*<\/strong>\s*/gi, '<p>');
  out = out.replace(/<p>\s*<strong>\s*Структура H2:?\s*<\/strong>[^<]*<\/p>/gi, '');
  out = out.replace(/<p>\s*<strong>\s*Hero:?\s*<\/strong>\s*([^<]*)<\/p>/gi, '<p>$1</p>');
  out = out.replace(/<li>\s*<strong>\s*(URL|Title|Description|H1|Цена|Тип)\s*:?\s*<\/strong>[\s\S]*?<\/li>/gi, '');
  out = out.replace(/<p>[^<]*компонент\s*c\d+[^<]*<\/p>/gi, '');
  out = out.replace(/<(p|li)>\s*H1:\s*[^<]*(?:<br\s*\/?>)?/gi, '<$1>');
  out = out.replace(/(?:<br\s*\/?>)?\s*Подзаголовок:\s*/gi, ' ');
  out = out.replace(/\s*CTA\s*«[^»]+»(?:\s*\+\s*«[^»]+»)?\.?/g, '');
  out = out.replace(/\s*Плашка траста\.?/gi, '');
  out = out.replace(/Значки:\s*/g, '');
  out = out.replace(/<li>\s*H2:\s*/gi, '<li>');
  out = out.replace(/<h[1-6][^>]*>\s*B\d+[\s\S]*?<\/h[1-6]>/gi, '');
  out = out.replace(/<em>\([^<]*заглушка[^)]*\)<\/em>/gi, '');
  out = out.replace(/email\s*`+`*/g, '');
  out = out.replace(/Завод\s+Завод вагон-домов/g, 'Завод вагон-домов');
  out = out.replace(/<ul>\s*<\/ul>/gi, '');
  return out.replace(/\n{3,}/g, '\n\n');
}

export function toPublicHtml(raw: string): string {
  return polishPublicHtml(mdToHtml(toPublicMarkdown(raw)));
}

export function looksLikeBrief(html: string): boolean {
  return /B2\s*—\s*HERO|контент по блокам|контент страницы:|json-handoff|структура h2-h3|<strong>URL:<\/strong>|<h2>Hero:?<\/h2>/i.test(html);
}
