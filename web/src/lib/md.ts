import { marked } from 'marked';
import type { FaqItem } from './types';

marked.setOptions({ gfm: true, breaks: true });

export function mdToHtml(source: string): string {
  const cleaned = source
    .replace(/→\s*\[КОМПОНЕНТ[^\]]*\]/g, '')
    .replace(/→\s*\[C\d+[^\]]*\]/g, '')
    .replace(/\[ФОТО ОТ КЛИЕНТА\]/g, '')
    .replace(/\[Нужно уточнить[^\]]*\]/g, '')
    .replace(/\[уточнить[^\]]*\]/gi, '')
    .replace(/\[гипотеза[^\]]*\]/gi, '')
    .replace(/\[illustrative[^\]]*\]/gi, '')
    .replace(/`\{БРЕНД\}`/g, 'завод')
    .replace(/\{БРЕНД\}/g, 'завод');
  return String(marked.parse(cleaned));
}

export function stripMetaPreamble(text: string): string {
  const markers = [
    /^##\s+B2\b/m,
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
  if (sub) return sub;
  const hero = text.match(/\*\*Hero:\*\*\s*(.+)/i);
  if (hero?.[1]) return hero[1].replace(/\*+/g, '').trim();
  const p = text.match(/\n([А-ЯA-Z][^#\n]{80,280})\n/);
  return p?.[1]?.trim() || '';
}

export function extractFaq(text: string): FaqItem[] {
  const items: FaqItem[] = [];
  const tableBlock = text.match(/\| Вопрос \| Ответ[\s\S]*?\n\n/);
  if (tableBlock) {
    const rows = tableBlock[0].split('\n').slice(2);
    for (const row of rows) {
      const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 2 && cols[0] !== 'Вопрос') {
        items.push({ q: cols[0].replace(/\*+/g, ''), a: cols[1].replace(/\*+/g, '') });
      }
    }
  }
  const compact = text.match(/## 4\. FAQ[\s\S]*?(?=\n## |\n```|$)/);
  if (compact && items.length === 0) {
    const line = compact[0].replace(/## 4\. FAQ[^\n]*\n/, '').replace(/\n/g, ' ');
    const parts = line.split(' · ');
    for (const part of parts) {
      const m = part.match(/(.+?)\s*\((.+)\)\s*$/);
      if (m) items.push({ q: m[1].replace(/\*+/g, '').trim(), a: m[2].trim() });
    }
  }
  const qBlocks = [...text.matchAll(/\*\*Вопрос\s*\d+\*\*\s*\n+([^\n]+)\n+([^\n*][^\n]+)/g)];
  for (const m of qBlocks) {
    items.push({ q: m[1].trim(), a: m[2].trim() });
  }
  const starFaq = [...text.matchAll(/\*\s*\*([^*]+)\*\s*[—-]\s*(.+)/g)];
  for (const m of starFaq) {
    items.push({ q: m[1].trim(), a: m[2].trim() });
  }
  const seen = new Set<string>();
  return items.filter((it) => {
    if (!it.q || !it.a || seen.has(it.q)) return false;
    seen.add(it.q);
    return true;
  });
}

export function extractLinks(text: string): { href: string; text: string }[] {
  const links: { href: string; text: string }[] = [];
  const fromJson = [...text.matchAll(/"kuda"\s*:\s*"(\/[^"]+)"[\s\S]*?"ankor"\s*:\s*"([^"]+)"/g)];
  for (const m of fromJson) {
    links.push({ href: m[1].endsWith('/') ? m[1] : `${m[1]}/`, text: m[2] });
  }
  const md = [...text.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g)];
  for (const m of md) {
    links.push({ href: m[2].endsWith('/') ? m[2] : `${m[2]}/`, text: m[1] });
  }
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.href)) return false;
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
    .replace(/## 1\. Входные данные[\s\S]*?(?=## 4\.|## B2|## 2\. СТРУКТУРА)/g, '')
    .replace(/## 2\. Краткий вывод[\s\S]*?(?=## 4\.|## B2)/g, '')
    .replace(/## 3\. Сводная таблица[\s\S]*?(?=## 4\.|## B2)/g, '');
}
