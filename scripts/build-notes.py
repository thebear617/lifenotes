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

# None = 全量迁移（处理源目录下除 EXCLUDE_DOMAINS 外的所有领域文件夹）
PILOT_DOMAINS = None

# 领域展示配置（id 用 ascii，name/icon/desc/accent 自定义）
# 注：历史 / 社会 当前源里没有「领域地图」「QA」页，编译后内容为空（板块仍保留，符合全量迁移）
DOMAIN_CONFIG = {
    "美食":       {"id": "food",     "name": "美食",       "icon": "🍜", "desc": "煮饭做菜心得与好吃发现",            "accent": "#e8590c"},
    "AI产业":     {"id": "ai",       "name": "AI产业",     "icon": "🤖", "desc": "AI 产业链上下游事实与判断",          "accent": "#7048e8"},
    "汽车":       {"id": "auto",     "name": "汽车",       "icon": "🚗", "desc": "车型 / 品牌 / 产业科普",              "accent": "#0ca678"},
    "宠物":       {"id": "pet",      "name": "宠物",       "icon": "🐾", "desc": "猫狗等宠物养护与常识",                "accent": "#e64980"},
    "生活":       {"id": "life",     "name": "生活",       "icon": "🧺", "desc": "过日子用得上的生活常识",              "accent": "#f08c00"},
    "社会":       {"id": "society",  "name": "社会",       "icon": "🌐", "desc": "社会现象与公共议题的常识梳理",        "accent": "#1c7ed6"},
    "金融-经济":  {"id": "finance",  "name": "金融-经济",  "icon": "💰", "desc": "理财与宏观经济的常识梳理",            "accent": "#2f9e44"},
    "动植物":     {"id": "biology",  "name": "动植物",     "icon": "🌿", "desc": "动物与植物的基础科普",                "accent": "#0b7285"},
    "历史":       {"id": "history",  "name": "历史",       "icon": "🏛️", "desc": "历史脉络与人物事件的常识",            "accent": "#9c36b5"},
}

# 不迁移的领域（即使出现在源目录里也跳过）
EXCLUDE_DOMAINS = {"无畏契约"}

