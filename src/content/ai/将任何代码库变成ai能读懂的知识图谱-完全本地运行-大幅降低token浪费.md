---
title: "将任何代码库变成AI能读懂的知识图谱！完全本地运行，大幅降低Token浪费"
description: "核心结论：CodeGraph 把任何代码库转成 Agent 可实时查询的 MCP 知识图谱，替代反复 search/read/grep 调用，显著省 token；GitHub 38.1k stars，…"
date: 2026-06-07
category: "开发者工具"
tags: []
---

**来源**：转录/将任何代码库变成AI能读懂的知识图谱 完全本地运行大幅降低Token浪费 / B 站 / UP：于仔

**核心结论**：CodeGraph 把任何代码库转成 Agent 可实时查询的 MCP 知识图谱，替代反复 search/read/grep 调用，显著省 token；GitHub 38.1k stars，已在 VSCode、Excalidraw 等 7 个大项目验证。

**三步使用流程**

| 步骤 | 命令 | 作用 |
|----|----|----|
| 1 | NPM 全局安装 | `npm i -g codenav`（或类似名） |
| 2 | 配置 MCP | `codenav install`（自动给 Claude Code 等 Agent 配 MCP，无手写配置） |
| 3 | 初始化图谱 | 项目内 `codenav init`，构建节点+边的知识图谱 |
| 卸载 | 一行命令 | 干净移除 MCP 集成 |

**实测数据**

| 维度         | 数据                                    |
|--------------|-----------------------------------------|
| GitHub stars | 38.1k                                   |
| 验证项目     | 7 个真实大项目（含 VSCode、Excalidraw） |
| 节省 tokens  | 平均显著（视频未给精确比例）            |
| 速度提升     | 平均显著（视频未给精确倍数）            |

**与现有工作流的连接点**

- Claude Code 用户：可直接 `codenav install` 配 MCP，立刻可用
- OVS / 大型代码库研究：相比手动建文档索引，CodeGraph 一次 init 后 Agent 自动按图索骥
- 配合 Agentic Design Patterns Ch 10 MCP：典型 MCP 落地案例

**写入边界**

- 视频是上手演示，节省 token / 提速的精确数字未给具体比例
- CodeGraph 当前支持的编程语言、增量更新策略、团队协作支持未提及
- 私有部署（"完全本地运行"）是否包含模型推理本地化、还是仅图谱构建本地化，未明确
- 与其他类似项目（aider、Sourcegraph、cursor 等）的横评未在视频中涉及

## 参考资料

1. [原始 B 站视频](https://www.bilibili.com/video/BV1As796BEL5)
