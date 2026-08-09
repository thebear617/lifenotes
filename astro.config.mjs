import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import remarkFootnoteIndent from './src/plugins/remark-footnote-indent.mjs';
import rehypePopover from './src/plugins/rehype-popover.mjs';

export default defineConfig({
  // GitHub Pages 部署时使用 SITE_BASE=/lifenotes/；本地开发可保持默认根路径。
  base: process.env.SITE_BASE || '/',
  vite: { server: { strictPort: true } },
  build: {
    format: 'directory',
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkFootnoteIndent],
      rehypePlugins: [rehypePopover],
    }),
  },
});
