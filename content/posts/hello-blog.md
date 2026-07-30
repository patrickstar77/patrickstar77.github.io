---
title: "你好，博客"
date: 2026-07-30T00:00:00+08:00
draft: false
description: "使用 Hugo、PaperMod 和 GitHub Pages 搭建这个博客。"
tags: ["Hugo", "GitHub Pages"]
categories: ["博客"]
showToc: true
---

这是博客的第一篇文章，也是一次发布链路测试。

## 博客由什么组成

这个站点使用以下技术：

- [Hugo](https://gohugo.io/)：把 Markdown 内容生成为静态网页；
- [PaperMod](https://github.com/adityatelange/hugo-PaperMod)：提供博客主题；
- [GitHub Pages](https://pages.github.com/)：托管生成后的网页；
- GitHub Actions：每次推送后自动构建和部署。

## 代码块

PaperMod 支持语法高亮和一键复制：

```python
def hello(name: str) -> str:
    return f"Hello, {name}!"


print(hello("blog"))
```

## 数学公式

行内公式示例：\(Q^\pi(s,a)\)。

块级公式示例：

$$Q^\pi(s,a)=\mathbb{E}_{\pi}\left[\sum_{t=0}^{\infty}\gamma^t r_t\mid s_0=s,a_0=a\right].$$

## 接下来

后续文章会用于记录论文阅读、实验过程、工程实现和复盘总结。
