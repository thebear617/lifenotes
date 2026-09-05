# lifenotes · 常识笔记

> 基于 Astro 7 的个人常识资料库与静态网站。

当前版本：`v1.4.3`

在线地址（部署后）：<https://thebear617.github.io/lifenotes/>

## 内容与结构

正式发布内容位于 `src/content/`，按领域拆分为 Content Layer 集合；`content/_inbox/video-transcripts/` 保存尚未整理的视频转写，不会直接发布。

```text
src/
├── content.config.ts  # Content Layer 内容集合配置
├── content/           # 正式 Markdown 内容
├── data/boards.js    # 领域导航配置
├── data/board-categories.js # 领域分类配置
├── layouts/          # 页面布局
├── pages/            # 首页、领域页、详情页
└── styles/           # 全站样式
content/
└── _inbox/           # 原始转写与待整理资料
```

正式内容目录使用两层英文目录表达 `category` 和 `subcategory`，最内层文件名以二级分类的中文名作为前缀，例如：

```text
src/content/life/materials/quick-reference/速查对照：尺寸距离时长.md
```

目录名只影响本地内容组织；详情页地址由 frontmatter 中的 `slug` 决定。

当前领域包括：AI产业、动植物、社会人文、数码出行、生活美食、服务业、金融经济。

## 开发与构建

```bash
npm install
npm run dev       # http://localhost:4326/
npm run build
npm run preview
```

GitHub Pages 子路径构建：

```bash
SITE_BASE=/lifenotes/ npm run build
```

Astro 通过 `src/content.config.ts` 中的 `glob` loader 读取 `src/content/` 的 Markdown 并生成静态页面。新增内容时，在对应领域目录添加 Markdown 文件，填写 `title`、`date`、`category`、`subcategory` 和 `slug` 等 frontmatter；`updated` 可以省略，构建时会回退到 `date`。重命名已有文章时保留显式 `slug`，以维持旧地址。

## 本地 CMS

项目提供一个仅供本地开发使用的 CMS，用于管理 `src/content/` 中的正式笔记。启动开发服务器后访问：

```bash
npm run dev
```

然后打开 <http://localhost:4326/admin/>。本地 CMS 支持编辑已有文章、新建文章、预览 Markdown，以及保存文章；点击保存后，内容会直接写入 `src/content/`，可继续通过 Astro 开发服务器查看效果。

CMS 的每次保存（包括自动保存）都会将 `updated` 自动写为当天日期；该字段在后台仅供查看，无需手动修改。

日常编辑只保留一个普通 `npm run dev` 实例。Agent 需要浏览器验收时，另开空闲端口运行：

```bash
npm run dev:verify -- --port 4402
```

该命令会把 `src/` 复制到系统临时目录，并使用独立的 Astro 缓存；验收中 CMS 的保存和自动保存只写入该副本，不会改动真实 `src/content/`。不要为了验收启动第二个普通 `npm run dev`。

本地 CMS 仅在 Astro 开发服务器中可用，生产构建会移除 `/admin`，不会将管理页面发布到站点。不要把开发服务器或 `/admin/` 暴露到公网。

## 视频进入 Life Notes

共享转写 skill 位于 `~/.claude/skills/bili-audio-transcribe/`。原始 SRT、TXT 和 Markdown 转写默认写入：

```text
content/_inbox/video-transcripts/
```

整理后将正式记录写入 `src/content/<领域>/`，不把原始转写直接作为网页内容发布。

## 部署

这是独立 GitHub Pages 仓库，部署流程位于 `.github/workflows/deploy.yml`。它会在 `main` 更新后执行 `npm ci`、以 `SITE_BASE=/lifenotes/` 构建 Astro，并把 `dist/` 发布到 GitHub Pages。

首次切换框架后，请在 GitHub 仓库的 **Settings → Pages** 中将发布来源设为 **GitHub Actions**，不要使用旧的分支根目录发布方式。

提交到 `main` 后由 GitHub Actions 发布：

```bash
git add .
git commit -m "feat: 更新常识笔记"
git push origin main
```

提交前至少运行一次 `npm run build`。
