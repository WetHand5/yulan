import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://wethand5.github.io',
  base: '/yulan',
  integrations: [tailwind(), react()],
  output: 'static',
});
