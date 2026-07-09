# 曾璇个人作品集网站

这是一个 React + Vite 单页作品集网站，适合作为运营 / 营销 / AI 内容策划方向的线上作品集。

## 手动调整内容

### 在网页上直接改

打开网站后，右下角有一个编辑工具条：

- 点 `开始编辑`
- 直接点击页面上的文字修改
- 项目图片可以在图片下方的 `图片路径` 输入框里改
- 点 `保存`

保存后的内容会存到当前浏览器里。也就是说，同一台电脑、同一个浏览器再次打开会保留修改；换电脑不会自动同步。

如果改乱了，可以点 `恢复默认`。

### 在代码里改

主要改这个文件：

```text
src/content.js
```

你可以在里面修改：

- 姓名、联系方式、城市、求职方向
- 首页大标题和介绍文案
- 项目数据
- 工作经历
- 精选项目标题、图片、说明
- 个人优势卡片

项目图片放在：

```text
public/assets/
```

这次新增的作品分类图片主要在：

```text
public/assets/kikna/
public/assets/portfolio-pages/
```

如果要换某个项目图，把新图片放进 `public/assets/`，然后在 `src/content.js` 里修改对应的 `image` 路径，例如：

```js
image: "/assets/my-new-project.png"
```

如果要调整颜色、间距、卡片大小、版心宽度，改这个文件：

```text
src/App.css
```

## 重新生成作品图片

如果之后你替换了 `D:/曾璇 作品集.pdf` 或 `D:/基克纳工作` 里的素材，可以运行：

```bash
python scripts/generate_portfolio_assets.py
```

它会重新生成网页用的作品集页面图和基克纳项目图。

## 本地预览

安装依赖后运行：

```bash
npm install
npm run dev
```

然后打开浏览器访问：

```text
http://127.0.0.1:5173/
```

当前这台电脑没有全局 npm，所以我是用内置 Node 和 pnpm 入口安装并启动的；换到普通电脑上通常直接用上面的 npm 命令就可以。

## 上线到互联网

可以上线。上线后别人换一台电脑、手机或平板，只要能联网，就可以通过网址访问。

推荐方式：

- Vercel：适合 React/Vite 项目，连接 GitHub 后自动部署。
- Netlify：也适合静态作品集，拖拽 `dist` 或连接 GitHub 都可以。
- GitHub Pages：当前项目已经带好 Pages 部署配置，当前仓库名按 `mine` 配置。

上线前先构建：

```bash
npm run build
```

构建结果会生成在：

```text
dist/
```

把 `dist/` 部署到静态网站托管平台即可。后续如果需要绑定自己的域名，也可以在部署平台里配置。

### GitHub Pages

如果仓库名是：

```text
mine
```

部署后的地址会是：

```text
https://<你的 GitHub 用户名>.github.io/mine/
```

当前项目已经包含：

- `vite.config.js` 里的 Pages `base` 配置
- `.github/workflows/deploy.yml` 自动部署工作流

只要代码推到 GitHub 仓库的 `main` 分支，并在仓库设置里启用 Pages（Source 选择 GitHub Actions），后续每次 push 都会自动更新网站。
