---
title: C++基础-RAII
description: 讲解RAII与相关实践
pubDate: 2025-07-15
---

# RAII

## 概述

RAII（Resource Acquisition Is Initialization），资源获取即初始化。

让对象生命周期与资源生命周期同步，避免手动管理资源，防止内存泄漏，在资源管理比较复杂的情况下优势明显。

## 核心思想

1. **资源获取 = 对象初始化**：在对象的构造函数中完成资源的申请（如打开文件、分配内存、加锁）。
2. **资源释放 = 对象销毁**：在对象的析构函数中完成资源的释放（如关闭文件、释放内存、解锁）。
3. **生命周期绑定**：资源的存在时间严格等于对象的存在时间 —— 对象创建则资源有效，对象销毁则资源释放。

## 工作原理

C++语言特性说明了，当对象离开作用于时，其析构函数一定会被调用，这也就保证了，无论是意外退出还是程序正常结束之前都会调用析构函数，所以RAII保证资源可以得到释放。

## 相关实践

### 智能指针

在介绍智能指针之前，先讲解C++五法则，即定义了类中诸如**析构函数**一种特殊函数就要显式定义五种特殊函数防止资源管理的问题。

#### 五法则

```c++
class my_class () {
private:
  int* data;
  int size;
public:
  // 
  // 拷贝构造函数
  my_class (const my_class& other) : size(other.size) {
    // 实现深拷贝
    data = new int[size];
    for (int i = 0; i < size; ++i) {
      data[i] = other.data[i];
    }
  }
  // 移动构造函数
  my_class (my_class&& other) noexcept : data(other.data), size(other.size) {
    other.data = nullptr;
    other.size = 0;
  }
  // 拷贝赋值运算符重载
  my_class& operator=(const my_class& other) {
    if (this != &other) { // 检查不是自赋值 a = a
      delete[] data; // 释放当前对象资源，防止内存泄漏
      data = other.data;
      size = other.size;
      // 实现深拷贝
      for (int i = 0; i < size; ++i) {
        data[i] = other.data[i];
      }
    }
    return *this; // 支持链式赋值，返回对象本身
  }
  // 移动赋值运算符重载
  my_class& operator=(my_class&& other) noexcept {
    if (this != &other) {
      delete[] data;
      data = other.data;
      size = other.size;
      other.data = nullptr;
      other.size = 0;
    }
    return *this;
  }
  // 析构函数
  ~my_class () {
    delete[] data;
    data = nullptr; // 防止悬空指针，继续访问data这个指针会出错
  }
};
```

在管理程序资源时，通过自定义类的拷贝构造函数，不同的析构函数，移动构造函数，重载赋值运算符等都十分麻烦且容易出错，于是引入了智能指针。

本质是一个类模版，可以创建任意类型的指针对象，该类型使用完毕后，其指向的内存空间会自动释放，属于RAII机制的一个实现。

智能指针就是将实例化的对象放在堆上，其地址保存在指针对象中，该指针对象存储在栈上，当该指针对象结束生命周期时就会调用析构函数，其中的delete a；就会将实例化的对象的内存释放，也就是调用那个对象的析构函数进行资源释放。

#### 独占智能指针 std::unique_ptr

拷贝构造函数被弃用。

可以使用移动构造函数。

以cpp文档中的例子为例。

```c++
#include <iostream>
#include <memory>

int main () {
  std::default_delete<int> d; // 使用具名删除器d
  std::unique_ptr<int> u1; // 调用默认构造函数，空
  std::unique_ptr<int> u2 (nullptr); // 用nullptr指针构造独占智能指针对象u2
  std::unique_ptr<int> u3 (new int); // 创建动态int内存的独占智能指针对象u3
  std::unique_ptr<int> u4 (new int, d); // 同上，同时制定删除器为d
  std::unique_ptr<int> u5 (new int, std::default_delete<int>()); // 同上，但指定一个临时删除器
  std::unique_ptr<int> u6 (std::move(u5)); // 调用移动构造函数，u5资源所有权转移
  std::unique_ptr<int> u7 (std::move(u6)); // 同上
  std::unique_ptr<int> u8 (std::auto_ptr<int>(new int)); // 自动指针的独占智能指针（auto_ptr已弃用）

  std::cout << "u1: " << (u1?"not null":"null") << '\n';
  std::cout << "u2: " << (u2?"not null":"null") << '\n';
  std::cout << "u3: " << (u3?"not null":"null") << '\n';
  std::cout << "u4: " << (u4?"not null":"null") << '\n';
  std::cout << "u5: " << (u5?"not null":"null") << '\n';
  std::cout << "u6: " << (u6?"not null":"null") << '\n';
  std::cout << "u7: " << (u7?"not null":"null") << '\n';
  std::cout << "u8: " << (u8?"not null":"null") << '\n';

  return 0;
}
/*
输出：
u1: null
u2: null
u3: not null
u4: not null
u5: null
u6: null
u7: not null
u8: not null
*/
```

