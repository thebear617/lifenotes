# lifenotes · 常识笔记

> 独立的个人常识资料库与静态网站：把仓库内 Markdown 编译成可浏览的多领域知识站。

当前版本：`v0.4.0`

在线地址（部署后）：https://thebear617.github.io/lifenotes/ （仅 GitHub Pages）

## 这是什么？

一个**多领域的个人常识笔记站**。首页是领域总览仪表盘，每个领域是一块独立的知识域（如「美食」「AI产业」「汽车」）。

本仓库同时保存 Markdown 数据源与编译后的站点数据，`content/` 是 Life Notes 的唯一事实源，不依赖其他笔记库。

> 每个领域优先编译 `领域地图.md`，不存在时用 `QA.md` 兜底；`术语表 / 来源池 / 转录` 作为本地资料保留但不直接发布。指向未编译页面的 wiki 内链会渲染为纯文本。

## 信息架构

```
lifenotes 首页（领域总览仪表盘）
├── 🍜 美食     (food)      ← 试点已迁入
├── 🤖 AI产业   (ai)        ← 试点已迁入
├── 🚗 汽车     (auto)      ← 试点已迁入
└── …… 后续任意新增领域
```

- **首页（总览）**：列出所有领域卡片，点击进入
- **进入某领域后**：顶栏切换器可一点换领域；左侧是该领域自己的导航（领域地图 + QA）；面包屑「🏠 首页」回领域首页；点顶栏站名「lifenotes」回总览
- **路由**：URL hash，`#food` 进领域首页，`#food/qa` 直接定位 QA 页，空 hash 为总览

## 文件结构

```
├── content/                 # Life Notes 唯一 Markdown 数据源
│   ├── _inbox/
│   │   └── video-transcripts/ # 新视频转写入口（不直接编译）
│   ├── AI产业/
│   ├── 汽车/
│   └── ...                  # 各领域的领域地图 / QA / 术语表 / 来源池 / 转录
├── index.html              # 入口（顶栏 / 切换器容器 / 侧栏 / 内容区），由构建脚本生成
├── css/
│   └── style.css           # 所有样式（暖橙品牌色 + 侧栏 + 仪表盘 + callout + wikilink）
├── js/
│   ├── boards-index.js     # 领域索引 BOARDS（自动生成，勿手改）
│   ├── boards/
│   │   ├── food.js         # 美食领域数据（自动生成）
│   │   ├── ai.js           # AI产业领域数据（自动生成）
│   │   └── auto.js         # 汽车领域数据（自动生成）
│   └── app.js              # 渲染引擎（总览 / 切换 / 侧栏 / 路由 / 响应式）
└── scripts/
    └── build-notes.py      # 构建脚本：markdown → 站点数据
```

> `index.html`、`boards-index.js`、`js/boards/*.js` 均由 `build-notes.py` 生成，**不要手改**；修改 `content/` 后重跑脚本即可。

## 构建

数据源目录：仓库内 `content/`。

```bash
# 依赖（仅构建期，建议使用隔离 venv；站点本身零运行时依赖）
pip install -r requirements.txt

# 编译
python3 scripts/build-notes.py
```

构建脚本会：
1. 遍历源目录下各**领域文件夹**（跳过 `00-` 开头的看板类目录、以及 `EXCLUDE_DOMAINS` 中列出的领域如「无畏契约」）
2. 优先把领域的 `领域地图.md` 编译为主页面，不存在时用 `QA.md` 兜底
3. 处理 Obsidian 语法：YAML frontmatter、**callout**（`> [!note]-` 等 → 可折叠卡片）、**wiki 内链**（`[[转录/xxx]]` 等指向未编译页面的链接 → 纯文本）、表格、任务清单 `- [x]`
4. 忽略 `_inbox/` 等内部目录
5. 输出 `js/boards/<id>.js` + 重写 `js/boards-index.js` + 重写 `index.html`

## 视频进入 Life Notes

共享转写 skill 位于 `../.workbuddy/skills/bili-audio-transcribe/`。默认把新视频的 `SRT`、`TXT` 和 Markdown 转写写入：

```text
content/_inbox/video-transcripts/
```

整理流程：从 inbox 阅读转写稿，判断领域，将原始资料归档到对应领域的 `转录/`，把提炼后的正式记录写入该领域的 `领域地图.md`，最后运行构建脚本。`_inbox/` 不会直接出现在网站中。

## 如何新增一个领域

1. 在 `scripts/build-notes.py` 的 `DOMAIN_CONFIG` 加一行（含 `id` / `name` / `icon` / `desc` / `accent`）
2. 在 `content/` 下建立领域文件夹（至少包含 `领域地图.md`；也可先用 `QA.md` 兜底）
3. 重跑 `python3 scripts/build-notes.py`
4. 提交生成的 `js/` 与 `index.html`

> `PILOT_DOMAINS = None` 时处理 `content/` 下所有已配置领域；`_` 开头的内部目录和 `EXCLUDE_DOMAINS` 中的领域会被跳过。

## 设计语言

- **主色调**：暖橙（`#c2410c`）+ 深蓝灰侧栏，区别于 reanotes（靛青）/ devnotes（青绿）
- **布局**：顶栏领域切换器 + 左侧固定导航 + 右侧文档内容区
- **Obsidian 语法还原**：callout 可折叠、wiki 内链可跳转（或纯文本）、表格/代码/任务清单正常

## 部署

独立 git 仓库 + GitHub Pages：

```bash
cd lifenotes
git init
git add .
git commit -m "init: 常识笔记站点骨架"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

推送后 GitHub Pages 几秒生效。commit 风格沿用中文 `type: 描述`。

## 许可证

MIT
