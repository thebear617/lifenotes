# lifenotes · 常识笔记

> 个人常识笔记站：把 Obsidian 里的「知识观察型笔记」编译成一个可浏览的多领域知识站。

在线地址（部署后）：https://thebear617.github.io/lifenotes/ （仅 GitHub Pages）

## 这是什么？

一个**多领域的个人常识笔记站**。首页是领域总览仪表盘，每个领域是一块独立的知识域（如「美食」「AI产业」「汽车」）。

笔记本身仍以 **Obsidian markdown** 形式留在你的笔记库（单源），本仓库只存「编译后的站点数据」。

> 编译进站点的页面只有 **领域地图** 与 **QA** 两篇。源笔记里的「术语表 / 来源池 / 转录」保留在 Obsidian，不编译进站点（其中指向它们的 wiki 内链会渲染为纯文本）。

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

> `index.html`、`boards-index.js`、`js/boards/*.js` 均由 `build-notes.py` 生成，**不要手改**；改源笔记后重跑脚本即可。

## 构建

源笔记目录（默认）：`/Users/mokaiche/Documents/notes/03-Resources/知识观察型笔记`

```bash
# 依赖（仅构建期，隔离 venv；站点本身零运行时依赖）
pip install markdown PyYAML

# 编译
python3 scripts/build-notes.py
```

构建脚本会：
1. 遍历源目录下各**领域文件夹**（跳过 `00-` 开头的看板类目录、以及 `EXCLUDE_DOMAINS` 中列出的领域如「无畏契约」）
2. 把存在的 `领域地图.md` 与 `QA.md` 各编译成一页
3. 处理 Obsidian 语法：YAML frontmatter、**callout**（`> [!note]-` 等 → 可折叠卡片）、**wiki 内链**（`[[转录/xxx]]` 等指向未编译页面的链接 → 纯文本）、表格、任务清单 `- [x]`
4. 输出 `js/boards/<id>.js` + 重写 `js/boards-index.js` + 重写 `index.html`

## 如何新增一个领域

1. 在 `scripts/build-notes.py` 的 `DOMAIN_CONFIG` 加一行（含 `id` / `name` / `icon` / `desc` / `accent`）
2. 在源目录建好该领域文件夹（至少包含 `领域地图.md` 与 `QA.md`）
3. 重跑 `python3 scripts/build-notes.py`
4. 提交生成的 `js/` 与 `index.html`

> 全量迁移时，把脚本里的 `PILOT_DOMAINS` 设为 `None` 即可处理源目录下所有领域文件夹（前提都已在 `DOMAIN_CONFIG` 配置；`EXCLUDE_DOMAINS` 里的领域会被跳过）。

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
