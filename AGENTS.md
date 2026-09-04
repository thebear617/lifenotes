# AGENTS.md

## 项目定位

`lifenotes` 是基于 Astro 的独立常识资料库与静态网站。内容集合和站点代码全部保存在本仓库，不依赖 Obsidian 或其他笔记库。

- 正式内容源：`src/content/`；集合配置：`src/content.config.ts`
- 补充资料入口：`content/_inbox/video-transcripts/`
- 构建命令：`npm run build`
- 本地开发：`npm run dev`
- Agent 浏览器验收：`npm run dev:verify -- --port <空闲端口>`
- 本地预览构建结果：`npm run preview`

## 文件边界

- `src/content/<领域>/`：Astro Content Layer 的正式发布内容。
- `content/<领域>/`：历史资料与原始整理源；新增正式网页内容应优先写入 `src/content/`。
- `content/_inbox/video-transcripts/`：新视频的待整理转写，不直接编译。
- `src/pages/`：首页、领域页和详情页路由。
- `src/admin/local-cms.mjs`：本地 CMS 的 Astro/Vite 开发服务器中间件，负责读取、校验并写入 `src/content/` Markdown。
- `src/pages/admin.astro`：本地 CMS 管理页面，提供文章编辑、新建、Markdown 预览和保存界面。
- `src/styles/global.css`：全站样式。
- `src/data/boards.js`：领域导航配置。
- `src/data/board-categories.js`：7 个领域的一级、二级分类配置。
- 每次 Git 操作都在 `lifenotes/` 内执行；提交使用中文 `type: 描述`。

## 本地 CMS 约束

- 使用 `npm run dev` 启动后，仅通过 <http://localhost:4326/admin/> 访问本地 CMS；支持编辑已有文章、新建文章、预览 Markdown 和保存。
- 保存操作由 `src/admin/local-cms.mjs` 直接写入 `src/content/`，仍须遵守正式内容的目录、frontmatter 和日期规范。
- 日常编辑只保留一个普通 `npm run dev` 实例。Agent 需要浏览器验收时，必须运行 `npm run dev:verify -- --port <空闲端口>`，不能再启动第二个普通开发服务器。
- `dev:verify` 会在系统临时目录复制 `src/`，并使用独立的 Astro 根目录、缓存和 `CMS_CONTENT_ROOT`；验收中 CMS 的保存与自动保存只会修改临时副本，不会改动仓库源内容。
- 本地 CMS 只应运行在开发环境。`src/pages/admin.astro` 必须保持开发环境判断，生产构建会移除 `/admin`；不要把开发服务器或管理入口暴露到公网。
- 不要为方便线上访问而增加 CMS 的公网接口、认证绕过或其他部署配置。

## Frontmatter 规范

每篇 `src/content/<领域>/*.md` 的 frontmatter **必须**包含 `date` 字段；`updated` 可以省略，`src/content.config.ts` 会在解析时将其回退为 `date`。`date` 统一按 `YYYY-MM-DD` 字符串处理；`updated` 支持 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm`（本地时间，分钟级），列表排序按 `updated` 精确到分钟。

| 字段 | 含义 | 格式 | 示例 |
|------|------|------|------|
| `date` | 文章创建 / 首发日期 | `YYYY-MM-DD` 字符串 | `"2026-08-05"` |
| `updated` | 最近一次内容修改时间；省略时回退为 `date` | `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm` 字符串 | `"2026-08-05 21:30"` |

- 通过本地 CMS 保存时，`updated` 会自动写为当天的 `YYYY-MM-DD HH:mm`，无需手动编辑；直接修改 Markdown 源文件时，如需记录修改时间，仍需手动同步该字段。
- 推荐字段顺序：`title` → `description` → `category` → `subcategory` → `date` → `updated`（可选 `slug`）。
- schema 定义位置：`src/content.config.ts`。

示例 frontmatter：

```yaml
---
title: "示例文章"
description: "这是一篇示例文章。"
category: "tech"
subcategory: "astro"
date: "2026-08-05"
updated: "2026-08-05 21:30"
---
```

正式内容文件使用 `src/content/<领域>/<一级分类英文>/<二级分类英文>/` 两层目录，文件名以对应二级分类的中文名作为前缀。目录仅用于组织内容，详情页地址由 `slug` 决定。

## 视频转写 skill

处理 B 站、小红书或抖音视频的音频提取、字幕生成、转写稿整理时，先读取并遵循：

`/Users/mokaiche/.claude/skills/bili-audio-transcribe/SKILL.md`

必须调用共享 wrapper：

```bash
/Users/mokaiche/.claude/skills/bili-audio-transcribe/scripts/bili-trans "<url-or-bv>" \
  --proxy http://127.0.0.1:7897 \
  --backend mlx \
  --model large-v3-turbo
```

默认产物写入 `content/_inbox/video-transcripts/`。实际 MLX 转写需要在 Codex sandbox 外运行，以访问 Apple Silicon Metal。

转写后先判断领域，把原始资料保留在 `content/_inbox/video-transcripts/` 或归档目录，再把提炼后的正式记录写入 `src/content/<领域>/`，运行 `npm run build` 并检查页面。不要写回旧 Obsidian 笔记库。
