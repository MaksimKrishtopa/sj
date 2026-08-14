import fs from 'node:fs';
import path from 'node:path';
import { VAGON_DIR, rewriteSiteLinks } from './paths';
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
} from './md';

export const VAGON_BRAND = 'Завод вагон-домов';
export const VAGON_PHONE = '+7 922 510 0555';
export const VAGON_PHONE_TEL = '+79225100555';

export const VAGON_CITIES = [
  { slug: 'surgut', name: 'Сургут', prep: 'Сургуте', gen: 'Сургута', region: 'ХМАО' },
  { slug: 'tyumen', name: 'Тюмень', prep: 'Тюмени', gen: 'Тюмени', region: 'Тюменская область' },
  { slug: 'nizhnevartovsk', name: 'Нижневартовск', prep: 'Нижневартовске', gen: 'Нижневартовска', region: 'ХМАО' },
  { slug: 'novy-urengoy', name: 'Новый Уренгой', prep: 'Новом Уренгое', gen: 'Нового Уренгоя', region: 'ЯНАО' },
  { slug: 'noyabrsk', name: 'Ноябрьск', prep: 'Ноябрьске', gen: 'Ноябрьска', region: 'ЯНАО' },
  { slug: 'nefteyugansk', name: 'Нефтеюганск', prep: 'Нефтеюганске', gen: 'Нефтеюганска', region: 'ХМАО' },
  { slug: 'khanty-mansiysk', name: 'Ханты-Мансийск', prep: 'Ханты-Мансийске', gen: 'Ханты-Мансийска', region: 'ХМАО' },
  { slug: 'salekhard', name: 'Салехард', prep: 'Салехарде', gen: 'Салехарда', region: 'ЯНАО' },
  { slug: 'nadym', name: 'Надым', prep: 'Надыме', gen: 'Надыма', region: 'ЯНАО' },
  { slug: 'kogalym', name: 'Когалым', prep: 'Когалыме', gen: 'Когалыма', region: 'ХМАО' },
  { slug: 'megion', name: 'Мегион', prep: 'Мегионе', gen: 'Мегиона', region: 'ХМАО' },
  { slug: 'langepas', name: 'Лангепас', prep: 'Лангепасе', gen: 'Лангепаса', region: 'ХМАО' },
  { slug: 'nyagan', name: 'Нягань', prep: 'Нягани', gen: 'Нягани', region: 'ХМАО' },
  { slug: 'tobolsk', name: 'Тобольск', prep: 'Тобольске', gen: 'Тобольска', region: 'Тюменская область' },
  { slug: 'krasnoyarsk', name: 'Красноярск', prep: 'Красноярске', gen: 'Красноярска', region: 'Красноярский край' },
  { slug: 'irkutsk', name: 'Иркутск', prep: 'Иркутске', gen: 'Иркутска', region: 'Иркутская область' },
  { slug: 'novosibirsk', name: 'Новосибирск', prep: 'Новосибирске', gen: 'Новосибирска', region: 'Новосибирская область' },
  { slug: 'omsk', name: 'Омск', prep: 'Омске', gen: 'Омска', region: 'Омская область' },
  { slug: 'tomsk', name: 'Томск', prep: 'Томске', gen: 'Томска', region: 'Томская область' },
  { slug: 'kemerovo', name: 'Кемерово', prep: 'Кемерове', gen: 'Кемерова', region: 'Кемеровская область' },
  { slug: 'novokuznetsk', name: 'Новокузнецк', prep: 'Новокузнецке', gen: 'Новокузнецка', region: 'Кемеровская область' },
  { slug: 'barnaul', name: 'Барнаул', prep: 'Барнауле', gen: 'Барнаула', region: 'Алтайский край' },
  { slug: 'ekaterinburg', name: 'Екатеринбург', prep: 'Екатеринбурге', gen: 'Екатеринбурга', region: 'Свердловская область' },
  { slug: 'chelyabinsk', name: 'Челябинск', prep: 'Челябинске', gen: 'Челябинска', region: 'Челябинская область' },
  { slug: 'perm', name: 'Пермь', prep: 'Перми', gen: 'Перми', region: 'Пермский край' },
  { slug: 'ufa', name: 'Уфа', prep: 'Уфе', gen: 'Уфы', region: 'Башкортостан' },
  { slug: 'kazan', name: 'Казань', prep: 'Казани', gen: 'Казани', region: 'Татарстан' },
  { slug: 'samara', name: 'Самара', prep: 'Самаре', gen: 'Самары', region: 'Самарская область' },
  { slug: 'volgograd', name: 'Волгоград', prep: 'Волгограде', gen: 'Волгограда', region: 'Волгоградская область' },
  { slug: 'orenburg', name: 'Оренбург', prep: 'Оренбурге', gen: 'Оренбурга', region: 'Оренбургская область' },
  { slug: 'magnitogorsk', name: 'Магнитогорск', prep: 'Магнитогорске', gen: 'Магнитогорска', region: 'Челябинская область' },
  { slug: 'nizhny-novgorod', name: 'Нижний Новгород', prep: 'Нижнем Новгороде', gen: 'Нижнего Новгорода', region: 'Нижегородская область' },
  { slug: 'yakutsk', name: 'Якутск', prep: 'Якутске', gen: 'Якутска', region: 'Якутия' },
  { slug: 'norilsk', name: 'Норильск', prep: 'Норильске', gen: 'Норильска', region: 'Красноярский край' },
  { slug: 'murmansk', name: 'Мурманск', prep: 'Мурманске', gen: 'Мурманска', region: 'Мурманская область' },
  { slug: 'arkhangelsk', name: 'Архангельск', prep: 'Архангельске', gen: 'Архангельска', region: 'Архангельская область' },
  { slug: 'syktyvkar', name: 'Сыктывкар', prep: 'Сыктывкаре', gen: 'Сыктывкара', region: 'Коми' },
  { slug: 'ukhta', name: 'Ухта', prep: 'Ухте', gen: 'Ухты', region: 'Коми' },
  { slug: 'vorkuta', name: 'Воркута', prep: 'Воркуте', gen: 'Воркуты', region: 'Коми' },
];

