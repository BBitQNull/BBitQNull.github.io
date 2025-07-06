---
title: CMake入门使用
description: 讲解CMake的入门使用；多层目录，分级CMakeLists.txt与现代CMake
pubDate: 2025-07-06
---

[TOC]

## CMake简介

CMake是一个自动生成makefile的工具。

使用CMake可以不再写麻烦的makefile文件，且可以跨平台。

有多级目录存在情况下推荐分级CMakeLists.txt；这样可以让依赖关系清晰，易于扩展，易于分模块，分级管理，写CMakeLists.txt不容易乱。

并且推荐使用现代CMake的特性：

- 使用target_link_libraries 设置依赖
- 使用target_include_directories设置头文件
- 使用target_sources 管理源文件

利于模块化管理和扩展，可以精确控制依赖范围，避免变量污染，有利于现代IDE理解，有利于条件编译。

## 配置过程·简

### 项目结构

```
simple-chatroom/
├── CMakeLists.txt           # 根目录的CMake配置文件
├── bin/                     # 存放可执行文件
├── include/                 # 存放头文件
│   ├── server/              # 服务器头文件
│   └── client/              # 客户端头文件
├── src/                     # 存放源文件
│   ├── server/ 						 # 服务器源文件
│       └── CMakeLists.txt   # 子CMake配置文件
│   └── client/              # 客户端源文件
│       └── CMakeLists.txt   # 子CMake配置文件
└── build/                   # 构建目录
```

### CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.10.0) # 指定所需CMake最低版本

project(Project1) # 指定项目名称
# 设置可执行文件输出目录 PROJECT_SOURCE_DIR 指项目根目录
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin) 
# 添加子目录，cmake会递归处理该目录下的CMakeLists.txt
add_subdirectory(src/server)
add_subdirectory(src/client)
```

### src/server/CMakeLists.txt

```cmake
add_executable(server) # 定义一个可执行文件（目标）
# 将源文件添加到目标；
target_sources(server PRIVATE
    server.cc
)
# 添加头文件目录到目标（生成目标在该目录搜索头文件）
target_include_directories(server PUBLIC ${PROJECT_SOURCE_DIR}/include/server)
```

### src/client/CMakeLists.txt

```cmake
add_executable(client)

target_sources(client PRIVATE
    client.cc
)

target_include_directories(client PUBLIC ${PROJECT_SOURCE_DIR}/include/client)
```

| 依赖传播方式 |                            效果                            |
| ------------ | :--------------------------------------------------------: |
| PRIVATE      |                 源文件仅用于当前目标的编译                 |
| INTERFACE    |    源文件不用于当前目标，但会传递给依赖该目标的其他目标    |
| PUBLIC       | 源文件用于当前目标的编译，并且会传递给依赖该目标的其他目标 |