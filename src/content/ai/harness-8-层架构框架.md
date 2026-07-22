---
title: "Harness 8 层架构框架"
date: 2026-06-09
order: 1
category: "Agent架构"
source: "迁移自旧版领域地图"
tags: []
---

**起源**：2026-06-09 凌晨讨论 OpenCode 时把 harness 解构成多层系统，作为后续研究 agent 架构的起点。Harness 框架不是某一家的事实标准，而是把这 8 个相对独立的层组织起来的整体观。

**核心定义**：Harness = 把 LLM 包成可执行 agent 运行时的那层壳，由 8 个相对独立的层组合而成：

    Harness (整个 agentic runtime)
    │
    ├── 1. 展示/交互层 (Presentation)
    │   ├── TUI（OpenCode 风格，全屏面板 + 快捷键）
    │   ├── CLI（Claude Code 风格，流式文本 + slash 命令）
    │   └── IDE 插件（Continue.dev 风格，VSCode 嵌入）
    │
    ├── 2. Agent 循环/编排层 (Agent Loop)
    │   ├── 多轮对话状态机
    │   ├── 决定何时调 LLM、何时执行工具
    │   └── 流式响应处理 / 中断 / 并发
    │
    ├── 3. 工具调用层 (Tool Calling)
    │   ├── 工具注册表（Read/Write/Bash/Grep/Glob/MCP...）
    │   ├── 工具 schema 定义 + 校验
    │   ├── 工具调用解析 + 执行
    │   └── 权限校验
    │
    ├── 4. 上下文管理层 (Context Management)
    │   ├── 对话历史压缩 / 摘要
    │   ├── 工具结果截断
    │   ├── 文件引用懒加载
    │   ├── 跨会话记忆（CLAUDE.md / rules / skills）
    │   └── 上下文窗口压力管理
    │
    ├── 5. 模型接口层 (Model Interface)
    │   ├── API 客户端（Anthropic / OpenAI / Ollama SDK）
    │   ├── Token 计数 + 流式响应
    │   ├── 错误重试 / 降级
    │   └── "5h 窗口 / 速率限制"在这一层被强制执行
    │
    ├── 6. 权限/安全层 (Permission/Security)
    │   ├── 文件访问白名单
    │   ├── 命令 sandbox（Codex 强 / Claude Code 中 / OpenCode 弱）
    │   └── 危险操作二次确认
    │
    ├── 7. 会话/持久化层 (Session/Persistence)
    │   ├── 会话 resume（`claude --resume`）
    │   ├── 状态保存
    │   └── 跨会话索引
    │
    └── 8. 配置层 (Configuration)
    ├── settings.json / config.toml
    ├── rules / skills 加载
    ├── 项目级 vs 用户级
    └── plugin / extension

**各层对 benchmark 公平性的影响**：

| 层             | 影响      | 说明                                   |
|----------------|-----------|----------------------------------------|
| 1 展示层 (TUI) | ❌ 无影响 | 可 headless 跑                         |
| 2 Agent Loop   | ⚠️ 高影响 | 循环策略、错误恢复、最大迭代次数       |
| 3 工具调用层   | ⚠️ 高影响 | 工具 schema 不同 → 模型行为不同        |
| 4 上下文管理   | ⚠️ 高影响 | 截断策略、文件缓存、压缩时机           |
| 5 模型接口层   | ⚠️ 高影响 | retry 策略、错误吞掉还是抛、token 计数 |
| 6 权限层       | ✅ 低影响 | benchmark 里通常一致                   |
| 7 会话层       | ✅ 低影响 | —                                      |
| 8 配置层       | ⚠️ 中影响 | rules / skills 会改变行为              |

**关键判断**：公平性的关键在 **2/3/4/5** 这 4 层，OpenCode / Aider 这类 model-agnostic harness 的价值就在把这 4 层做成统一 shell。

**三大 harness 的核心差异点**：

| Harness | 核心差异化在哪些层 |
|----|----|
| **Claude Code** | 4 上下文（CLAUDE.md / rules / skills 体系）+ 2 agent loop 调优（为 Claude 优化） |
| **Codex CLI** | 6 安全层（强 sandbox）+ 5 多模型路由（OpenAI + 本地） |
| **OpenCode** | 1 入口（TUI 体验好）+ 5 model-agnostic（接任何 provider） |

**注意**：TUI 不是它们的差异化点（只是冰山一角）。真正的差异化在架构层的不同选择。

**关键澄清**：

- TUI ⊂ Harness（是子概念），但 TUI 不是核心（只是入口）
- 公平的关键在 2/3/4/5（agent loop / 工具 / 上下文 / 模型接口）
- OpenCode 公平在 2/3/4/5，TUI 差异不构成公平性问题
- 车类比：TUI ≈ 中控大屏（看到），harness ≈ 动力+操控+安全+电气架构（实际决定怎么跑）。漂亮 TUI + 烂里子 ≠ 好 harness

**后续研究方向**：

- 横向对比 Claude Code / Codex / OpenCode 在 2/3/4/5 层各自的实现细节
- 调研 Aider polyglot benchmark、OpenHands、SWE-agent 的 harness 8 层实现
- 关注"5h 窗口 / 速率限制"在第 5 层的具体执行机制
- 跟踪 Symphony 这类任务编排层（介于 2 Agent Loop 与上层 Agent 协作之间）的进展
- 沉淀各层在生产环境的踩坑笔记到各 domain 笔记
