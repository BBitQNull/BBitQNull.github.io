---
title: Linux高性能服务器编程-02
description: 介绍创建、命名、监听socket；接收、发起、关闭连接；数据读写
pubDate: 2025-07-06
---

[TOC]

## 创建socket

Linux一切皆文件。

所以socket就是一个可读，可写，可控制，可关闭的文件描述符。

```c++
#include <sys/types.h>
#include <sys/socket.h>

int socket(int domain, int type, int protocol);
/*
domain:协议族，PF_UNIX，PF_INET，PF_INET6
type:服务类型，SOCK_STREAM(流服务TCP),SOCK_UGRAM(数据报服务UDP),SOCK_RAW(IP)
     可以和SOCK_NONBLOCK或SOCK_CLOEXEC相与
     分别是socket为非阻塞的和在fork调用创建子进程时在子进程中关闭该socket
protocol:一般为0，表示使用默认协议
return:成功返回socket文件描述符，失败返回-1并设置errno
*/
```

## 命名socket

客户端中一般使用匿名方式，由系统自动分配socket地址。

服务器中需要将之前创建的socket文件描述符和socket地址绑定，使用bind函数，这一过程称作给socket命名。

```c++
#include <sys/types.h>
#include <sys/socket.h>

int bind(int sockfd, const struct sockaddr* my_addr, socklen_t addrlen);
/*
sockfd:socket文件描述符
my_addr:socket地址
addrlen:指出该socket地址长度
return:成功返回0，失败返回-1并设置errno
errno:EACCES表示被绑定的地址是受保护的，只能超级用户访问，比如绑定熟知端口（0-1023）
      EADDRINUSE表示被绑定的地址正在使用中
*/
```

## 监听socket

socket命名后，还需要创建一个监听队列以存放待处理的客户连接。

```c++
#include <sys/socket.h>

int listen(int sockfd, int backlog);
/*
sockfd:socket文件描述符
backlog:提示内核监听队列的最大长度，监听队列长度超过这个值，服务器不再受理新的客户连接，客户端也会收到ECONNREFUSED错误信息（表示处于完全连接状态的socket上限）
return:成功返回0，失败返回-1并设置errno
*/
```

处于ESTABLISHED状态（完整连接，双方可以收发数据）最多有【backlog+1】（比backlog略大）个

## 接受连接

accept系统调用从listen监听队列中接受一个连接。

```c++
#include <sys/types.h>
#include <sys/socket.h>
// accept只是从监听队列中取出连接，不关心连接所处的状态
int accept(int sockfd, struct sockaddr* addr, socklen_t* addrlen);
/*
sockfd:处于监听状态的socket文件描述符（LISTEN）
addr:被接受连接的远端socket地址
addrlen:上述socket地址长度
return:成功返回一个新的“连接socket”（唯一的标识被接受的这个连接，服务器读写这个    socket文件描述符和客户端通信）（ESTABLISHED），失败返回-1设置errno
*/
```

## 发起连接

客户端使用connect系统调用发起连接。

```c++
#include <sys/types.h>
#include <sys/socket.h>

int connect(int sockfd, const struct sockaddr* serv_addr, socklen_t addrlen);
/*
sockfd:由socket系统调用返回的socket文件描述符
serv_addr:服务器监听的socket地址
addrlen:指定这个地址的长度
return:成功返回0，此时这个sockfd唯一标识这个连接，客户端可以读写这个文件描述符和服务器通信；失败返回-1并设置errno
errno:ECONNREFUSED表示目标端口不存在，连接被拒绝
      ETIMEDOUT表示连接超时

*/
```

## 关闭连接

关闭连接，就是关闭对应的socket文件描述符，使用close系统调用或shutdown完成。

```c++
#include <unistd.h>

int close(int fd);
/*
fd:待关闭的socket文件描述符，将fd引用计数减1而不是立即关闭连接（fd引用计数为0才是真正关闭）
多进程程序中，fork系统调用默认将使父进程打开的socket引用计数+1
*/
#include <sys/socket.h>
int shutdown(int sockfd, int howto);
/*
sockfd:是待关闭的socket
howto:决定关闭的粒度
return:成功返回0，失败返回-1并设置errno
*/
```

下面的表格显示了howto参数的可选值

| 可选值    | 含义                                                         |
| --------- | ------------------------------------------------------------ |
| SHUT_RD   | 关闭sockfd读的这一半，应用程序不能再对socket文件描述符进行读操作，该socket接收缓冲区所有数据丢弃 |
| SHUT_WR   | 关闭sockfd写的这一半，sockfd的发送缓冲区数据会发送出去，应用程序不能再对该socket文件描述符进行写操作，连接处于半关闭状态 |
| SHUT_RDWR | 同时关闭sockfd上的读和写                                     |

