import { defineConfig } from 'astro/config';

export default defineConfig({
  // GitHub Pages 部署时使用 SITE_BASE=/lifenotes/；本地开发可保持默认根路径。
  base: process.env.SITE_BASE || '/',
  vite: { server: { strictPort: true } },
  build: {
    format: 'directory',
  },
});
