---
title: Macos机器学习环境搭建(上)
description: Macos+miniconda+python3+pandas+scikit-learn+kaggle
pubDate: 2025-06-29
---

### miniconda安装

miniconda是精简版Anaconda（一种python发行版），只包含conda，python等基本依赖包。使用conda可以轻松创建多个虚拟环境，隔离不同项目的依赖和系统python，避免污染

```bash
brew search miniconda
brew install --cask miniconda
```

####  验证安装

```bash
conda --version
```

返回版本号安装成功，若显示命令找不到请配置环境变量

```bash
echo 'export PATH="/opt/homebrew/anaconda3/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### 换源

编辑以下文件

```bash
${HOME}/.condarc
```

若没有找到则运行以下命令先创建

```bash
conda config --set show_channel_urls yes
```

然后编辑配置文件

```bash
channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
custom_channels:
  conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
```

清除索引缓存

```bash
conda clean -i
```

验证换源结果

```bash
conda info
```

### 安装vscode并安装python插件

略

### conda创建虚拟环境

查找可用python版本

```bash
conda search python
```

创建新虚拟环境

```bash
conda create --name yourname python=3.13.5
```

conda会自动下载对应python版本和其依赖包

### conda激活虚拟环境

初始化

```bash
conda init zsh
```

```bash
conda activate yourname
```

### scikit-learn安装

conda搜索合适版本

```bash
conda search scikit-learn
```

安装

```bash
conda install scikit-learn=1.6.1
```

### pandas安装

```bash
conda search pandas
conda install pandas=2.2.3
```

### 使用vscode编码

在vscode右下角切换python解释器

![](https://bbitqnull.github.io/jieping2025-06-29-19.16.40.png)

等待终端激活生效

#### 验证环境

```bash
conda info --envs
```

星号标注的是当前使用的环境

```python
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
```

未报错且正常使用说明环境配置正确

### 配置kaggle API

配置kaggle api以便使用CLI方便的从kaggle下载数据集，以便学习使用

#### 下载API Token

登陆kaggle官网，settings-API-Create new token保存kaggle.json文件

#### 安装kaggle api

在当前conda虚拟环境中安装，便于管理

```bash
pip install kaggle
```

#### 验证安装

```bash
pip list
```

#### 配置kaggle.json

将该文件置于以下路径

```bash
~/.kaggle/kaggle.json
```

若不存在该目录则手动创建，之后编辑kaggle.json，可以自定义数据集安装路径，如

```json
{"username":"yourname","key":"xxxxxxxxx","path":"/Users/yourname/dataset"}
```

#### 验证配置

```bash
kaggle competitions list
```

能看到返回许多数据集说明配置正确

### 访问kaggle官网挑选数据集

在kaggle官网选择你需要的数据集，在Download-Kaggle CLI选项页面下可得到下载命令，在shell中输入即可下载

![](https://bbitqnull.github.io/jieping2025-06-29-20.43.53.png)

```bash
kaggle datasets download dansbecker/melbourne-housing-snapshot
```

之后便可以使用了