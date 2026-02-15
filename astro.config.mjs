import { defineConfig } from 'astro/config';

export default defineConfig({
  // For GitHub Pages: use your repo name, e.g. base: '/comprehension-converter/'
  base: '/comprehension-converter/',
  build: {
    inlineStylesheets: 'auto',
  },
});
