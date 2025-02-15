import { defineConfig } from 'astro';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Open-Docs',
      customCss: [
        './src/styles/custom.css',
      ],
      social: {
        github: 'https://github.com/m1noa/open-docs',
      },
      sidebar: [],
      head: [],
      components: {},
      lastUpdated: true,
      pagination: true,
      editLink: {
        baseUrl: 'https://github.com/m1noa/open-docs/edit/main/',
      },
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
      },
    }),
  ],
});