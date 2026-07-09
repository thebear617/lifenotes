#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-notes.py — 把「知识观察型笔记」(Obsidian markdown) 编译成 lifenotes 站点数据。

源：SRC_DIR（默认指向 Obsidian 笔记库里的「知识观察型笔记」目录）
输出：js/boards/<id>.js  +  js/boards-index.js  +  index.html

用法：
    python3 scripts/build-notes.py
依赖（仅构建期，隔离 venv）：markdown, PyYAML
    pip install markdown PyYAML

设计：源笔记留在 Obsidian 库（单源），本脚本把 markdown 编译成纯 HTML 站点数据后提交；
站点零运行时依赖。改完笔记后重跑本脚本即可刷新。
"""
import os
import re
import json
import markdown as md
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # lifenotes/
SRC_DIR = "/Users/mokaiche/Documents/notes/03-Resources/知识观察型笔记"
OUT_JS = os.path.join(ROOT, "js")
BOARDS_OUT = os.path.join(OUT_JS, "boards")

# 试点：只处理这三个领域；全量迁移时设为 None（处理源目录下所有领域文件夹）
PILOT_DOMAINS = ["美食", "AI产业", "汽车"]

# 领域展示配置（id 用 ascii，name/icon/desc/accent 自定义）
DOMAIN_CONFIG = {
    "美食":   {"id": "food", "name": "美食",   "icon": "🍜", "desc": "煮饭做菜心得与好吃发现",        "accent": "#e8590c"},
    "AI产业": {"id": "ai",   "name": "AI产业", "icon": "🤖", "desc": "AI 产业链上下游事实与判断",      "accent": "#7048e8"},
    "汽车":   {"id": "auto", "name": "汽车",   "icon": "🚗", "desc": "车型 / 品牌 / 产业科普",          "accent": "#0ca678"},
}

# 不迁移的领域（即使出现在源目录里也跳过）
EXCLUDE_DOMAINS = {"无畏契约"}

# 每个领域编译进站点的页面（文件名, 页面id, 图标, 侧栏标签）
# 注意：转录 / 术语表 / 来源池 不编译（用户要求）
STANDARD_PAGES = [
    ("领域地图", "map", "🗺️", "领域地图"),
    ("QA",       "qa",  "💡", "QA"),
]

MD_EXT = ["tables", "fenced_code", "sane_lists"]


# ---------- helpers ----------
def split_frontmatter(text):
    if text.startswith("---"):
        m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", text, re.DOTALL)
        if m:
            try:
                fm = yaml.safe_load(m.group(1)) or {}
            except Exception:
                fm = {}
            return fm, m.group(2)
    return {}, text


def slugify_filename(name):
    base = re.sub(r"\.md$", "", name, flags=re.I)
    return base.replace("/", "／")


# ---------- Obsidian callout 切分 ----------
CALLOUT_RE = re.compile(r"^>\s*\[!(\w+)\](-)?\s*(.*)$")


def split_segments(text):
    lines = text.split("\n")
    segs = []
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        m = CALLOUT_RE.match(line)
        if m:
            ctype = m.group(1).lower()
            collapsed = m.group(2) is not None
            title = m.group(3).strip()
            j = i + 1
            inner = []
            while j < n and lines[j].startswith(">"):
                inner.append(lines[j][1:].lstrip(" "))
                j += 1
            segs.append(("callout", ctype, collapsed, title, "\n".join(inner)))
            i = j
        else:
            buf = []
            while i < n and not CALLOUT_RE.match(lines[i]):
                buf.append(lines[i])
                i += 1
            segs.append(("text", "\n".join(buf)))
    return segs


WIKILINK_RE = re.compile(r"\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]")


def md_to_html(text, domain_id, page_id_map):
    def wikirepl(mm):
        target = mm.group(1).strip()
        alias = (mm.group(2) or "").strip()
        fname = target.split("/")[-1]
        slug = slugify_filename(fname)
        pid = page_id_map.get(slug)
        label = alias or fname
        if pid:
            return f'<a href="#{domain_id}/{pid}" class="wikilink">{label}</a>'
        return label  # 目标未编译进站点（转录/术语表/来源池等），渲染为纯文本

    segs = split_segments(text)
    out = []
    for seg in segs:
        if seg[0] == "text":
            body = WIKILINK_RE.sub(wikirepl, seg[1])
            out.append(md.markdown(body, extensions=MD_EXT))
        else:
            _, ctype, collapsed, title, inner = seg
            inner2 = WIKILINK_RE.sub(wikirepl, inner)
            inner_html = md.markdown(inner2, extensions=MD_EXT)
            summary = title if title else ctype.capitalize()
            open_attr = "" if collapsed else " open"
            out.append(
                f'<details class="callout callout-{ctype}"{open_attr}>'
                f'<summary>{summary}</summary>'
                f'<div class="callout-body">{inner_html}</div>'
                f'</details>'
            )
    html = "\n".join(out)
    # 任务清单 - [ ] / - [x]
    html = re.sub(r"<li>\[ \] (.*?)</li>",
                  r'<li class="task"><input type="checkbox" disabled> \1</li>', html)
    html = re.sub(r"<li>\[x\] (.*?)</li>",
                  r'<li class="task done"><input type="checkbox" checked disabled> \1</li>', html)
    return html


def first_paragraph(text):
    for line in text.split("\n"):
        s = line.strip()
        if s and not s.startswith("#") and not s.startswith(">") \
           and not s.startswith("|") and not s.startswith("-") and not s.startswith("`"):
            return s[:80]
    return ""


# ---------- 单领域编译 ----------
def build_board(folder_name, folder_path):
    cfg = DOMAIN_CONFIG[folder_name]
    did = cfg["id"]
    content, nav, grid = {}, [], []

    # 标准页面（领域地图 + QA；转录/术语表/来源池 不编译进站点）
    page_id_map = {}
    for fname, pid, icon, label in STANDARD_PAGES:
        fpath = os.path.join(folder_path, fname + ".md")
        if os.path.isfile(fpath):
            raw = open(fpath, encoding="utf-8").read()
            fm, body = split_frontmatter(raw)
            html = md_to_html(body, did, page_id_map)
            content[pid] = {"title": label, "body": html}
            nav.append({"id": pid, "icon": icon, "label": label})
            grid.append({"id": pid, "icon": icon, "title": label,
                         "desc": (first_paragraph(body) or cfg["desc"])[:40]})

    home = {"title": cfg["name"], "desc": cfg["desc"], "gridCards": grid}
    board_obj = {"home": home, "navTree": nav, "content": content}

    os.makedirs(BOARDS_OUT, exist_ok=True)
    js = "window.BOARD_DATA = window.BOARD_DATA || (window.BOARD_DATA = {});\n"
    js += "window.BOARD_DATA[%s] = %s;\n" % (
        json.dumps(did), json.dumps(board_obj, ensure_ascii=False, indent=1))
    with open(os.path.join(BOARDS_OUT, did + ".js"), "w", encoding="utf-8") as f:
        f.write(js)

    return {"id": did, "name": cfg["name"], "icon": cfg["icon"],
            "desc": cfg["desc"], "accent": cfg["accent"], "pages": len(content)}


# ---------- index.html ----------
INDEX_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>常识笔记</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="top-bar">
    <button class="menu-toggle" id="menuToggle" aria-label="切换导航">☰</button>
    <div class="top-bar-left">
      <span class="top-eyebrow" id="topEyebrow">lifenotes</span>
      <h1 class="top-title" id="topTitle">常识笔记</h1>
    </div>
    <nav class="board-switcher" id="boardSwitcher" aria-label="板块切换"></nav>
  </header>
  <div class="layout">
    <nav class="sidebar" id="sidebar" aria-label="章节导航">
      <ul class="nav-tree" id="navTree"></ul>
    </nav>
    <main class="main" id="main">
      <div class="welcome" id="welcome">
        <h2>常识笔记</h2>
        <p class="welcome-desc">常识笔记的知识索引。</p>
        <p class="welcome-hint">← 从顶部板块切换器或下方总览开始浏览</p>
      </div>
      <div class="content-area" id="contentArea" hidden></div>
    </main>
  </div>
  <div class="sidebar-backdrop" id="sidebarBackdrop" hidden></div>

  <script src="js/boards-index.js"></script>
<!--BOARDS-->
  <script src="js/app.js"></script>
</body>
</html>
"""


