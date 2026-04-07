---
title: Obsidian 多个知识库如何共享一套插件文件夹
date: 2026-03-04 08:22:34
tags:
  - Obsidian
  - Windows
  - 插件
categories:
  - Obsidian
slug: obsidian-shared-plugin-folder
permalink: /2026/03/04/obsidian-shared-plugin-folder/
---

![Obsidian 多个知识库共享插件文件夹示意图](/img/posts/obsidian-shared-plugin-folder/shared-plugin-folder.png)

如果你同时维护多个 Obsidian 知识库，很容易遇到一个重复问题：每个知识库都会各自生成一份 `.obsidian/plugins` 目录，插件需要分别安装和更新，维护成本很高。

在 Windows 下，一个比较直接的方案是使用符号链接（Symbolic Link），让副知识库的插件目录直接指向主知识库的插件目录，这样两边就可以共用同一套插件文件。

## 当前目录示例

- 主知识库插件目录：`F:\Raymond_Obsidian\.obsidian\plugins`
- 副知识库插件目录：`G:\Hexo_Blog_Raymond\source\_posts\.obsidian\plugins`

## 操作步骤

1. 先删除副知识库中的 `.obsidian/plugins` 文件夹，只保留主知识库的插件目录。
2. 以管理员身份打开 `CMD`。
3. 执行下面这条命令，为副知识库创建一个目录符号链接：

```cmd
mklink /D "G:\Hexo_Blog_Raymond\source\_posts\.obsidian\plugins" "F:\Raymond_Obsidian\.obsidian\plugins"
```

## 执行结果

命令创建成功后，副知识库中的 `.obsidian/plugins` 实际上会指向主知识库的插件目录。此后你在主知识库里安装、删除或更新插件，副知识库也会同步使用同一套插件文件。

## 注意事项

- `mklink` 需要在管理员权限下执行。
- 共享的是插件文件夹，不代表所有 Obsidian 配置都会自动同步。
- 如果两个知识库对插件版本或配置要求差异较大，这种方式可能并不适合。
