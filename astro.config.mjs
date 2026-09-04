// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Fully static output. Every route is prerendered to HTML and served by
// Cloudflare Workers Static Assets, which are unmetered on both plans — no
// Worker code runs on a page view, so the site costs nothing to serve.
export default defineConfig({
  site: 'https://nvl72.dev',
  output: 'static',
  integrations: [sitemap()],
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto', format: 'file' },
  vite: {
    build: {
      // three.js is the only heavy dependency; keep it in its own chunk so it
      // is fetched lazily by the pages that actually mount a canvas.
      rollupOptions: { output: { manualChunks: { three: ['three'] } } },
    },
  },
});
