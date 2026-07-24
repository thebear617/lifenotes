---
title: "五分钟带你看懂黑客松冠军的 Claude Code 配置"
description: "仓库核心文件夹"
date: 2026-06-13
category: "开发者工具"
tags: []
---

**来源**：五分钟带你看懂黑客松冠军的 Claude Code 配置；UP：奇思妙想CYC **核心结论**：Anthropic 官方黑客松冠军将 10 个月 Claude Code 实战配置全开源（18万+ Star），包含 48 Agent + 182 Skill + 68 Command，是目前最完整的 Claude Code 最佳实践仓库。

**仓库核心文件夹**

| 文件夹   | 作用                                                       |
|----------|------------------------------------------------------------|
| Skills   | 技能定义（Markdown），含触发条件、核心规则、禁止项、流程   |
| Agents   | 多角色定义（如 Code Reviewer），含身份、工具权限、审查流程 |
| Commands | 自定义斜杠命令（如 /plan）                                 |
| Rules    | 按语言分类的编码规则（C++/Java/Python 等）                 |
| Hooks    | 触发器（20+ 个），如 pre-compact、session-start            |
| MCP      | MCP 配置                                                   |

**Skills 写法框架（可复用）**

1.  名字 + 描述 + 何时启用
2.  核心规则（先给例子再给规范）
3.  禁止项（不只告诉模型做什么，还要告诉它不能做什么）
4.  流程规范（完整步骤）
5.  按文章类型分规范
6.  可嵌套其他 Skill

**写入边界**

- 视频是仓库导览性质，具体 Skill/Agent 内容需去 GitHub 原仓库查看
- "18万 Star"是视频发布时数据，可能持续增长
- 仓库是 Claude Code 生态，与 Hermes/OpenCode 等其他 harness 的 Skill 体系有差异但思路相通
- UP 主计划做三期系列，本期是第一篇（仓库总览），后续还有进阶指南和详细指南

## 参考资料

1. [原始 B 站视频](https://www.bilibili.com/video/BV1XrEZ6NEuD)
