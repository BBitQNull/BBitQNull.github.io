---
title: Astro+github搭建个人博客
description: Macos环境使用Astro+github Actions搭建个人博客
pubDate: 2025-06-29
---

### 安装nvm

```bash
brew install --cask nvm
```

### 安装node.js

#### nvm换源

编辑 .zshrc 文件

```bash
export NVM_NODEJS_ORG_MIRROR=https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/
source ~/.zshrc
```

#### 搜索node版本

```bash
nvm ls-remote
```

#### 选择偶数版本

Astro要求偶数版本node.js，根据搜索结果选择 v22.16.0 LTS 版本

```bash
nvm install v22.16.0
```

#### 验证安装结果

```bash
node -v
npm -v
```

正常输出版本号则安装成功

### 安装nrm

nrm是一个npm源管理器，可以方便换源及测速

```bash
npm install -g nrm
```

#### 查看可用源

```bash
nrm ls
```

#### 测速

```bash
nrm test
```

#### 切换源

```bash
nrm use taobao
```

### 安装pnpm

pnpm是npm的改进，旨在提高包管理效率提升体验，相比npm最重要的是可以自动处理包依赖，解决许多环境依赖报错

```bash
npm install pnpm -g
```

### 使用主题安装Astro

可以在Astro官网挑选心仪的主题模版，通过其github用户名和仓库名以主题模版开始新的Astro项目

```bash
npm create astro@latest -- --template <github-username>/<github-repo>
```

根据引导进行设置

- 选择项目目录
- 是否安装依赖（可能安装失败）
- 是否初始化本地仓库（一般选择“是”）

等待项目创建完成

#### 安装依赖（若自动安装失败）

```bash
cd ./my_blog
pnpm i
```

### 在github新建仓库

```bash
仓库名:<用户名>.github.io
public
```

仓库-setting-pages页面中-build and deployment-source选择github actions-save

### 本地仓库设置

```bash
git remote add origin git@github.com：<username>/<repository name>.git
```

### 项目文件配置

```bash
astro.config.mjs文件中编辑site及base，定位到github仓库的web代码地址，如：https://<用户名>.github.io
```

项目根目录创建./github/workflow/deploy.yml目录，文件内容写入：

```yaml
name: Deploy to GitHub Pages

on:
  # 每次推送到 `main` 分支时触发这个“工作流程”
  # 如果你使用了别的分支名，请按需将 `main` 替换成你的分支名
  push:
    branches: [ main ]
  # 允许你在 GitHub 上的 Actions 标签中手动触发此“工作流程”
  workflow_dispatch:

# 允许 job 克隆 repo 并创建一个 page deployment
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3
        # with:
          # path: . # 存储库中 Astro 项目的根位置。（可选）
          # node-version: 20 # 用于构建站点的特定 Node.js 版本，默认为 20。（可选）
          # package-manager: pnpm@latest # 应使用哪个 Node.js 包管理器来安装依赖项和构建站点。会根据存储库中的 lockfile 自动检测。（可选）

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 同步远程仓库

```bash
git push -u origin main
```

等待一段时间后，访问

```bash
https//username.github.io
```

搭建成功

之后可以在项目文件中进行更多设置和自定义，更改显示内容和样式等，根据主题github说明创建.md文件撰写博文