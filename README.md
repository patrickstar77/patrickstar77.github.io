# PatrickStar 的博客

本仓库使用 Hugo 和 PaperMod 构建，并通过 GitHub Actions 发布到 GitHub Pages。

## 文章的两种目录形式

Hugo 不要求 Markdown 文件必须直接放在 `content/posts/` 下。以下两种形式都可以识别并发布，而且可以同时存在。

### 单文件文章

适合没有本地图片、视频等附件的文章：

```text
content/
└── posts/
    └── post1.md
```

### 文章包

适合带有图片、视频或其他附件的文章：

```text
content/
└── posts/
    └── post2/
        ├── index.md
        ├── model.png
        ├── result.jpg
        └── demo.mp4
```

这种目录叫作 Hugo 的[叶子内容包（Leaf Bundle）](https://gohugo.io/content-management/page-bundles/)。文章入口必须命名为 `index.md`，不要写成 `_index.md`；`_index.md` 用于栏目等分支页面。

文章包中的资源可以使用相对于 `index.md` 的路径，不需要上传到图床：

```markdown
![模型结构](model.png)

![实验结果](result.jpg)
```

Markdown 没有统一的视频语法。本博客已允许在 Markdown 中使用 HTML，因此 MP4 可以写成：

```html
<video controls preload="metadata" width="100%">
  <source src="demo.mp4" type="video/mp4">
  当前浏览器不支持 HTML5 视频。
</video>
```

建议使用浏览器兼容性较好的 H.264 编码 MP4，并压缩图片和视频。GitHub 普通 Git 仓库不接受超过 100 MiB 的单个文件，而 GitHub Pages 不支持 Git LFS，因此接近或超过该大小的视频应放在视频平台或对象存储中，再在文章中嵌入或链接。具体限制参见 [GitHub 大文件说明](https://docs.github.com/repositories/working-with-files/managing-large-files/about-git-large-file-storage)。

## 手动创建并发布一篇带资源的文章

以下示例在 Windows PowerShell 中创建并发布 `post2`。

### 1. 进入博客仓库

```powershell
cd D:\blog
```

### 2. 创建文章包

```powershell
hugo new content posts/post2/index.md
```

Hugo 会创建 `content/posts/post2/index.md`。将本地资源复制到同一目录，例如：

```powershell
Copy-Item "D:\material\model.png" "content\posts\post2\model.png"
Copy-Item "D:\material\demo.mp4" "content\posts\post2\demo.mp4"
```

也可以直接用文件资源管理器复制。

### 3. 编辑文章信息

打开 `content/posts/post2/index.md`，填写正文并检查文件开头的 Front Matter。例如：

```yaml
---
title: "Post2"
date: 2026-07-30T15:00:00+08:00
draft: false
slug: "post2"
description: "Post2 的内容简介。"
tags: ["学习笔记"]
categories: ["学习笔记"]
showToc: true
---
```

注意：

- 正式发布时必须设置 `draft: false`。
- 本站配置了 `buildFuture: false`，因此 `date` 不能晚于实际发布时间，否则 GitHub Pages 暂时不会生成该文章。
- `slug` 决定文章 URL。上例通常发布为 `/posts/post2/`。
- 不要在文章中使用 `C:\Users\...` 等本地绝对路径。

### 4. 在正文中引用资源

```markdown
## 实验结果

![实验结果](model.png)

## 演示视频

<video controls preload="metadata" width="100%">
  <source src="demo.mp4" type="video/mp4">
  当前浏览器不支持 HTML5 视频。
</video>
```

### 5. 本地预览

```powershell
hugo server -D
```

访问 <http://localhost:1313/>，检查文章、图片和视频。

`-D` 会显示草稿，不能证明草稿可以正式发布。还应执行一次与线上接近的生产构建：

```powershell
hugo --gc --minify
```

构建成功后会生成 `public/`，但该目录已被 `.gitignore` 忽略，不需要提交。

### 6. 检查并提交

```powershell
git status
git add content/posts/post2
git commit -m "Publish post2"
```

只暂存本次文章目录，可以避免误提交无关文件。用下面的命令确认提交内容：

```powershell
git show --stat --oneline HEAD
```

### 7. 推送并等待部署

```powershell
git push origin main
```

推送到 `main` 后，`.github/workflows/hugo.yaml` 会自动使用 Hugo 构建并部署 GitHub Pages。可以在仓库的 **Actions** 页面查看 `Deploy Hugo site to Pages` 是否成功：

<https://github.com/patrickstar77/patrickstar77.github.io/actions>

部署完成后访问：

<https://patrickstar77.github.io/posts/post2/>

如果页面没有出现，依次检查：

1. `draft` 是否为 `false`。
2. `date` 是否设置成了未来时间。
3. 文章入口是否为 `content/posts/post2/index.md`。
4. 本地执行 `hugo --gc --minify` 是否报错。
5. GitHub Actions 的部署任务是否成功。

## 创建不带资源的文章

如果文章只有 Markdown，也可以继续直接创建在 `posts` 目录下：

```powershell
hugo new content posts/my-new-post.md
```

完成写作后，将文章 Front Matter 中的 `draft` 改为 `false`。

## 评论系统

文章评论使用 [Giscus](https://giscus.app/zh-CN)，数据保存在本仓库的
GitHub Discussions 中。访客使用 GitHub 登录后，可以发表评论、表情反应和线程回复。
