import type { APIRoute } from 'astro';
import { loadBetonPages } from '../lib/beton';
import { loadJazzPages } from '../lib/seojazz';
import { loadVagonPages } from '../lib/vagon';

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, '') || '';
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const urls = [
    `${origin}${base}/`,
    `${origin}${base}/beton/`,
    `${origin}${base}/seojazz/`,
    `${origin}${base}/vagon-dom/`,
    ...loadBetonPages().filter((p) => p.url !== '/').map((p) => `${origin}${base}/beton${p.url}`),
    ...loadJazzPages().map((p) => `${origin}${base}/seojazz${p.url}`),
    ...loadVagonPages().filter((p) => p.url !== '/').map((p) => `${origin}${base}/vagon-dom${p.url}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