def write_index(boards):
    scripts = "\n".join(f'  <script src="js/boards/{b["id"]}.js"></script>' for b in boards)
    html = INDEX_TEMPLATE.replace("<!--BOARDS-->", scripts)
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)


def write_boards_index(boards):
    lines = ["/* 自动生成，请勿手改；改源笔记后重跑 scripts/build-notes.py */", "const BOARDS = ["]
    for i, b in enumerate(boards):
        comma = "," if i < len(boards) - 1 else ""
        lines.append("  " + json.dumps(
            {"id": b["id"], "name": b["name"], "icon": b["icon"],
             "desc": b["desc"], "accent": b["accent"]}, ensure_ascii=False) + comma)
    lines.append("];")
    with open(os.path.join(OUT_JS, "boards-index.js"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main():
    os.makedirs(BOARDS_OUT, exist_ok=True)
    if PILOT_DOMAINS:
        domains = PILOT_DOMAINS
    else:
        domains = [d for d in sorted(os.listdir(SRC_DIR))
                   if os.path.isdir(os.path.join(SRC_DIR, d))
                   and not d.startswith(".")
                   and not d.startswith("00-")
                   and d not in EXCLUDE_DOMAINS]
    boards = []
    for d in domains:
        dp = os.path.join(SRC_DIR, d)
        if not os.path.isdir(dp):
            print("跳过（不存在）：", d)
            continue
        if d in EXCLUDE_DOMAINS:
            print("跳过（排除）：", d)
            continue
        if d not in DOMAIN_CONFIG:
            print("跳过（未配置）：", d)
            continue
        b = build_board(d, dp)
        boards.append(b)
        print(f"  ✓ {d} → {b['id']}（{b['pages']} 页）")
    write_boards_index(boards)
    write_index(boards)
    print(f"\n完成：{len(boards)} 个领域，数据输出到 {OUT_JS}")


if __name__ == "__main__":
    main()
