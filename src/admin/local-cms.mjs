import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkBreaks from 'remark-breaks';
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
const CMS_PUBLIC_ROOT = path.resolve(process.env.CMS_ASSET_ROOT || path.join(process.cwd(), 'public'));
const NOTE_IMAGE_DIRECTORY = path.resolve(CMS_PUBLIC_ROOT, 'images/notes');
const NOTE_IMAGE_URL_PREFIX = '/images/notes/';
const MAX_NOTE_IMAGE_BYTES = 2 * 1024 * 1024;
const execFileAsync = promisify(execFile);
const BOARDS = ['life', 'service', 'industry', 'humanities', 'notes'];
const FIELDS = ['title', 'date', 'updated', 'category', 'subcategory', 'description', 'slug'];
const NOTE_IMAGE_COLLECTIONS = Object.fromEntries(BOARDS.map((board) => [
  board,
  { directory: path.join(NOTE_IMAGE_DIRECTORY, board), urlPrefix: `/images/notes/${board}/` },
]));
const markdownProcessor = createMarkdownProcessor({
  remarkPlugins: [remarkFootnoteIndent, remarkBreaks, remarkMath],
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
  if (process.env.CMS_TRASH_ROOT) return path.resolve(process.env.CMS_TRASH_ROOT);
  return process.platform === 'darwin'
    ? path.join(os.homedir(), '.Trash')
    : path.join(os.homedir(), '.local', 'share', 'Trash', 'files');
}

async function moveToTrashDirectory(filePath) {
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
    try {
      await execFileAsync('/usr/bin/osascript', ['-e', script, filePath]);
      return filePath;
    } catch (error) {
      // 隔离验收、无 GUI 会话或 Finder 暂时不可用时，仍然保留可恢复删除能力。
      try {
        await fs.access(filePath);
      } catch (accessError) {
        if (accessError.code === 'ENOENT') return filePath;
        throw accessError;
      }
      console.warn(`[local-cms] Finder 废纸篓不可用，改为移动到 ${trashDirectory()}: ${error.message}`);
    }
  }

  return moveToTrashDirectory(filePath);
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

async function readBinaryBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_NOTE_IMAGE_BYTES) throw new Error('大于这个尺寸，请进行压缩处理');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function imageExtension(mimeType) {
  return {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }[mimeType] || null;
}

