# lifenotes · 常识笔记

> 基于 Astro 的个人常识资料库与静态网站。

当前版本：`v0.6.0`

在线地址（部署后）：<https://thebear617.github.io/lifenotes/>

## 内容与结构

正式发布内容位于 `src/content/`，按领域拆分为 Content Collections；`content/_inbox/video-transcripts/` 保存尚未整理的视频转写，不会直接发布。

```text
src/
├── content/          # 正式 Markdown 内容
├── data/boards.js    # 领域导航配置
├── layouts/          # 页面布局
├── pages/            # 首页、领域页、详情页
└── styles/           # 全站样式
content/
└── _inbox/           # 原始转写与待整理资料
```

当前领域包括：AI产业、动植物、历史、宠物、手机、汽车、生活、社会、美食、酒店、金融-经济。

## 开发与构建

```bash
npm install
npm run dev       # http://localhost:4321/
npm run build
npm run preview
```

GitHub Pages 子路径构建：

```bash
SITE_BASE=/lifenotes/ npm run build
```

Astro 会从 `src/content/` 读取 Markdown 并生成静态页面。新增内容时，在对应领域目录添加 Markdown 文件，填写 `title`、`order`、`category` 等 frontmatter，然后重新构建即可。

## 视频进入 Life Notes

共享转写 skill 位于 `../.workbuddy/skills/bili-audio-transcribe/`。原始 SRT、TXT 和 Markdown 转写默认写入：

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
