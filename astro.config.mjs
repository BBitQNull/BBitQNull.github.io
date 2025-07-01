import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import {remarkModifiedTime} from "./src/utils/remark-modified-time";
import {siteConfig} from "./src/config";

import remarkMath from'remark-math';
import rehypeKatex from'rehype-katex';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: siteConfig.site,

    integrations: [mdx(), sitemap(), icon()],

    markdown: {
        shikiConfig: {
            themes: {
                light: 'one-light',
                dark: 'one-dark-pro'
            }
        },
        remarkPlugins: [remarkModifiedTime],
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex]
    },

    devToolbar: {
        enabled: false
    },

    vite: {
        plugins: [tailwindcss()]
    }
});