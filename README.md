# PatrickStar 的博客

本仓库使用 Hugo 和 PaperMod 构建，并通过 GitHub Actions 发布到 GitHub Pages。

## Windows 本地预览

```powershell
hugo server -D
```

访问 <http://localhost:1313/>。

## 创建文章

```powershell
hugo new content posts/my-new-post.md
```

完成写作后，将文章 Front Matter 中的 `draft` 改为 `false`。

## 发布

将更改推送到 `main` 分支后，GitHub Actions 会自动构建并部署网站。