export const VAGON_SERVICES = [
  { slug: 'vagon-doma', name: 'Вагон-дома', parent: '/vagon-doma/', price: '490 000 ₽' },
  { slug: 'zhilye-vagon-doma', name: 'Жилые вагон-дома', parent: '/vagon-doma/zhilye/', price: '490 000 ₽' },
  { slug: 'bytovki', name: 'Бытовки', parent: '/bytovki/', price: 'по запросу' },
  { slug: 'vagon-dom-stolovaya', name: 'Вагон-дом столовая', parent: '/vagon-doma/stolovye/', price: '760 000 ₽' },
  { slug: 'vagon-dom-dushevaya', name: 'Вагон-дом душевая', parent: '/vagon-doma/dushevye/', price: '710 000 ₽' },
  { slug: 'vagon-dom-sanuzel', name: 'Вагон-дом санузел', parent: '/vagon-doma/sanuzly/', price: '390 000 ₽' },
  { slug: 'vagon-dom-sushilka', name: 'Вагон-дом сушилка', parent: '/vagon-doma/sushilki/', price: '685 000 ₽' },
  { slug: 'vagon-dom-masterskaya', name: 'Вагон-дом мастерская', parent: '/vagon-doma/slesarnye-masterskie/', price: '520 000 ₽' },
  { slug: 'vagon-dom-medpunkt', name: 'Вагон-дом медпункт', parent: '/vagon-doma/medpunkty/', price: '560 000 ₽' },
  { slug: 'vagon-dom-ofis', name: 'Вагон-дом офис', parent: '/vagon-doma/ofisy/', price: '630 000 ₽' },
  { slug: 'vagon-dom-kpp', name: 'Вагон-дом КПП', parent: '/vagon-doma/kpp/', price: '535 000 ₽' },
  { slug: 'modulnye-zdaniya', name: 'Модульные здания', parent: '/modulnye-zdaniya/', price: 'по запросу' },
  { slug: 'vahtovye-poselki', name: 'Вахтовые посёлки', parent: '/vahtovye-poselki/', price: 'по запросу' },
];

function brandize(s: string): string {
  return s.replace(/\{БРЕНД\}/g, VAGON_BRAND).replace(/\+7 922 510 0555/g, VAGON_PHONE);
}

