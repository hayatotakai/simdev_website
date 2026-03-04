// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://hayatotakai.github.io',
	base: process.env.GITHUB_PAGES ? '/simdev_website' : '',
	output: 'static',
});
