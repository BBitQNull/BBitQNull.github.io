---
title: Astro配置&npm问题排查
description: 配置Astro使其可以渲染md的LaTeX数学公式&npm包下载问题的排查
pubDate: 2025-07-02
---

### 问题描述

#### Astro的LaTeX公式渲染问题

发现网页中LaTeX公式没有正常渲染出来。怀疑是缺少对应的渲染引擎，查找资料得知可以通过安装扩展实现正确渲染。

```bash
npm install remark-math rehype-katex
```

在astro.config.mjs文件中引入包

```javascript
import remarkMath from'remark - math';
import rehypeKatex from'rehype - katex';
```

在export default defineConfig中

```javascript
remarkPlugins: [remarkMath],
rehypePlugins: [rehypeKatex]
```

在BaseLayout.astro中引入Katex CSS

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" integrity="sha384-vKruj+a13U8yHIkAyGgK1J3ArTLzrFGBbBc0t2KnfUzFhCaX8kYytkWiVjV6oSYd" crossorigin="anonymous">
```

#### npm包安装问题

然后发现网站构建出错，原因是找不到包，然后意识到我在～目录下使用的命令

```bash
npm install
```

此时模块没有被下载到项目文件的node_modules中，也没有在项目文件的package.json中，导致mjs文件找不到要引入的包

于是，在～目录下，卸载包，删除残存目录

```bash
npm uninstall remark-math rehype-katex
rm -rf node_modules
rm -rf package.json
rm -rf package-lock.json
```

切换到项目目录后，重新执行命令

```bash
npm install remark-math rehype-katex
```

报错

```bash
npm error Cannot read properties of null (reading 'matches')
```

表示代码尝试访问一个 `null` 对象的 `matches` 属性，一般是包损坏，packag.json配置问题或依赖版本问题。

使用pnpm进行安装，可以处理更加复杂的依赖问题

```bash
pnpm install remark-math rehype-katex
```

pnpm警告：

```bash
 WARN  Issues with peer dependencies found
.
└─┬ @astrojs/tailwind 6.0.0
  └── ✕ unmet peer tailwindcss@^3.0.24: found 4.0.9
```

这告诉我们对等依赖项可能有问题，`@astrojs/tailwind 6.0.0`需要`tailwindcss@^3.0.24`但是只找到`4.0.9`版本

只要项目正常我们可以忽略这条警告，但仍应记得项目是存在风险的

#### 公式渲染问题（再）

发现公式能正常显示一部分，但仍然错乱。但是能发现LaTeX公式语法已经被正确识别，应该是渲染引擎配置成功，显示问题应该出在html+CSS。

排查网站前端数据，发现资源加载错误

```
Cannot load stylesheet https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css. Failed integrity metadata check. Content length: 23112, Expected content length: 3454, Expected metadata: sha384-vKruj+a13U8yHIkAyGgK1J3ArTLzrFGBbBc0t2KnfUzFhCaX8kYytkWiVjV6oSYd
```

表明浏览器在加载 Katex CSS 时，发现实际内容与预期的完整性哈希值（`integrity`属性）不匹配，可能是我使用了旧版本的哈希值。

前往[KaTeX官方CDN](https://www.jsdelivr.com/package/npm/katex)获取最新static版本的HTML+SRI并修改BaseLayout.astro

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" integrity="sha256-GQlRJzV+1tKf4KY6awAMkTqJ9/GWO3Zd03Fel8mFLnU=" crossorigin="anonymous">
```

#### KaTeX公式渲染问题

要注意KaTex公式渲染时，对{}的界定更加敏感，所以秉持能加则加原则，分清层次

以下KaTeX渲染出错

```latex
\frac{\partial{E_\hat{\beta}}}
```

以下正确

```latex
\frac{\partial{E_{\hat{\beta}}}}
```