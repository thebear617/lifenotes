import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { execFile } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkFootnoteIndent from '../plugins/remark-footnote-indent.mjs';
import rehypeKatex from 'rehype-katex';
import rehypeMark from '../plugins/rehype-mark.mjs';
import rehypePopover from '../plugins/rehype-popover.mjs';
import rehypeTableWrap from '../plugins/rehype-table-wrap.mjs';
import rehypeSourcePosition from '../plugins/rehype-source-position.mjs';
import footnoteReferenceWithLabel from '../plugins/footnote-reference-with-label.mjs';
import { canonicalArticlePath } from '../data/content-paths.js';

const ROOT = process.env.CMS_CONTENT_ROOT ? path.resolve(process.env.CMS_CONTENT_ROOT) : path.resolve(process.cwd(), 'src/content');
const DEV_SERVER_LOCK = path.resolve(process.cwd(), '.astro', 'lifenotes-dev-server.lock');
const execFileAsync = promisify(execFile);
const BOARDS = ['life', 'hotel', 'ai', 'auto', 'biology', 'finance', 'humanities'];
const FIELDS = ['title', 'date', 'updated', 'category', 'subcategory', 'description', 'slug'];
const markdownProcessor = createMarkdownProcessor({
  remarkPlugins: [remarkFootnoteIndent, remarkMath],
  rehypePlugins: [rehypeKatex, rehypeMark, rehypeTableWrap, rehypePopover, rehypeSourcePosition],
  remarkRehype: {
    handlers: { footnoteReference: footnoteReferenceWithLabel },
  },
});

function readDevServerLock() {
  try {
    return JSON.parse(fsSync.readFileSync(DEV_SERVER_LOCK, 'utf8'));
  } catch {
    return null;
  }
}

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function claimDevServerLock() {
  fsSync.mkdirSync(path.dirname(DEV_SERVER_LOCK), { recursive: true });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const handle = fsSync.openSync(DEV_SERVER_LOCK, 'wx');
      try {
        fsSync.writeFileSync(handle, `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`);
      } finally {
        fsSync.closeSync(handle);
      }
      process.once('exit', () => {
        const owner = readDevServerLock();
        if (owner?.pid === process.pid) fsSync.rmSync(DEV_SERVER_LOCK, { force: true });
      });
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const owner = readDevServerLock();
      if (owner?.pid === process.pid) return;
      if (isProcessRunning(owner?.pid)) {
        throw new Error(`LifeNotes 开发服务已在运行（PID ${owner.pid}）。请复用现有服务，不要在同一项目启动第二个 Astro 开发服务。`);
      }
      fsSync.rmSync(DEV_SERVER_LOCK, { force: true });
    }
  }

  throw new Error('无法创建 LifeNotes 开发服务锁');
}

function usesIsolatedVerificationCache(server) {
  const serverRoot = typeof server.config?.root === 'string' ? path.resolve(server.config.root) : path.resolve(process.cwd());
  return process.env.CMS_ISOLATED_DEV === '1' && serverRoot !== path.resolve(process.cwd());
}

function safePath(value) {
  if (typeof value !== 'string' || !value.endsWith('.md')) return null;
  const absolute = path.resolve(ROOT, value);
  if (!absolute.startsWith(`${ROOT}${path.sep}`)) return null;
  const board = value.split('/')[0];
  return BOARDS.includes(board) ? absolute : null;
}

function trashDirectory() {
  return process.platform === 'darwin'
    ? path.join(os.homedir(), '.Trash')
    : path.join(os.homedir(), '.local', 'share', 'Trash', 'files');
}

