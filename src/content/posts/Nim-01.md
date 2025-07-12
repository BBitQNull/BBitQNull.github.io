---
title: Nim-01
description: 简介nim的安装与nimble包管理器
pubDate: 2025-07-12
---

## 安装choosenim

可以安装choosenim这个版本控制工具，以便与在多版本切换。

```bash
curl https://nim-lang.org/choosenim/init.sh -sSf | sh
```

版本切换。

```bash
choosenim stable # 安装最新稳定版
choosenim devel # 安装开发版
choosenim 1.6.10   # 安装指定版本
choosenim list # 查看已安装版本
choosenim which  # 显示当前使用的版本
choosenim uninstall <版本>  # 卸载指定版本
```

版本更新。

```bash
choosenim update # 更新nim
choosenim update self # 更新choosenim
```

## 安装nim

不使用版本切换可以使用包管理器直接安装nim，其中nimble会自动下载。

nimble是官方包管理器。

macos：

```bash
brew install nim
```

版本更新。

```bash
brew update       # 更新 Homebrew 自身
brew upgrade nim  # 更新 Nim 和 Nimble（版本自动适配nim）
# 单独更新nimble
nimble update     # 更新 Nimble 包列表
nimble upgrade    # 更新所有已安装的 Nimble 包
nimble update self  # 更新 Nimble 自身
```

验证安装。

```bash
nim -v       # 查看 Nim 版本
nimble -v    # 查看 Nimble 版本
```

## nimble包管理

### 核心概念

#### 包

Nim 生态中的代码库或应用，通常包含 .nim 源码文件、配置文件和依赖声明。

每个包通过唯一的名称和版本标识（如 jester@0.17.0）。

#### 依赖管理

每个包通过 .nimble 文件声明依赖。

nimble自动解析依赖树，确保兼容。

#### 官方包索引

默认从 [nimble.directory](https://nimble.directory/) 获取包信息。

##### 镜像加速配置

```bash
cd ~/.nimble
touch config.nims
vim config.nims
```

```bash
# ~/.nimble/config.nims
when defined(nimble):
  # 设置 SOCKS5 代理
  const httpProxy = "socks5h://127.0.0.1:1080"  # 替换为你的代理端口
  const httpsProxy = "socks5h://127.0.0.1:1080"
# 或
when defined(nimble):
  const httpProxy = "http://127.0.0.1:7890"  # 你的代理地址
  const httpsProxy = "http://127.0.0.1:7890"
```

### 安装包

```bash
nimble install <包名>    # 安装指定包（例如：nimble install jester）
nimble install -y <包名> # 自动确认安装，无需交互
nimble install jester       # 安装最新版 jester
nimble install jester@0.17  # 安装指定版本
nimble uninstall jester     # 卸载包
nimble update               # 更新包索引（同步官方仓库）
nimble upgrade              # 升级已安装的包
```

### 项目初始化

```bash
nimble init myproject  # 创建新项目模板
cd myproject
```

### 项目构建与运行

```bash
nimble build    # 编译项目（生成可执行文件）
nimble run      # 编译并运行项目
nimble test     # 执行测试（如果项目包含测试）
```

### 包搜索与包信息

```bash
nimble search jester  # 搜索包
nimble show jester    # 显示包详情（版本、依赖等）
```

### .nimble文件

```nim
# jester.nimble
version       = "0.17.0"
author        = "Dominik Picheta"
description   = "A microframework for Nim"
license       = "MIT"
srcDir        = "src"
bin           = "jester"  # 可执行文件名称

# 依赖声明，语义化版本
requires "nim >= 1.4.0"
requires "httpbeast >= 0.10.0"
```

