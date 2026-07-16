# AGENTS.md

## 项目定位

`lifenotes` 是独立的常识资料库与静态网站。数据源、构建脚本和站点产物全部保存在本仓库，不依赖 Obsidian 或其他笔记库。

- 唯一事实源：`content/`
- 构建命令：`python3 scripts/build-notes.py`
- 站点无运行时依赖；构建期需要 `markdown` 与 `PyYAML`
- 本地预览：`python3 -m http.server 8000`

## 文件边界

- `scripts/build-notes.py`：Markdown 到站点数据的唯一构建入口。
- `content/<领域>/`：领域地图、QA、术语表、来源池和历史转录的独立数据源。
- `content/_inbox/video-transcripts/`：新视频的待整理转写，不直接编译。
- `css/style.css`、`js/app.js`：可手工维护的样式与渲染引擎。
- `index.html`、`js/boards-index.js`、`js/boards/*.js`：构建产物，不要手改。
- 每次 Git 操作都在 `lifenotes/` 内执行；提交使用中文 `type: 描述`。

## 视频转写 skill

处理 B 站、小红书或抖音视频的音频提取、字幕生成、转写稿整理时，先读取并遵循：

`/Users/mokaiche/Documents/htmls/.workbuddy/skills/bili-audio-transcribe/SKILL.md`

必须调用 WorkBuddy 的共享 wrapper：

```bash
/Users/mokaiche/Documents/htmls/.workbuddy/skills/bili-audio-transcribe/scripts/bili-trans "<url-or-bv>" \
  --proxy http://127.0.0.1:7897 \
  --backend mlx \
  --model large-v3-turbo
```

默认产物写入 `content/_inbox/video-transcripts/`。实际 MLX 转写需要在 Codex sandbox 外运行，以访问 Apple Silicon Metal。

转写后先判断领域，把原始资料归档到 `content/<领域>/转录/`，再把提炼后的正式记录写入 `content/<领域>/领域地图.md`，运行构建脚本并检查生成差异。不要写回旧 Obsidian 笔记库。
