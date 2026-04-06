---
title: Obsidian 安装 Terminal 插件报错的解决方法
date: 2026-03-03
tags:
  - Obsidian
  - 插件
  - 问题排查
categories:
  - 工具折腾
---

## 问题描述

在 Obsidian 中安装 Terminal 插件后，反复弹出以下报错：

> **Terminal resizer exited unexpectedly: 9009**

![报错截图](/img/posts/obsidian-terminal-9009/error-9009-popup.png)

## 排查过程

根据 Deepseek 的提示，使用 `Ctrl + Shift + I` 打开 Obsidian 开发者控制台，查看详细的错误日志，发现**根本原因是 Python 环境问题**。

![开发者控制台日志](/img/posts/obsidian-terminal-9009/devtools-log.png)

<!-- more -->

## 解决方案

1. **卸载现有的 Python**，清理残留环境
2. 按照 Terminal 插件仓库的官方文档，**重新安装 Python 及其他推荐的依赖项**

![仓库安装步骤](/img/posts/obsidian-terminal-9009/repo-install-steps.png)

按照上述步骤操作后，问题完美解决 ✅

![修复成功](/img/posts/obsidian-terminal-9009/fixed-success.png)

## 小结

如果你在 Obsidian 中遇到 Terminal 插件的 `9009` 错误，大概率是本地 Python 环境配置有问题。建议：

- 善用 `Ctrl + Shift + I` 打开开发者工具查看具体报错
- 严格按照插件仓库的官方文档安装所需依赖
- 遇到环境类问题时，**干净卸载后重装**往往是最高效的解决方式