#### 共享智能指针 std::shared_ptr

其存在引用计数，记录着指向同一内存的指针的数量。允许拷贝构造和移动构造。

```c++
#include <iostream>
#include <memory>

struct C {int* data;};

int main () {
  std::shared_ptr<int> p1;
  std::shared_ptr<int> p2 (nullptr);
  std::shared_ptr<int> p3 (new int);
  std::shared_ptr<int> p4 (new int, std::default_delete<int>());
  // 使用lambda表达式自定义删除器；显式指定内存分配器
  std::shared_ptr<int> p5 (new int, [](int* p){delete p;}, std::allocator<int>());
  std::shared_ptr<int> p6 (p5); // 拷贝构造函数，引用计数增加
  std::shared_ptr<int> p7 (std::move(p6)); // 调用移动构造，资源所有权转移
  std::shared_ptr<int> p8 (std::unique_ptr<int>(new int));
  std::shared_ptr<C> obj (new C);
  // 别名构造，p9指向obj->data，但不管理其生命周期，依赖于obj
  std::shared_ptr<int> p9 (obj, obj->data); 

  std::cout << "use_count:\n";
  std::cout << "p1: " << p1.use_count() << '\n';
  std::cout << "p2: " << p2.use_count() << '\n';
  std::cout << "p3: " << p3.use_count() << '\n';
  std::cout << "p4: " << p4.use_count() << '\n';
  std::cout << "p5: " << p5.use_count() << '\n';
  std::cout << "p6: " << p6.use_count() << '\n';
  std::cout << "p7: " << p7.use_count() << '\n';
  std::cout << "p8: " << p8.use_count() << '\n';
  std::cout << "p9: " << p9.use_count() << '\n';
  return 0;
}
/*
输出：
p1: 0
p2: 0
p3: 1
p4: 1
p5: 2
p6: 0
p7: 2
p8: 1
p9: 2
*/
```

#### std::weak_ptr

引入该指针是要解决std::shared_ptr的循环引用问题。

两个智能指针分别都指向对方，共享智能指针的引用计数减为0时内存释放，但是循环引用后就永远不为0，无法释放内存，造成内存泄漏。

```c++
#include <memory>

struct A;
struct B;

struct A {
    std::shared_ptr<B> b_ptr;  // A 持有 B 的 shared_ptr
    ~A() { std::cout << "A 被销毁\n"; }
};

struct B {
    std::shared_ptr<A> a_ptr;  // B 持有 A 的 shared_ptr
    ~B() { std::cout << "B 被销毁\n"; }
};

int main() {
    auto a = std::make_shared<A>();
    auto b = std::make_shared<B>();
    a->b_ptr = b;  // A 引用 B
    b->a_ptr = a;  // B 引用 A（形成循环）
    // 离开作用域时，a 和 b 的强引用计数均为 1（互相引用），对象无法释放
    return 0;
}
```

引入weak_ptr打破强引用循环，weak_ptr是弱引用，不会增加对象的引用计数，因为其没有对象的所有权，只是这个对象所有的观察者。

```c++
struct A {
    std::shared_ptr<B> b_ptr;
    ~A() { std::cout << "A 被销毁\n"; }
};

struct B {
    std::weak_ptr<A> a_ptr;  // 改为 weak_ptr（弱引用）
    ~B() { std::cout << "B 被销毁\n"; }
};

int main() {
    auto a = std::make_shared<A>();
    auto b = std::make_shared<B>();
    a->b_ptr = b;
    b->a_ptr = a;  // 弱引用，不增加 a 的强引用计数
    // 离开作用域时，a 的强引用计数减为 0（B 对 A 是弱引用），A 被销毁；
    // A 销毁后，b 的强引用计数减为 0，B 被销毁。
    return 0;
}
```

