import { defineConfig } from 'astro/config';

const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://localhost',
  base,
  trailingSlash: 'always',
  vite: {
    server: {
      fs: {
        allow: ['..', '.'],
      },
    },
  },
});