而close只能同时关闭socket上的读和写。

## 数据读写

### TCP数据读写

相比于使用read和write系统调用，更推荐使用专门针对socket编程的系统调用。

```c++
#include <sys/types.h>
#include <sys/socket.h>

ssize_t recv(int sockfd, void* buf, size_t len, int flags);
/*
sockfd:socket文件描述符
buf:读缓冲区位置
len:读缓冲区大小
flags:通常为0
return:成功返回实际读取到的数据长度，失败返回-1并设置errno
*/
ssize_t send(int sockfd, const void* buf, size_t len, int flags);
/*
sockfd:socket文件描述符
buf:写缓冲区位置
len:写缓冲区大小
flags:通常为0
return:成功返回实际写入的数据长度，失败返回-1并设置errno
*/
```

flags参数对数据收发提供额外控制，通过对下表的选项一个或多个（用或连接）设置收发。

只对send和recv的当前调用生效。

| 选项名        | 含义                                                         | send | recv |
| ------------- | ------------------------------------------------------------ | ---- | ---- |
| MSG_CONFIRM   | 指示数据链路层协议持续监听对方回应，直到得到答复，用于SOCK_DGRAM和SOCK_RAW类型 | Y    | N    |
| MSG_DONTROUTE | 不查看路由表，直接将数据发送给本地局域网内的主机，表示发送者知道目标主机就在本地网络中 | Y    | N    |
| MSG_DONTWAIT  | 对socket的此次操作是非阻塞的                                 | Y    | Y    |
| MSG_MORE      | 告诉内核应用程序还有更多数据要发送，内核将超时等待新数据写入TCP发送缓冲区后一并发送。防止发送多个过小报文段，提高传输效率 | Y    | N    |
| MSG_WAITALL   | 读操作仅在读取到指定数量的字节后才返回                       | N    | Y    |
| MSG_PEEK      | 窥探读缓存中的数据，此次读操作不会导致这些数据被清除         | N    | Y    |
| MSG_OOB       | 发送或接收紧急数据（带外数据）                               | Y    | Y    |
| MSG_NOSIGNAL  | 在读端关闭的管道或socket连接中写数据时不引发SIGPIPE信号      | Y    | N    |

### UDP数据读写

```c++
#include <sys/types.h>
#include <sys/socket.h>
// 将最后两个参数设置为NULL就可以用于面向连接的socket数据读写
ssize_t recvfrom(int sockfd, void* buf, size_t len, int flags, struct sockaddr* src_addr, socklen_t* addrlen);
/*
sockfd:连接socket文件描述符
buf:读缓冲区位置
len:读缓冲区大小
flags:读写参数
src_addr:发送端socket地址
addrlen:指定地址长度
return:成功返回读取到的数据长度，失败返回-1并设置errno
*/
ssize_t sendto(int sockfd, const void* buf, size_t len, int flags, const struct sockaddr* dest_addr, socklen_t addrlen);
/*
sockfd:连接socket文件描述符
buf:写缓冲区位置
len:写缓冲区大小
flags:读写参数
dest_addr:接收端socket地址
addrlen:指定地址长度
return:成功返回发送的数据长度，失败返回-1并设置errno
*/
```

### 通用数据读写函数

可以用于TCP和UDP。

```c++
#include <sys/socket.h>

ssize_t recvmsg(int sockfd, struct msghdr* msg, int flags);
/*
sockfd:指定被操作的目标socket
msg:是msghdr结构体类型的指针
flags&return:与上述的读写调用都相同
*/
ssize_t sendmsg(int sockfd, struct msghdr* msg, int flags);
/*
参数意义与recvmsg相同
*/
```

msghdr结构体定义如下：

```c++
struct msghdr {
  void* msg_name; // socket地址，对于TCP设置为NULL
  socklen_t msg_namelen; // socket地址的长度
  struct iovec* msg_iov; // 分散的内存块，是iovec结构体类型的指针
  int msg_iovlen; // 分散内存块数量
  void* msg_control; // 指向辅助数据的起始位置
  socklen_t msg_controllen; // 辅助数据的大小
  int msg_flags; // 复制函数中的flags参数，并在调用过程中更新（无需指定）
};
```

iovec结构体定义如下：

```c++
struct iovec {
  void* iov_base; // 内存起始地址
  size_t iov_len; // 这块内存的长度
};
```

#### 分散读

对于recvmsg来说，数据被读取并放置在msg_iovlen块分散内存中。

内存块长度和位置由msg_iov指向的数组指定。

#### 集中写

对于sendmsg来说，msg_iovlen块分散内存中的数据会被一起发送。