# 主内容页候选：优先「领域地图」，无则「QA」兜底（避免无 map 领域变空板块）
# 注意：转录 / 术语表 / 来源池 不编译（用户要求）；QA 不再作为独立页
MAIN_PAGE_CANDIDATES = [
    ("领域地图", "map", "🗺️", "领域地图"),
    ("QA",       "map", "💡", "笔记"),
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


def make_wikilink_repl(domain_id, page_id_map):
    def repl(mm):
        target = mm.group(1).strip()
        alias = (mm.group(2) or "").strip()
        fname = target.split("/")[-1]
        slug = slugify_filename(fname)
        pid = page_id_map.get(slug)
        label = alias or fname
        if pid:
            return f'<a href="#{domain_id}/{pid}" class="wikilink">{label}</a>'
        return label  # 目标未编译进站点（转录/术语表/来源池等），渲染为纯文本
    return repl


def md_to_html(text, domain_id, page_id_map):
    repl = make_wikilink_repl(domain_id, page_id_map)
    segs = split_segments(text)
    out = []
    for seg in segs:
        if seg[0] == "text":
            body = WIKILINK_RE.sub(repl, seg[1])
            out.append(md.markdown(body, extensions=MD_EXT))
        else:
            _, ctype, collapsed, title, inner = seg
            inner2 = WIKILINK_RE.sub(repl, inner)
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


H_RE = re.compile(r"^(#{2,4})\s+(.*?)\s*$")
CAT_RE = re.compile(r"/\s*([^/:：\n]+?)[:：]")
DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")


def clean_callout_title(title, date, cat):
    t = title
    if date:
        t = t.replace(date, "")
    if cat:
        t = re.sub(r"/\s*" + re.escape(cat) + r"\s*[:：]?", "", t)
    t = re.sub(r"\s*·\s*$", "", t).strip()
    t = t.strip(" ·-—")
    return t or "未命名记录"


def extract_block_title(text):
    for line in text.split("\n"):
        s = line.strip()
        if s.startswith("##"):
            return re.sub(r"^#+\s*", "", s).strip()
    for line in text.split("\n"):
        s = line.strip()
        if s and not s.startswith("#") and not s.startswith(">") \
           and not s.startswith("|") and not s.startswith("-") and not s.startswith("`"):
            return s[:40]
    return "未命名"


def parse_map_records(body, domain_id, page_id_map):
    """把领域地图正文解析成结构化记录列表（分类视图 / 时间轴视图共用）。

    每条记录 = callout 折叠块，或按 H2/H3 切分的连续文本块。
    - category：callout 标题里的 /小分类: 优先；否则所属 ### 小标题；都没有归「未分类」
    - date：块内首个 YYYY-MM-DD；无则 null（时间轴归末尾「未标注日期」组）
    """
    repl = make_wikilink_repl(domain_id, page_id_map)
    lines = body.split("\n")
    n = len(lines)
    records = []
    cur_h2 = None
    cur_h3 = None
    buf = []
    cal = None

    def flush_text():
        nonlocal buf
        if not buf:
            return
        text = "\n".join(buf).strip()
        buf = []
        if not text:
            return
        cat = cur_h3 or "未分类"
        dm = DATE_RE.search(text)
        date = dm.group(1) if dm else None
        title = extract_block_title(text)
        html = md.markdown(WIKILINK_RE.sub(repl, text), extensions=MD_EXT)
        records.append({"date": date, "category": cat, "title": title, "html": html})

    def flush_callout():
        nonlocal cal
        if not cal:
            return
        ctype, collapsed, ctitle, inner = cal
        cal = None
        dm = DATE_RE.search(ctitle)
        date = dm.group(1) if dm else None
        cm = CAT_RE.search(ctitle)
        cat = cm.group(1).strip() if cm else (cur_h3 or "未分类")
        title = clean_callout_title(ctitle, date, cm.group(1).strip() if cm else None)
        inner_text = "\n".join(inner)
        inner_html = md.markdown(WIKILINK_RE.sub(repl, inner_text), extensions=MD_EXT)
        open_attr = "" if collapsed else " open"
        html = (f'<details class="callout callout-{ctype}"{open_attr}>'
                f'<summary>{title}</summary>'
                f'<div class="callout-body">{inner_html}</div></details>')
        records.append({"date": date, "category": cat, "title": title, "html": html})

    i = 0
    while i < n:
        line = lines[i]
        m = CALLOUT_RE.match(line)
        if m:
            flush_text()
            flush_callout()
            ctype = m.group(1).lower()
            collapsed = m.group(2) is not None
            ctitle = m.group(3).strip()
            cal = (ctype, collapsed, ctitle, [])
            i += 1
            continue
        if cal is not None and line.startswith(">"):
            cal[3].append(line[1:].lstrip(" "))
            i += 1
            continue
        hm = H_RE.match(line)
        if hm:
            flush_text()
            flush_callout()
            level = len(hm.group(1))
            htext = hm.group(2).strip()
            if level == 2:
                cur_h2 = htext
                cur_h3 = None
            elif level == 3:
                cur_h3 = htext
            buf = [line]
            i += 1
            continue
        buf.append(line)
        i += 1
    flush_text()
    flush_callout()
    return records


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

    # 主内容页：优先「领域地图」，无则用「QA」兜底（标签「笔记」）
    page_id_map = {}
    chosen = None
    for fname, pid, icon, label in MAIN_PAGE_CANDIDATES:
        fpath = os.path.join(folder_path, fname + ".md")
        if os.path.isfile(fpath):
            chosen = (fpath, pid, icon, label)
            break
    if chosen:
        fpath, pid, icon, label = chosen
        raw = open(fpath, encoding="utf-8").read()
        fm, body = split_frontmatter(raw)
        html = md_to_html(body, did, page_id_map)
        records = parse_map_records(body, did, page_id_map)
        content[pid] = {"title": label, "body": html, "records": records}
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