function hasImageSignature(buffer, mimeType) {
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  if (mimeType === 'image/gif') return buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a';
  if (mimeType === 'image/webp') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

async function saveNoteImage(request) {
  const url = new URL(request.url || '/', 'http://localhost');
  const mimeType = String(request.headers['content-type'] || '').split(';', 1)[0].trim().toLowerCase();
  const extension = imageExtension(mimeType);
  if (!extension) throw new Error('仅支持 JPG、PNG、WebP 或 GIF 图片');

  const buffer = await readBinaryBody(request);
  if (!buffer.length) throw new Error('图片内容为空');
  if (!hasImageSignature(buffer, mimeType)) throw new Error('图片内容无法识别');

  const collection = url.searchParams.get('collection');
  const assetKey = normalizeImageAssetKey(url.searchParams.get('assetKey'));
  const target = collection && assetKey
    ? noteImageTarget(collection, assetKey)
    : !collection && !url.searchParams.has('assetKey')
      ? { directory: NOTE_IMAGE_DIRECTORY, urlPrefix: NOTE_IMAGE_URL_PREFIX }
      : null;
  if (!target) throw new Error('图片所属文章信息无效');

  await fs.mkdir(target.directory, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  const targetPath = path.join(target.directory, fileName);
  const temporaryPath = `${targetPath}.uploading`;
  await fs.writeFile(temporaryPath, buffer, { flag: 'wx' });
  try {
    await fs.rename(temporaryPath, targetPath);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
  return { path: `${target.urlPrefix}${fileName}`, mimeType, bytes: buffer.length };
}

function normalizeImageAssetKey(value) {
  const normalized = String(value || '')
    .trim()
    .normalize('NFKC')
    .replace(/[\\/]+/g, '-')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return normalized && normalized !== '.' && normalized !== '..' ? normalized : null;
}

function normalizeImageFileName(value) {
  const normalized = String(value || '').trim().normalize('NFKC');
  return /^[\p{L}\p{N}][\p{L}\p{N}._-]*\.(?:jpg|jpeg|png|webp|gif)$/iu.test(normalized)
    ? normalized
    : null;
}

function noteImageTarget(collection, assetKey) {
  const config = NOTE_IMAGE_COLLECTIONS[collection];
  const normalizedKey = normalizeImageAssetKey(assetKey);
  if (!config || !normalizedKey) return null;
  return {
    directory: path.resolve(config.directory, normalizedKey),
    urlPrefix: `${config.urlPrefix}${normalizedKey}/`,
  };
}

function noteImageFilePath(pathname) {
  let decodedPathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decodedPathname.startsWith(NOTE_IMAGE_URL_PREFIX)) {
    const fileName = decodedPathname.slice(NOTE_IMAGE_URL_PREFIX.length);
    const normalizedFileName = !fileName.includes('/') && normalizeImageFileName(fileName);
    if (normalizedFileName) {
      return {
        directory: NOTE_IMAGE_DIRECTORY,
        filePath: path.resolve(NOTE_IMAGE_DIRECTORY, normalizedFileName),
        fileName: normalizedFileName,
      };
    }
  }

  for (const config of Object.values(NOTE_IMAGE_COLLECTIONS)) {
    if (!decodedPathname.startsWith(config.urlPrefix)) continue;
    const [assetKey, fileName, ...rest] = decodedPathname.slice(config.urlPrefix.length).split('/');
    const normalizedAssetKey = normalizeImageAssetKey(assetKey);
    const normalizedFileName = normalizeImageFileName(fileName);
    if (rest.length || !normalizedAssetKey || !normalizedFileName) return null;
    const directory = path.resolve(config.directory, normalizedAssetKey);
    return {
      directory,
      filePath: path.resolve(directory, normalizedFileName),
      fileName: normalizedFileName,
    };
  }

  return null;
}

function extractManagedImagePaths(body) {
  const paths = [];
  const seen = new Set();
  const matches = String(body || '').match(/\/images\/(?:notes|timeline)\/[^\s)"'<>]+/g) || [];
  for (const pathname of matches) {
    const image = noteImageFilePath(pathname);
    if (!image || seen.has(image.filePath)) continue;
    seen.add(image.filePath);
    paths.push({ pathname, ...image });
  }
  return paths;
}

async function collectReferencedManagedImagePaths() {
  const referencedPaths = new Set();

  async function scan(directory) {
    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }

    for (const entry of entries) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await scan(filePath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const source = await fs.readFile(filePath, 'utf8');
      for (const image of extractManagedImagePaths(source)) referencedPaths.add(image.filePath);
    }
  }

  await scan(ROOT);
  return referencedPaths;
}

async function removeUnreferencedManagedImages(previousBody, nextBody) {
  const nextPaths = new Set(extractManagedImagePaths(nextBody).map((image) => image.filePath));
  const candidates = extractManagedImagePaths(previousBody)
    .map((image) => image.filePath)
    .filter((filePath) => !nextPaths.has(filePath));
  if (!candidates.length) return;

  let referencedPaths;
  try {
    referencedPaths = await collectReferencedManagedImagePaths();
  } catch (error) {
    console.warn('[local-cms] 图片引用扫描失败，跳过本次图片清理', error);
    return;
  }
  for (const filePath of candidates) {
    if (referencedPaths.has(filePath) || !(await fileExists(filePath))) continue;
    try {
      await moveToTrash(filePath);
    } catch (error) {
      console.warn(`[local-cms] 图片清理失败：${filePath}`, error);
    }
  }
}

function extractManagedImageDirectories(body) {
  const directories = [];
  const seen = new Set();
  const matches = String(body || '').match(/\/images\/(?:notes|timeline)\/[^\s)"'<>]*/g) || [];
  for (const pathname of matches) {
    const separator = pathname.lastIndexOf('/');
    if (separator < 0) continue;
    const directoryImage = noteImageFilePath(`${pathname.slice(0, separator + 1)}placeholder.png`);
    if (!directoryImage || seen.has(directoryImage.directory)) continue;
    seen.add(directoryImage.directory);
    directories.push(directoryImage.directory);
  }
  return directories;
}

function findIncompleteManagedImageReference(body) {
  const matches = String(body || '').match(/\/images\/(?:notes|timeline)\/[^\s)"'<>]*/g) || [];
  for (const pathname of matches) {
    const separator = pathname.lastIndexOf('/');
    if (separator < 0) continue;
    const directoryImage = noteImageFilePath(`${pathname.slice(0, separator + 1)}placeholder.png`);
    if (!directoryImage) continue;
    let fileName = pathname.slice(separator + 1);
    try {
      fileName = decodeURIComponent(fileName);
    } catch {
      return pathname;
    }
    if (!normalizeImageFileName(fileName)) return pathname;
  }
  return null;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function unreferencedImageFiles(directory, referencedPaths) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => normalizeImageFileName(entry.name))
    .filter(Boolean)
    .map((fileName) => path.join(directory, fileName))
    .filter((filePath) => !referencedPaths.has(filePath));
}

async function syncRenamedImages(previousBody, nextBody) {
  const previousImages = extractManagedImagePaths(previousBody);
  const nextImages = extractManagedImagePaths(nextBody);
  const previousDirectories = extractManagedImageDirectories(previousBody);
  const previousPaths = new Set(previousImages.map((image) => image.filePath));
  const nextPaths = new Set(nextImages.map((image) => image.filePath));
  const removedImages = previousImages.filter((image) => !nextPaths.has(image.filePath));
  const addedImages = nextImages.filter((image) => !previousPaths.has(image.filePath));
  const renames = [];
  const plannedRenames = [];
  const missingPairs = [];

  const directories = new Set(removedImages.map((image) => image.directory));
  for (const directory of directories) {
    const oldImages = removedImages.filter((image) => image.directory === directory);
    const newImages = [];
    for (const image of addedImages.filter((item) => item.directory === directory)) {
      if (!(await fileExists(image.filePath))) newImages.push(image);
    }
    if (oldImages.length !== newImages.length || oldImages.length === 0) continue;

    for (let index = 0; index < oldImages.length; index += 1) {
      const oldImage = oldImages[index];
      const newImage = newImages[index];
      const oldExtension = path.extname(oldImage.fileName).toLowerCase();
      const newExtension = path.extname(newImage.fileName).toLowerCase();
      if (oldExtension !== newExtension) throw new Error('图片改名不能更改文件类型');
      if (await fileExists(oldImage.filePath)) plannedRenames.push({ from: oldImage.filePath, to: newImage.filePath });
      else missingPairs.push({ oldImage, newImage });
    }
  }

  if (removedImages.length === 1 && addedImages.length === 1) {
    const oldImage = removedImages[0];
    const newImage = addedImages[0];
    if (oldImage.directory !== newImage.directory && !(await fileExists(newImage.filePath))) {
      throw new Error('图片改名只能修改文件名，不能修改图片目录');
    }
  }

  const plannedTargets = new Set(plannedRenames.map((rename) => rename.to));
  const reservedSources = new Set(plannedRenames.map((rename) => rename.from));
  const recoveryRequests = [];
  for (const image of addedImages) {
    if (plannedTargets.has(image.filePath) || await fileExists(image.filePath)) continue;
    if (previousDirectories.includes(image.directory)) recoveryRequests.push(image);
  }
  for (const image of recoveryRequests) {
    const referencedPaths = new Set([...previousPaths, ...nextPaths, ...reservedSources]);
    const candidates = await unreferencedImageFiles(image.directory, referencedPaths);
    if (candidates.length !== 1) throw new Error('原图片文件不存在，无法同步改名');
    const candidate = candidates[0];
    if (path.extname(candidate).toLowerCase() !== path.extname(image.fileName).toLowerCase()) {
      throw new Error('图片改名不能更改文件类型');
    }
    plannedRenames.push({ from: candidate, to: image.filePath });
    plannedTargets.add(image.filePath);
    reservedSources.add(candidate);
  }

  for (const { newImage } of missingPairs) {
    if (!plannedTargets.has(newImage.filePath)) throw new Error('原图片文件不存在，无法同步改名');
  }

  try {
    for (const rename of plannedRenames) {
      await fs.rename(rename.from, rename.to);
      renames.push(rename);
    }
  } catch (error) {
    await rollbackImageRenames(renames);
    throw error;
  }

  return renames;
}

async function rollbackImageRenames(renames) {
  for (const rename of [...renames].reverse()) {
    try {
      if (await fileExists(rename.to)) await fs.rename(rename.to, rename.from);
    } catch {
      // Keep the original save error. The rollback is best effort for local development.
    }
  }
}

async function serveNoteImage(request, response, next) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();

  const pathname = new URL(request.url || '/', 'http://localhost').pathname;
  const image = noteImageFilePath(pathname);
  if (!image) return next();

  try {
    const buffer = await fs.readFile(image.filePath);
    const extension = path.extname(image.fileName).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    }[extension] || 'application/octet-stream';
    response.statusCode = 200;
    response.setHeader('Content-Type', contentType);
    response.setHeader('Content-Length', buffer.length);
    response.setHeader('Cache-Control', 'no-cache');
    if (request.method === 'HEAD') return response.end();
    return response.end(buffer);
  } catch (error) {
    if (error.code === 'ENOENT') return next();
    response.statusCode = 500;
    return response.end('图片读取失败');
  }
}

export default function localCms() {
  return {
    name: 'lifenotes-local-cms',
    configureServer(server) {
      if (server.config.command === 'serve' && !server.config.server.middlewareMode && !usesIsolatedVerificationCache(server)) claimDevServerLock();

      // Content writes — from the CMS, an Agent session, or a manual editor edit —
      // trigger the dev server's content-change broadcast, which full-reloads the browser.
      // Watch the content roots ourselves and swallow update signals shortly after any
      // content write so saving or Agent edits never refresh the page.
      let lastContentWriteAt = 0;
      const SUPPRESS_WINDOW_MS = 2500;
      const markContentWrite = (filePath) => {
        if (!filePath) return;
        const resolved = path.resolve(filePath);
        const isWatchedContent = resolved === ROOT
          || resolved.startsWith(`${ROOT}${path.sep}`)
          || resolved === NOTE_IMAGE_DIRECTORY
          || resolved.startsWith(`${NOTE_IMAGE_DIRECTORY}${path.sep}`)
        if (isWatchedContent) lastContentWriteAt = Date.now();
      };
      server.watcher.on('add', markContentWrite);
      server.watcher.on('change', markContentWrite);
      server.watcher.on('unlink', markContentWrite);
      const hot = server.hot || server.ws;
      if (hot) {
        const originalSend = hot.send.bind(hot);
        hot.send = (...args) => {
          const payload = typeof args[0] === 'string' ? { type: args[0] } : (args[0] || {});
          if ((payload.type === 'full-reload' || payload.type === 'update') && Date.now() - lastContentWriteAt < SUPPRESS_WINDOW_MS) {
            console.log(`[local-cms] swallowed ${payload.type} broadcast caused by content change`);
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

      // Vite's public-file middleware can miss directories created after the
      // dev server starts. Serve CMS note images directly so a fresh paste is
      // immediately renderable without restarting Astro.
      server.middlewares.use(serveNoteImage);

      server.middlewares.use('/admin/api', async (request, response) => {
        try {
          const url = new URL(request.url, 'http://localhost');
          if (request.method === 'POST' && url.pathname === '/asset') {
            const asset = await saveNoteImage(request);
            lastContentWriteAt = Date.now();
            return json(response, 200, { ok: true, ...asset });
          }
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
            let source;
            try {
              source = await fs.readFile(safePath(articlePath), 'utf8');
            } catch (error) {
              if (error.code === 'ENOENT') return json(response, 404, { error: '文章不存在' });
              throw error;
            }
            return json(response, 200, { path: articlePath, ...parseMarkdown(source) });
          }
          if (request.method === 'DELETE' && url.pathname === '/article' && safePath(articlePath)) {
            const absolutePath = safePath(articlePath);
            let previousBody = '';
            try {
              previousBody = await fs.readFile(absolutePath, 'utf8');
            } catch (error) {
              if (error.code !== 'ENOENT') throw error;
              return json(response, 404, { error: '文章不存在' });
            }
            try {
              await fs.access(absolutePath);
            } catch (error) {
              if (error.code === 'ENOENT') return json(response, 404, { error: '文章不存在' });
              throw error;
            }
            await moveToTrash(absolutePath);
            await removeUnreferencedManagedImages(previousBody, '');
            lastContentWriteAt = Date.now();
            return json(response, 200, { ok: true, path: articlePath });
          }
          if (request.method === 'POST' && url.pathname === '/article') {
            const data = await readBody(request);
            if (findIncompleteManagedImageReference(data.body || '')) {
              return json(response, 400, { error: '图片文件名不能为空，请完成后再保存' });
            }
            const target = safePath(data.path);
            const previous = data.previousPath ? safePath(data.previousPath) : null;
            if (data.previousPath && !previous) return json(response, 400, { error: '原文章路径不在允许的内容目录内' });
            const frontmatter = { ...(data.frontmatter || {}), updated: currentLocalDateTime() };
            const errors = validate(frontmatter, data.path);
            if (errors.length) return json(response, 400, { errors });
            const sourceFile = previous || target;
            let previousBody = '';
            try {
              previousBody = await fs.readFile(sourceFile, 'utf8');
            } catch (error) {
              if (error.code !== 'ENOENT') throw error;
            }
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
            }
            let renamedImages = [];
            let articleMoved = false;
            try {
              renamedImages = await syncRenamedImages(previousBody, data.body || '');
              await fs.mkdir(path.dirname(target), { recursive: true });
              if (previous && previous !== target) {
                await fs.rename(previous, target);
                articleMoved = true;
              }
              await fs.writeFile(target, serializeMarkdown(frontmatter, data.body || ''), 'utf8');
            } catch (error) {
              await rollbackImageRenames(renamedImages);
              if (articleMoved) {
                try {
                  await fs.rename(target, previous);
                } catch {
                  // Keep the original save error. The article rollback is best effort.
                }
              }
              throw error;
            }
            await removeUnreferencedManagedImages(previousBody, data.body || '');
            lastContentWriteAt = Date.now();
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
