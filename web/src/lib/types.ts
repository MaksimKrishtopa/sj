export type FaqItem = {
  q: string;
  a: string;
};

export type PageLink = {
  href: string;
  text: string;
};

export type PageDoc = {
  url: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  html: string;
  faq: FaqItem[];
  links: PageLink[];
  price?: string;
  kind?: string;
  crumbs?: PageLink[];
};