function parseCardBlocks(raw: string): PageDoc[] {
  const pages: PageDoc[] = [];
  const chunks = raw.split(/\n### \d+\. /).slice(1);
  for (const chunk of chunks) {
    const block = `### ${chunk}`;
    const url = extractUrl(block, '');
    if (!url || url === '/') continue;
    const title = brandize(extractField(block, ['Title']) || extractH1(block));
    const description = brandize(extractField(block, ['Description']));
    const h1 = brandize(extractField(block, ['H1']) || extractH1(block) || title);
    const priceMatch = block.match(/\*\*Цена:\*\*\s*([^\n(]+)/);
    const price = priceMatch?.[1]?.trim();
    const html = rewriteSiteLinks(mdToHtml(brandize(dropProcessSections(block))), 'vagon-dom');
    pages.push({
      url,
      title,
      description,
      h1,
      lead: brandize(extractLead(block)),
      html,
      faq: extractFaq(block).map((f) => ({ q: brandize(f.q), a: brandize(f.a) })),
      links: extractLinks(block),
      price,
      kind: 'product',
    });
  }
  return pages;
}

function parseBatchPages(raw: string): PageDoc[] {
  const pages: PageDoc[] = [];
  const re = /#{2,3}\s+\d[\d.]*\s*Контент страницы:\s*(\/[^\s]*)/g;
  const matches = [...raw.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? raw.length) : raw.length;
    const block = raw.slice(start, end);
    let url = (matches[i][1] || '/').replace(/[.,;]+$/, '');
    if (url !== '/' && !url.endsWith('/')) url += '/';
    const title = brandize(extractField(block, ['Title']) || extractH1(block) || url);
    const description = brandize(extractField(block, ['Description']));
    const h1 = brandize(extractField(block, ['H1']) || extractH1(block) || title);
    const html = rewriteSiteLinks(mdToHtml(brandize(dropProcessSections(block))), 'vagon-dom');
    pages.push({
      url,
      title,
      description,
      h1,
      lead: brandize(extractLead(block)),
      html,
      faq: extractFaq(block).map((f) => ({ q: brandize(f.q), a: brandize(f.a) })),
      links: extractLinks(block),
      kind: url === '/' ? 'home' : 'page',
    });
  }
  return pages;
}

function makeRegionalPages(parents: PageDoc[]): PageDoc[] {
  const byParent = new Map(parents.map((p) => [p.url, p]));
  const out: PageDoc[] = [];
  for (const city of VAGON_CITIES) {
    for (const svc of VAGON_SERVICES) {
      const url = `/${svc.slug}-${city.slug}/`;
      const parent = byParent.get(svc.parent);
      const h1 = `${svc.name} в ${city.prep}`;
      const title = `${svc.name} в г. ${city.name} — купить от производителя, цена от ${svc.price} | ${VAGON_BRAND}`;
      const description = `${svc.name} в г. ${city.name} от ${VAGON_BRAND}. Доставка в ${city.name} и ${city.region}, срок от 4 дней, гарантия 12 мес. Цена от ${svc.price}.`;
      const intro = `${svc.name} полной заводской готовности. ${VAGON_BRAND} изготавливает и доставляет ${svc.name.toLowerCase()} в ${city.prep} и по региону ${city.region}. Цена от ${svc.price}, срок изготовления от 4 дней, гарантия 12 месяцев, ГОСТ Р 58760-2019.`;
      const delivery = `<h2>Доставка ${svc.name.toLowerCase()} в ${city.name}</h2><p>Доставляем ${svc.name.toLowerCase()} в ${city.name} автомобильным и железнодорожным транспортом. Изделие приезжает в полной заводской готовности — остаётся установить и подключить к сетям. Рассчитаем сроки и стоимость доставки в ${city.prep} и по ${city.region} по вашему адресу.</p>`;
      const inherited = parent?.html ? `<div class="vg-inherited">${parent.html}</div>` : '';
      const cityLinks = VAGON_SERVICES.filter((s) => s.slug !== svc.slug)
        .map((s) => `<a href="/${s.slug}-${city.slug}/">${s.name} в ${city.prep}</a>`)
        .join('');
      const html = rewriteSiteLinks(
        `<p>${intro}</p>${delivery}${inherited}<h2>Другие решения в ${city.prep}</h2><div class="link-grid">${cityLinks}</div>`,
        'vagon-dom',
      );
      const faq = [
        {
          q: `Доставляете ${svc.name.toLowerCase()} в ${city.name}?`,
          a: `Да, доставляем в ${city.prep} и по ${city.region} автомобильным и ж/д транспортом; крепёж и упаковка — по ГОСТ. Изделие приезжает в полной заводской готовности.`,
        },
        ...(parent?.faq || []).slice(0, 5),
      ];
      out.push({
        url,
        title,
        description,
        h1,
        lead: intro,
        html,
        faq,
        links: [
          { href: svc.parent, text: `${svc.name} — каталог` },
          { href: `/vagon-doma-${city.slug}/`, text: `Все вагон-дома в ${city.prep}` },
          { href: '/dostavka/', text: 'Доставка по России' },
        ],
        price: svc.price,
        kind: 'geo',
      });
    }
  }
  return out;
}

let cache: PageDoc[] | null = null;

export function loadVagonPages(): PageDoc[] {
  if (cache) return cache;
  const files = fs.readdirSync(VAGON_DIR).filter((f) => f.endsWith('.md'));
  const unique: PageDoc[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    if (!/КОНТЕНТ/.test(f) && !f.includes('13_')) continue;
    const raw = fs.readFileSync(path.join(VAGON_DIR, f), 'utf8');
    const parsed = f.includes('13_') ? parseCardBlocks(raw) : parseBatchPages(raw);
    for (const p of parsed) {
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      unique.push(p);
    }
  }
  const regional = makeRegionalPages(unique);
  for (const p of regional) {
    if (seen.has(p.url)) continue;
    seen.add(p.url);
    unique.push(p);
  }
  cache = unique;
  return unique;
}

export function vagonByUrl(url: string): PageDoc | undefined {
  return loadVagonPages().find((p) => p.url === url);
}
