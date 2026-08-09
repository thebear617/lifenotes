# AGENTS.md

## 项目定位

`lifenotes` 是基于 Astro 的独立常识资料库与静态网站。内容集合和站点代码全部保存在本仓库，不依赖 Obsidian 或其他笔记库。

- 正式内容源：`src/content/`；集合配置：`src/content.config.ts`
- 补充资料入口：`content/_inbox/video-transcripts/`
- 构建命令：`npm run build`
- 本地开发：`npm run dev`
- 本地预览构建结果：`npm run preview`

## 文件边界

- `src/content/<领域>/`：Astro Content Layer 的正式发布内容。
- `content/<领域>/`：历史资料与原始整理源；新增正式网页内容应优先写入 `src/content/`。
- `content/_inbox/video-transcripts/`：新视频的待整理转写，不直接编译。
- `src/pages/`：首页、领域页和详情页路由。
- `src/styles/global.css`：全站样式。
- `src/data/boards.js`：领域导航配置。
- 每次 Git 操作都在 `lifenotes/` 内执行；提交使用中文 `type: 描述`。

## Frontmatter 规范

每篇 `src/content/<领域>/*.md` 的 frontmatter **必须**包含 `date` 和 `updated` 两个字段。`src/content.config.ts` 中的 `noteSchema` 将它们定义为 `z.coerce.date()` 必填项，缺失任一字段会导致 `npm run build` 直接失败。

| 字段 | 含义 | 格式 | 示例 |
|------|------|------|------|
| `date` | 文章创建 / 首发日期 | `YYYY-MM-DD`（不带引号） | `2026-08-05` |
| `updated` | 最近一次内容修改日期 | `YYYY-MM-DD`（不带引号） | `2026-08-05` |

- 内容更新后需**手动同步** `updated` 为当天日期。
- 推荐字段顺序：`title` → `description` → `category` → `subcategory` → `date` → `updated`（可选 `slug`）。
- schema 定义位置：`src/content.config.ts`。

示例 frontmatter：

```yaml
---
title: "示例文章"
description: "这是一篇示例文章。"
category: "tech"
subcategory: "astro"
date: 2026-08-05
updated: 2026-08-05
---
```

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