async function moveToTrash(filePath) {
  if (process.platform === 'darwin') {
    const script = [
      'on run argv',
      '  set targetFile to POSIX file (item 1 of argv) as alias',
      '  tell application "Finder"',
      '    delete targetFile',
      '  end tell',
      'end run',
    ].join('\n');
    await execFileAsync('/usr/bin/osascript', ['-e', script, filePath]);
    return filePath;
  }

  const directory = trashDirectory();
  await fs.mkdir(directory, { recursive: true });
  const originalName = path.basename(filePath);
  const parsed = path.parse(originalName);
  let target = path.join(directory, originalName);
  let suffix = 1;
  while (true) {
    try {
      await fs.access(target);
      target = path.join(directory, `${parsed.name} (${suffix})${parsed.ext}`);
      suffix += 1;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      break;
    }
  }
  try {
    await fs.rename(filePath, target);
  } catch (error) {
    if (error.code !== 'EXDEV') throw error;
    await fs.copyFile(filePath, target);
    try {
      await fs.unlink(filePath);
    } catch (removeError) {
      await fs.rm(target, { force: true }).catch(() => {});
      throw removeError;
    }
  }
  return target;
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

function currentLocalDate() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function currentLocalDateTime() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${currentLocalDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(frontmatter.date || ''))) errors.push('date 必须使用 YYYY-MM-DD');
  if (frontmatter.updated && !/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2})?$/.test(String(frontmatter.updated))) errors.push('updated 必须使用 YYYY-MM-DD 或 YYYY-MM-DD HH:mm');
  if (!safePath(articlePath)) errors.push('文章路径不在允许的 src/content 领域目录内');
  const normalizedPath = String(articlePath || '').replaceAll('\\', '/');
  const board = normalizedPath.split('/')[0];
  const expected = canonicalArticlePath(board, frontmatter.category, frontmatter.subcategory, frontmatter.title);
  if (!expected) errors.push('文件路径无法从领域、分类、子分类和标题生成');
  else if (expected !== normalizedPath) errors.push('文件路径必须与领域、分类、子分类和标题对应');
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
      if (server.config.command === 'serve' && !server.config.server.middlewareMode && !usesIsolatedVerificationCache(server)) claimDevServerLock();

      // CMS writes trigger the dev server's content-change broadcast, which full-reloads the admin page itself.
      // Swallow update signals shortly after a self-write so saving does not refresh the editor.
      let lastSelfWriteAt = 0;
      const SUPPRESS_WINDOW_MS = 2500;
      const hot = server.hot || server.ws;
      if (hot) {
        const originalSend = hot.send.bind(hot);
        hot.send = (...args) => {
          const payload = typeof args[0] === 'string' ? { type: args[0] } : (args[0] || {});
          if ((payload.type === 'full-reload' || payload.type === 'update') && Date.now() - lastSelfWriteAt < SUPPRESS_WINDOW_MS) {
            console.log(`[local-cms] swallowed ${payload.type} broadcast caused by CMS save`);
            return;
          }
          return originalSend(...args);
        };
      }

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
          if (request.method === 'DELETE' && url.pathname === '/article' && safePath(articlePath)) {
            const absolutePath = safePath(articlePath);
            try {
              await fs.access(absolutePath);
            } catch (error) {
              if (error.code === 'ENOENT') return json(response, 404, { error: '文章不存在' });
              throw error;
            }
            await moveToTrash(absolutePath);
            lastSelfWriteAt = Date.now();
            return json(response, 200, { ok: true, path: articlePath });
          }
          if (request.method === 'POST' && url.pathname === '/article') {
            const data = await readBody(request);
            const target = safePath(data.path);
            const previous = data.previousPath ? safePath(data.previousPath) : null;
            if (data.previousPath && !previous) return json(response, 400, { error: '原文章路径不在允许的内容目录内' });
            const frontmatter = { ...(data.frontmatter || {}), updated: currentLocalDateTime() };
            const errors = validate(frontmatter, data.path);
            if (errors.length) return json(response, 400, { errors });
            if (previous && previous !== target) {
              try {
                await fs.access(previous);
              } catch (error) {
                if (error.code === 'ENOENT') return json(response, 404, { error: '原文章不存在' });
                throw error;
              }
              try {
                await fs.access(target);
                return json(response, 409, { error: '目标路径已存在，请先更换文件路径' });
              } catch (error) {
                if (error.code !== 'ENOENT') throw error;
              }
              await fs.mkdir(path.dirname(target), { recursive: true });
              await fs.rename(previous, target);
            } else {
              await fs.mkdir(path.dirname(target), { recursive: true });
            }
            await fs.writeFile(target, serializeMarkdown(frontmatter, data.body || ''), 'utf8');
            lastSelfWriteAt = Date.now();
            return json(response, 200, { ok: true, path: data.path, frontmatter });
          }
          return json(response, 404, { error: 'Not found' });
        } catch (error) {
          return json(response, 400, { error: error.message });
        }
      });
    },
  };
}
