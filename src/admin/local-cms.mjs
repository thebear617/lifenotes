import fs from 'node:fs/promises';
import path from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkFootnoteIndent from '../plugins/remark-footnote-indent.mjs';
import rehypePopover from '../plugins/rehype-popover.mjs';
import rehypeSourcePosition from '../plugins/rehype-source-position.mjs';

const ROOT = path.resolve(process.cwd(), 'src/content');
const BOARDS = ['life', 'hotel', 'ai', 'auto', 'biology', 'finance', 'history'];
const FIELDS = ['title', 'description', 'category', 'subcategory', 'date', 'updated', 'slug', 'topic', 'format', 'visible'];
const markdownProcessor = createMarkdownProcessor({
  remarkPlugins: [remarkFootnoteIndent],
  rehypePlugins: [rehypePopover, rehypeSourcePosition],
});

function safePath(value) {
  if (typeof value !== 'string' || !value.endsWith('.md')) return null;
  const absolute = path.resolve(ROOT, value);
  if (!absolute.startsWith(`${ROOT}${path.sep}`)) return null;
  const board = value.split('/')[0];
  return BOARDS.includes(board) ? absolute : null;
}

function scalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).replace(/\\([\\"])/g, '$1');
  }
  if (trimmed === 'true' || trimmed === 'false') return trimmed === 'true';
  return trimmed;
}

function parseMarkdown(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: source };
  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (field) frontmatter[field[1]] = scalar(field[2]);
  }
  return { frontmatter, body: match[2] };
}

function yamlValue(value) {
  if (typeof value === 'boolean') return String(value);
  return JSON.stringify(String(value ?? ''));
}

function serializeMarkdown(frontmatter, body) {
  const lines = ['---'];
  for (const field of FIELDS) {
    if (frontmatter[field] !== undefined && frontmatter[field] !== '') lines.push(`${field}: ${yamlValue(frontmatter[field])}`);
  }
  lines.push('---', '', body.replace(/^\n+/, ''));
  return `${lines.join('\n')}\n`;
}

function validate(frontmatter, articlePath) {
  const errors = [];
  if (!frontmatter.title?.trim()) errors.push('title 不能为空');
  for (const field of ['date', 'updated']) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(frontmatter[field] || ''))) errors.push(`${field} 必须使用 YYYY-MM-DD`);
  }
  if (frontmatter.format && !['note', 'article'].includes(frontmatter.format)) errors.push('format 只能是 note 或 article');
  if (frontmatter.visible !== undefined && typeof frontmatter.visible !== 'boolean') errors.push('visible 必须是 true 或 false');
  if (!safePath(articlePath)) errors.push('文章路径不在允许的 src/content 领域目录内');
  return errors;
}

async function walk(board, relative = '') {
  const directory = path.join(ROOT, board, relative);
  let entries = [];
  try { entries = await fs.readdir(directory, { withFileTypes: true }); } catch { return []; }
  const result = [];
  for (const entry of entries) {
    const next = path.join(relative, entry.name);
    if (entry.isDirectory()) result.push(...await walk(board, next));
    else if (entry.isFile() && entry.name.endsWith('.md')) {
      const articlePath = path.posix.join(board, next.split(path.sep).join('/'));
      const source = await fs.readFile(path.join(ROOT, articlePath), 'utf8');
      const { frontmatter } = parseMarkdown(source);
      result.push({ path: articlePath, title: frontmatter.title || entry.name.replace(/\.md$/, ''), ...frontmatter });
    }
  }
  return result;
}

function json(response, status, data) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  return JSON.parse(raw || '{}');
}

export default function localCms() {
  return {
    name: 'lifenotes-local-cms',
    configureServer(server) {
      // Astro's dev HTML response currently omits the charset parameter. Keep
      // the CMS page explicitly UTF-8 even when Vite later sets its own type.
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        if (pathname !== '/admin' && pathname !== '/admin/') return next();

        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        const writeHead = response.writeHead;
        response.writeHead = function (...args) {
          const headersIndex = typeof args[1] === 'string' ? 2 : 1;
          if (args[headersIndex] && typeof args[headersIndex] === 'object') {
            args[headersIndex] = { ...args[headersIndex], 'Content-Type': 'text/html; charset=utf-8' };
          }
          this.setHeader('Content-Type', 'text/html; charset=utf-8');
          return writeHead.apply(this, args);
        };
        next();
      });

      server.middlewares.use('/admin/api', async (request, response) => {
        try {
          const url = new URL(request.url, 'http://localhost');
          if (request.method === 'GET' && url.pathname === '/articles') {
            const articles = (await Promise.all(BOARDS.map((board) => walk(board)))).flat();
            return json(response, 200, { articles: articles.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN')) });
          }
          if (request.method === 'POST' && url.pathname === '/preview') {
            const data = await readBody(request);
            const processor = await markdownProcessor;
            const rendered = await processor.render(String(data.body || ''));
            return json(response, 200, { html: rendered.code });
          }
          const articlePath = url.searchParams.get('path');
          if (request.method === 'GET' && url.pathname === '/article' && safePath(articlePath)) {
            const source = await fs.readFile(safePath(articlePath), 'utf8');
            return json(response, 200, { path: articlePath, ...parseMarkdown(source) });
          }
          if (request.method === 'POST' && url.pathname === '/article') {
            const data = await readBody(request);
            const target = safePath(data.path);
            const errors = validate(data.frontmatter || {}, data.path);
            if (errors.length) return json(response, 400, { errors });
            await fs.mkdir(path.dirname(target), { recursive: true });
            await fs.writeFile(target, serializeMarkdown(data.frontmatter, data.body || ''), 'utf8');
            return json(response, 200, { ok: true, path: data.path });
          }
          return json(response, 404, { error: 'Not found' });
        } catch (error) {
          return json(response, 400, { error: error.message });
        }
      });
    },
  };
}