#### 引用计数实现原理

##### 控制块（Control Block）

- 独立内存块：每当通过 std::make_shared 或new 构造shared_ptr 时，会额外分配一块内存（控制块），存储以下信息：
  - 强引用计数（shared_ptr 的数量）：决定对象的生命周期（减为 0 时销毁对象）。
  - 弱引用计数（weak_ptr 的数量）：记录观察者数量，控制块自身的生命周期（当强、弱引用计数均为 0 时，释放控制块）。
  - 删除器和分配器（如有）。

## 注意事项

### 双重释放

封装一个RAII风格的类。

```c++
class my_class {
private:
  int* data;
  int size;
public:
  my_class (int s) : size(s) {
    data = new int[size]; // 对象初始化=获取资源
  }
  ~my_class () {
    delete[] data; // 对象销毁=释放资源
    data = nullptr;
  }
};
```

考虑如下情形。

```c++
my_class a(10); // 初始化对象=获取资源
my_class b = a; // 不是赋值，赋值是用一个对象的状态去更新已经有的对象；这里是初始化
```

代码编译通过，但有安全隐患，对象离开作用域时会双重释放，可能导致堆溢出。

#### 原理剖析

上述代码的实际执行逻辑。

```c++
my_class a(10);
my_class b(a); // 用对象a初始化b，会调用（默认）拷贝构造函数
```

C++的默认拷贝构造函数。

```c++
my_class (const my_class& other) // 参数是同类型对象的常量引用
```

C++的默认拷贝构造函数会进行逐成员复制（**浅拷贝**）。

问题的本质是资源所有权冲突。

```c++
/*
基本类型成员（int、float、bool）：直接复制值 b.num = a.num
对象类型成员（class my_class）：调用拷贝构造函数
指针类型成员（int* ptr）：仅复制指针的地址而不是其指向的内存值；b.ptr = a.ptr；结果两指针指向同一内存
数组类型成员（int arr[7]）：按元素逐个复制
*/
```

#### 解决方法

自定义拷贝构造函数进行**深拷贝**。

```c++
class my_class {
private:
  int* data;
  int size;
public:
  my_class (int s) : size(s) {
    data = new int[size]; // 对象初始化=获取资源
  }
  // 自定义拷贝构造函数实现深拷贝
  my_class (const my_class& other) : size(other.size) {
    data = new int[size]; // 为新对象分配独立内存
    for (int i = 0; i < size; ++i) {
        data[i] = other.data[i]; // 复制数据内容
    }
  }
  ~my_class () {
    delete[] data; // 对象销毁=释放资源
    data = nullptr;
  }
};
```

禁用拷贝构造函数。

```c++
MyResource(const MyResource&) = delete;
// 禁用赋值运算符，禁止对象间的拷贝赋值操作
MyResource& operator=(const MyResource&) = delete;
/*
my_class a(10);
my_class b(10);
b = a; // 报错
*/
/*
MyResource& ：赋值运算符的常规返回类型（MyResource的引用）
operator=：重载“=”运算符
const MyResource&：接受一个MyResource的常量引用（右值引用）
= delete：显式删除该函数，使其不可用
*/
```

定义**移动构造函数**，在C++11后增加了移动语义。

```c++
class my_class {
private:
  int* data;
  int size;
public:
  my_class (int s) : size(s) {
    data = new int[size]; // 对象初始化=获取资源
  }
	// 移动构造函数，接受参数是右值引用
  // noexcept告知编译器该函数不会抛出异常，允许容器在扩容时安全使用移动语义
  my_class (my_class&& other) noexcept : size(other.size), data(other.data) {
    other.data = nullptr;
    other.size = 0;
  }
  ~my_class () {
    // 判空逻辑，空则不析构，避免双重释放
    if (!data) {
      delete[] data; // 对象销毁=释放资源
      data = nullptr;
    }
  }
};
```