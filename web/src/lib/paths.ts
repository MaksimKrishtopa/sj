import fs from 'node:fs';
import path from 'node:path';

function findRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), '..'),
    process.cwd(),
    path.resolve(process.cwd(), '../..'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'kupit-beton-v-zhukovskom'))) return candidate;
  }
  return path.resolve(process.cwd(), '..');
}

export const REPO_ROOT = findRoot();
export const BETON_DIR = path.join(REPO_ROOT, 'kupit-beton-v-zhukovskom');
export const JAZZ_DIR = path.join(REPO_ROOT, 'vibecode-seojazz');
export const VAGON_DIR = path.join(REPO_ROOT, 'Вагон дом 2.0');

export function siteHref(mount: string, url = '/'): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = url.startsWith('/') ? url : `/${url}`;
  const trimmed = normalized === '/' ? '' : normalized.replace(/^\//, '');
  const prefix = mount.replace(/^\/|\/$/g, '');
  const root = base.endsWith('/') ? base : `${base}/`;
  if (!trimmed) return `${root}${prefix}/`;
  return `${root}${prefix}/${trimmed}`.replace(/\/{2,}/g, '/').replace(/\/?$/, '/');
}

export function absHref(url: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const root = base.endsWith('/') ? base : `${base}/`;
  const trimmed = url.replace(/^\//, '');
  if (!trimmed) return root;
  return `${root}${trimmed}`.replace(/\/{2,}/g, '/');
}

export function rewriteSiteLinks(html: string, mount: string): string {
  return html.replace(/href="(\/[^"]*)"/g, (_m, href: string) => {
    if (href.startsWith('//') || href.startsWith('/tel:') || href.startsWith('/mailto:')) {
      return `href="${href}"`;
    }
    return `href="${siteHref(mount, href)}"`;
  });
}
