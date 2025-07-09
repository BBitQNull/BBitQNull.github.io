---
title: ANSI转义序列
description: 简介ANSI转义序列的使用
pubDate: 2025-07-09
---

## 简介

ANSI 转义序列（ANSI Escape Sequences）是一种用于控制终端文本显示格式和光标位置的标准化字符序列。它们起源于 20 世纪 70 年代的 ANSI X3.64 标准，最初用于电传打字机和终端设备，现在被大多数现代终端模拟器支持，包括 Linux、macOS 和 Windows 10+ 的控制台。

## 用法

### 基本结构

```
ESC [参数1;参数2;...参数n 命令字符
```
表示将文本颜色设置为红色。
```
\033[31m
```

其中\033代表八进制33，是ASCII码的27，即ESC。

[是控制序列引入符。

31是参数，代表红色。

m是命令字符，指设置文本属性。

### 使用方法

只要将ANSI序列发送到支持ANSI序列转义的交互式终端上就能生效，其本质只是一串字符串而已。

C++中可以使用**std::cout**将其输出到标准输出流中。

```c++
#include <iostream>

int main() {
    std::cout << "\033[31m红色文本\033[0m" << std::endl;
    return 0;
}
```

也可以使用C标准。

```c
#include <cstdio>

int main() {
    printf("\033[32m绿色文本\033[0m\n");
    return 0;
}
```

输出到支持ANSI的终端文件中（/dev/tty），一样会生效。

```c++
#include <fstream>

int main() {
    std::ofstream tty("/dev/tty");  // Linux 特定，直接写入终端
    tty << "\033[33m黄色文本\033[0m" << std::endl;
    return 0;
}
```

直接操作文件描述符，如使用**write**系统调用向标准输出（文件描述符1）写入。

```c++
#include <unistd.h>

int main() {
    const char* red_text = "\033[31m红色文本\033[0m\n";
    write(1, red_text, sizeof(red_text) - 1);  // 1 代表标准输出
    return 0;
}
```

## ANSI转义序列基本使用

### 256色设置

修改文本属性的颜色属性，在终端中打出的文字前景或背景色会被改变。

```
\033[38;5;{ID}m 设置前景色
\033[48;5;{ID}m 设置背景色
```

第一个参数（38或48）表示前景色或背景色，第二个参数表示颜色格式（5是256色，2是RGB色）。

之后的参数是256色的ID或R、G、B。

最后一个命令字符m表示设置文本属性。

ID:

![256color](/Users/wangsiqi/Web/my_blog/public/256color.png)

大多数终端也支持8-16色。

更现代的终端也支持**24位RGB色**。

### 光标位置设置

| ANSI转义序列 |            作用             |
| :----------: | :-------------------------: |
|    \033[s    |      保存当前光标位置       |
|   \033[nA    |       光标向上移动n行       |
|   \033[nB    |       光标向下移动n行       |
|   \033[nC    |       光标向右移动n列       |
|   \033[nD    |       光标向左移动n列       |
|   \033[nE    | 光标移动到下一行的第 `n` 列 |
|   \033[nF    | 光标移动到上一行的第 `n` 列 |
|    \033[u    |   恢复之前保存的光标位置    |
|  \033[n;nH   |      光标移动到n行n列       |

相对移动的序列不受终端缩放影响，但是更精准的移动则需要先获取终端总行数和列数，再使用**命令字符H**进行移动。

#### 获取终端行列数

以Linux/macos为例，类unix系统可以使用ioctl系统调用与设备驱动程序交互，可以获取终端（tty）的总行数和总列数。

窗口大小信息由**winsize**结构体存储。

```c++
struct winsize {
    unsigned short ws_row;    // 终端行数（行数）
    unsigned short ws_col;    // 终端列数（字符数/行）
    unsigned short ws_xpixel; // 窗口宽度（像素，可选，可能为0）
    unsigned short ws_ypixel; // 窗口高度（像素，可选，可能为0）
};
```
使用**ioctl**系统调用，传递参数**TIOCGWINSZ**就可以返回一个该结构体。
```c
#include <sys/ioctl.h>  // 提供 struct winsize 和 ioctl 命令
#include <unistd.h>     // 提供 STDOUT_FILENO 宏（标准输出文件描述符）

// 获取终端行数和列数
void getTerminalSize (int* rows, int* cols) {
    struct winsize w;  // 用于接收窗口大小的结构体
    
    // 调用 ioctl：向标准输出设备发送 TIOCGWINSZ 命令
    // 参数1：文件描述符（STDOUT_FILENO 表示标准输出，即终端）
    // 参数2：命令（TIOCGWINSZ = "Get Window Size"，获取窗口大小）
    // 参数3：接收结果的结构体指针
    if (ioctl(STDOUT_FILENO, TIOCGWINSZ, &w) == -1) {
        // 出错处理（如终端不支持该命令）
        perror("ioctl failed");
        *rows = -1;
        *cols = -1;
        return;
    }
    
    // 提取行数和列数
    *rows = w.ws_row;  // 总行数
    *cols = w.ws_col;  // 总列数
}
```

### 设置滚动区域

```c++
#include <iostream>
#include <string>

// 设置滚动区域（rows 是可见行数）
void setScrollRegion(int rows) {
    std::cout << "\033[1;" << rows << "r";  // 设置滚动区域为第1行到第rows行
}

// 重置滚动区域为整个屏幕
void resetScrollRegion() {
    std::cout << "\033[r";  // 重置滚动区域
}
```

### 更多使用参考文档

[ANSI.md](https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797)

[ANSI.md翻译版](https://www.cnblogs.com/chargedcreeper/p/-/ANSI)
