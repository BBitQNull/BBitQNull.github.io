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
                dark: 'one-dark-pro',
                ignoreMissing: true // 忽略缺失的语法定义
            }
        },
        remarkPlugins: [
            remarkModifiedTime, // 保留时间插件
            remarkMath          // 添加数学公式插件
        ],
        rehypePlugins: [rehypeKatex]
    },

    devToolbar: {
        enabled: false
    },

    vite: {
        plugins: [tailwindcss()]
    }
});