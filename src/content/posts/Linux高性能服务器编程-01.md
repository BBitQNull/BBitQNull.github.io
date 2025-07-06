---
title: Linux高性能服务器编程-01
description: 介绍主机、网络字节序；通用、专用socket地址；IP转换函数
pubDate: 2025-07-06
---

## 主机字节序&网络字节序

现代CPU一次都至少能加载32位整数，也就是多字节数，于是在内存中存储涉及方式问题。

### 大端字节序

整数高位字节存储在低地址，低位字节在高地址（符合人类阅读习惯）。

### 小端字节序

整数高位字节存储在高地址，低位字节在低地址（符合计算机习惯）。

![20210702091534958](https://bbitqnull.github.io/20210702091534958.png)

### 判断机器字节序

利用共用体共享内存机制，通过value赋值0x0102。

通过union_bytes数组随机访问特性，访问第一个字节和第二个字节。

```c++
// endian.cc
#include <stdio.h>
#include <iostream>

using std::cout;
using std::endl;

void byteorder () {
    // 共用体共享内存 2byte
    union {
        short value;
        char union_bytes[sizeof(short)];
    }test;
    test.value = 0x0102;
    if ((test.union_bytes[0]==1) && (test.union_bytes[1]==2)) {
        cout << "big endian!" << endl;
    } else if ((test.union_bytes[0]==2) && (test.union_bytes[1]==1)) {
        cout << "little endian!" << endl;
    } else {
        cout << "unknown!" << endl;
    }
}
// 调用后显示：little endian！
// 在内存中：[0x02,0x01] 属于小端序
```

现代计算机大多都是小端序，所以也称作主机字节序。

### 网络字节序

因为不同主机字节序可能不同，为了收发双方都能够正确处理数据，于是规定发送方必须将数据转化为大端字节序，接收方根据字节主机字节序决定是否将其转换。

保证了正确接收到格式化数据。

同一台主机的两个进程通信也需要考虑字节序问题，如java虚拟机采用大端字节序。

### 字节序转换API

根据名称即可判断使用场景。

```c++
#include <netinet/in.h>
unsigned long int htonl(unsigned long int hostlong);
unsigned short int htons(unsigned short int hostshort);
unsigned long int ntohl(unsigned long int netlong);
unsigned short int ntohs(unsigned short inr netshort);
```

## 通用socket地址

### 初始通用socket地址

sockaddr结构体用来表示socket地址。

```c++
#include <bits/socket.h>
struct sockaddr {
  sa_family_t sa_family; // 地址族（协议族）类型
  char sa_data[14]; // 存放socket地址值
};
```

##### 协议簇和地址簇关系

| 协议族   | 地址族   | 描述             |
| -------- | -------- | ---------------- |
| PF_UNIX  | AF_UNIX  | UNIX本地域协议族 |
| PF_INET  | AF_INET  | TCP/IPv4协议族   |
| PF_INET6 | AF_INET6 | TCP/IPv6协议族   |

一般协议族和地址族混用，因为他们都定义在相同头文件中，且值相同。

sa_data数组一共14字节，但是不同地址族的socket地址的长度和含义，格式都不同，所以有了通用socket地址结构体。

### 通用socket地址

空间更大且内存对齐。

```c++
#include <bits/socket.h>
struct sockaddr_storage {
  sa_family_t sa_family;
  unsigned long int __ss_align; // 用于内存对齐
  char__ss_padding[128 - sizeof(__ss_align)];
};
```

## 专用socket地址

因为通用socket地址不好使用，Linux为每个协议族（地址族）分别定义了一个socket地址结构体。

```c++
// UNIX本地域
struct sockaddr_un {
  sa_family_t sin_family; // AF_UNIX
  char sun_path[108]; // 文件路径名，最长108字节
};
```

TCP/IP协议族

```c++
// IPv4
struct sockaddr_in {
  sa_family_t sin_family; // AF_INET
  u_int16_t sin_port; // 16bit 端口号，网络字节序
  struct in_addr sin_addr; // IPv4地址结构体
};
struct in_addr {
  u_int32_t s_addr; // 32bit IPv4地址，网络字节序
};
```

```c++
// IPv6
struct sockaddr_in6 {
  sa_family_t sin6_family; // AF_INET6
  u_int16_t sin6_port; // 16bit 端口号，网络字节序
  u_int32_t sin6_flowinfo; // 流信息，应为0
  struct int6_addr sin6_addr; // IPv6地址结构体
  u_int32_t sin6_scope_id; // scope ID
};
struct int_addr {
  unsigned char sa_addr[16]; // 128bit IPv6地址，网络字节序
}
```

在定义socket地址时使用专用socket地址结构体，在使用时要转换为通用socket地址类型sockaddr。

## IP地址转换函数

为了保证IP地址可读性和计算机能够处理。所以需要保证点分十进制表示的IPv4地址和网络字节序的二进制整数可以相互转换。

```c++
#include <arpa/inet.h>
// 将用点分十进制字符串表示的IPv4地址转换为网络字节序整数表示的IPv4地址，失败时返回INADDR_NONE
in_addr_t inet_addr(const char* strptr);
// 功能同上，将转换结果存储于参数inp所指向的IPv4地址结构体中，成功返回1，失败返回0
int inet_aton(const char* cp, struct in_addr* inp);
// 将IPv4地址结构体中网络字节序整数表示的IPv4地址转换为用点分十进制字符串表示的IPv4地址
// 不可重入，后面的会覆盖之前的
char* inet_ntoa(struct in_addr in);
```

同时，十六进制字符串表示的IPv6地址和二进制整数也要可以相互转化。

```c++
// 可以用于IPv4和IPv6
#include <arpa/inet.h>
// af参数指定地址族，将src指向的点分十进制IPv4或十六进制字符串的IPv6地址转换，存储到dst指向的内存中，成功返回1，失败返回0并设置errno
int inet_pton(int af, const char* src, void* dst);
// 将二进制整数转换为对应的字符串形式，cnt指定dst所指存储单元大小，失败返回NULL并设置errno
/*
使用宏定义cnt
#include＜netinet/in.h＞
#define INET_ADDRSTRLEN 16
#define INET6_ADDRSTRLEN 46
*/
const char* inet_ntop(int af, const void* src, char* dst, socklen_t cnt);
```

