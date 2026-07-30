---
title: "Linux/WSL2下PyTorch环境配置（Ubuntu-Miniconda-GPU版）及D4RL强化学习库安装（完结）"
date: 2026-07-30T12:00:00+08:00
draft: false
slug: "linux-wsl2-pytorch-d4rl-setup"
description: "在Linux服务器或WSL2中配置GPU版PyTorch，并安装D4RL强化学习库。"
tags: ["PyTorch", "Linux", "WSL2", "D4RL"]
categories: ["环境配置"]
showToc: true
---

这篇博客适用于**Linux服务器**、Windows的**WSL2-Linux子系统**的Pytorch环境配置（GPU版）。同时在第二部分介绍了D4RL强化学习库的安装，不做强化学习的同学仅参照第一部分即可，这篇教程是边安装边写的（安装从0开始），仅保证本人正常安装，如出现意外问题，请善用必应/谷歌（不是百度）和deepseek。



---
接上文，在Windows下安装完D4RL后虽然表面成功，但是当万事俱备时，一运行代码，却出现报错...

> Exception: Please add mujoco library to your PATH: set PATH=C:\\\\Users\\\\baoda\\\\.mujoco\\\\mujoco210\\\\bin;%PATH%



一通操作后，又出现报错：

> Warning: Mujoco-based envs failed to import. Set the environment variable D4RL\_SUPPRESS\_IMPORT\_ERROR=1 to suppress this message. DLL load failed while importing cymj: 找不到指定的模块。



最后改了很久，无果，遂放弃...



于是转战通过 WSL2 在Windows上配置Linux子系统。（之前在服务器上已经成功配过D4RL环境，但没有记录过，借此机会完整记录一下配置过程，主要用于自己备忘。）



<font color=blue>**下文安装从0开始，Linux服务器 ＆ WSL Linux子系统配置过程一模一样**</font>



---
# 第一部分、pytorch环境配置

## （一）安装WSL2及Ubuntu

参考[【Linux】自定义WSL2安装位置，安装到其他磁盘(非C盘)](https://blog.csdn.net/weixin\_48076899/article/details/135214749)，以及[WSL 安装与使用 | EESΛST Docs](https://docs.eesast.com/docs/tools/wsl#%E7%AC%AC%E4%BA%94%E6%AD%A5%E5%AE%89%E8%A3%85-wsl-2-%E5%86%85%E6%A0%B8%E7%BB%84%E4%BB%B6)这两篇教程足矣。

<mark style="background:pink"> **注意** </mark> Linux子系统，也就是Ubuntu可以一开始就安装到非C盘，而不用在C盘安装好后再迁移到别的盘。总之，**不要在Microsoft Store里直接下载即可**，上面第一个教程中已经说明。



在服务器上配置的同学不需要关注这一步。

## （二）安装Miniconda以及Pytorch

为了减少空间占用，安装Miniconda而不是Anaconda，硬盘足够的或者服务器上也可以去安装Anaconda（可自行找别的Anaconda教程），不影响其他工具安装操作。

### 1. 安装cuda toolkit

&#x20;  （1）在命令行输入nvidia-smi查看系统可按照的==最高cuda版本==。

&#x20;  

&#x20;  查看你设备的驱动版本（nvidia-smi所显示的）所对应的cuda版本的[官方文档](https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html)，以及cuda[官方下载地址](https://developer.nvidia.com/cuda-toolkit-archive)，选择相应下载项后，直接依次在Ubuntu命令行输入官方给的命令。

&#x20;  <img src="https://img2023.cnblogs.com/blog/3338811/202504/3338811-20250402213748521-952566420.png"  width="50%" height="50%">

&#x20;  (2) 安装完cuda toolkit后，输入下面命令，打开编辑 \\\~/.bashrc文件（\\\~指当前用户目录）:<br>

&#x20;  ```bash

nano \~/.bashrc

&#x20;  ```  

在\~/.bashrc文件最下方输入以下命令:

&#x20;  ```bash

# add nvcc compiler to path

export PATH=$PATH:/usr/local/cuda-11.3/bin

# add cuBLAS, cuSPARSE, cuRAND, cuSOLVER, cuFFT to path

export LD\_LIBRARY\_PATH=$LD\_LIBRARY\_PATH:/usr/local/cuda-11.3/lib64:/usr/lib/x86\_64-linux-gnu

&#x20;  ```  

两条命令中的==cuda-11.3==记得替换为自己实际安装版本。输入完成后，退出并保存：**CTRL+X**，**Y**，**Enter**。然后输入以下命令重新加载bashrc文件，以使更改生效：<br>

```bash

source \~/.bashrc

```  

在Ubuntu命令行输入nvcc -V，若出现版本号即代表CUDA安装配置成功。 

### 2. 安装cuDNN

cuda（Compute Unified Device Architecture）是 NVIDIA 提供的通用 GPU 计算平台；cuDNN 是基于 CUDA 构建的专门用于深度学习的库，依赖 CUDA 执行 GPU 加速计算。**如果你要运行 TensorFlow、PyTorch 等深度学习框架**，通常**需要安装 cuDNN**，否则会缺少关键库导致无法使用 GPU 训练。



cuDNN的 a.[下载地址](https://developer.nvidia.com/cudnn-downloads?target\_os=Linux\&target\_arch=x86\_64\&Distribution=Ubuntu\&target\_version=20.04\&target\_type=deb\_local)，或者查看 b.[历史版本](https://developer.nvidia.com/cudnn-archive)（含有cuda及cuDNN版本对应关系，但是好像需要先注册登录）。<br>

我这里是通过查看 b.历史版本 安装的（如果安装 9.x 开头的cuDNN，会有官方命令，按照给的命令操作即可，一般应该不会报错），会出现如下图，下载会得到一个本地的.deb文件（记得复制进你的Linux用户文件夹里，位置/home/YourName）

<img src="https://img2023.cnblogs.com/blog/3338811/202504/3338811-20250402213749074-995331402.png"  width="50%" height="50%">

可以借鉴官方安装命安装历史版本（具体的版本号记得改，也就是"9.0.0"这一串，对应着改成你自己的版本）

```bash

sudo dpkg -i cudnn-local-repo-ubuntu2004-9.0.0\_1.0-1\_amd64.deb

sudo cp /var/cudnn-local-repo-ubuntu2004-9.0.0/cudnn-\*-keyring.gpg /usr/share/keyrings/

sudo apt-get update

sudo apt-get -y install cudnn

```

安装可能有报错，比如我自己遇到的：

![|490](https://img2023.cnblogs.com/blog/3338811/202504/3338811-20250402213749406-2037610528.png)

此时通过sudo apt-cache search cudnn查找，发现相关库已经齐全了（下面的前三项）：

![|650](https://img2023.cnblogs.com/blog/3338811/202504/3338811-20250402213749627-1038088216.png)

然后直接如下安装：

```bash

sudo apt-get install -y libcudnn8

sudo apt-get install -y libcudnn8-dev

sudo apt-get install -y libcudnn8-samples    #可选

```

如果安装了libcudnn8-samples，可以运行以下命令测试cuDNN是否安装完成：

```bash

cd /usr/src/cudnn\_samples\_v8/mnistCUDNN

make

./mnistCUDNN

```

如果输出Test passed!则成功。

> 或者等安装完pytorch后，进入装有pytorch的虚拟环境测试以下例子：

> ```python

> python    #进入python环境

> import torch

> print(torch.backends.cudnn.version())

> #能够正确返回一串数字，如：90100

> from torch.backends import cudnn # 若正常则静默

> cudnn.is\_available() 

> #若正常返回True

> a=torch.tensor(1.)

> cudnn.is\_acceptable(a.cuda()) 

> #若正常返回True

> ```

### 3. 安装Miniconda

&#x20;  在镜像源上挑一个Linux的版本，并复制其下载链接[Index of /anaconda/miniconda/ | 清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/)

&#x20;  <img src="https://img2023.cnblogs.com/blog/3338811/202504/3338811-20250402213749860-1255002187.png"  width="50%" height="50%">

&#x20;  要选Linux 64位的，py39代表python 3.9（即bash里的python版本，这个不用在意，因为一般我们不会使用base环境）

&#x20;  然后执行下载和安装操作：

&#x20;  ```bash

wget https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/Miniconda3-py39\_4.9.2-Linux-x86\_64.sh

bash Miniconda3-py39\_4.9.2-Linux-x86\_64.sh

```

wget后的网址就是你刚刚复制的链接，bash后的内容就是你复制的链接的最后部分。注意安装的时候你可能发现窗口不动，并下方显示**MORE**，此时你一路按回车，就能发现有需要你确认的地方，按要求输入yes或者回车就行。<br>

&#x09;！！以我为鉴，

&#x20;   <img src="https://img2023.cnblogs.com/blog/3338811/202504/3338811-20250402213750235-527553207.png"  width="50%" height="50%">

==这块是按回车键！不是输入ENTER==，当时脑子傻了...现在好了，改都没办法改（如果有人知道如何修改请务必不吝赐教，逼死强迫症）

&#x09;

重启终端（先exit退出，再wsl进入），如果命令提示符前出现base则代表配置成功。

### 4. 创建虚拟环境

&#x20;  这就没什么好说的了，在bash环境下，直接create：<br>

&#x20;  （env\_name 换成自己取的环境名称，python 可以根据自己需要的版本来，但别太新）

&#x20;  ```python

conda create -n env\_name python=3.8

&#x20;  ```

### 5. 在创建好的虚拟环境里安装pytorch

可以去[pytorch官网](https://pytorch.org/)选择对应版本用命令一键安装，但由于网速问题，我**建议通过下载whl文件，本地安装的方式**。<br>

附上torch，torchvision和torchaudio的下载地址（安装pytorch就是装这三个，注意版本匹配）：



[torch](https://download.pytorch.org/whl/torch\_stable.html)

[torchvision](https://download.pytorch.org/whl/torchvision)  

[torchaudio](https://download.pytorch.org/whl/torchaudio/)



例如，我安装的是 python=3.8，cuda-11.3（也就是之前cuda toolkit的版本，一定要注意匹配！）那么我对应下载的三个文件和安装命令是：

![|630](https://img2023.cnblogs.com/blog/3338811/202504/3338811-20250402213750437-869832542.png)

```python

# 进入 .whl 文件所在目录后执行以下命令

pip install torch-1.10.0+cu113-cp38-cp38-linux\_x86\_64.whl

pip install torchaudio-0.10.0+cu113-cp38-cp38-linux\_x86\_64.whl

pip install torchvision-0.11.0+cu113-cp38-cp38-linux\_x86\_64.whl

```

>以上的cu113和cuda-11.3/cuda toolkit 11.3是匹配的；据我观察 1.x 版本的torch好像比torchaudio和torchvision多一个1，至于后面的是10还是11这点细微的差别好像影响不大）



🎉🎉🎉至此，Miniconda及GPU版pytorch环境已经全部配置完成，可以愉快玩耍啦！



\---------------------

# 第二部分、D4RL库安装

以下内容都是win+r cmd 进入wsl后执行；Linux服务器上并没有什么不同，只是在写路径时没有 /mnt 这一项。

==注意pip install 包前首先确定一下所在的虚拟环境是否正确。下载包速度若慢可以换成清华源，执行以下命令即可：

```bash

python -m pip install --upgrade pip

pip config set global.index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple

```

## 1. 安装mujoco210

（1） 去[官网](https://github.com/google-deepmind/mujoco/releases/tag/2.1.0)下载对应版本的压缩包；然后在当前用户家目录下创建文件夹

```bsah

mkdir \~/.mujoco

```

（2） 进入你压缩包所在的目录，比如我压缩包下在桌面，则 cd /mnt/desktop，然后解压

```bash

cd /mnt/desktop

tar -zxvf mujoco210-linux-x86\_64.tar.gz -C \~/.mujoco

```

（3） 添加环境变量并刷新一下

打开环境变量文件

```bash

nano \~/.bashrc

```

在文件末尾（#>>conda initialize >>前面）添加上：

```bash

export LD\_LIBRARY\_PATH=$LD\_LIBRARY\_PATH:/home/XXX/.mujoco/mujoco210/bin

```

保存关闭后刷新环境变量

```bash

source \~/.bashrc

```

（4） 测试mujoco是否安装成功

```bash

cd \~/.mujoco/mujoco210/bin

./simulate ../model/humanoid.xml

```

出现如下图所示的仿真环境则安装成功：

![image](https://img2024.cnblogs.com/blog/3338811/202508/3338811-20250809110813947-342389810.png)

## 2. 安装mujoco-py

（1）mujoco-py是MuJoCo的Python绑定，D4RL需要它，这里我选了一个合适的版本。首先conda activate 激活之前安装了pytorch的虚拟环境，然后执行

```bash

python -m pip install mujoco-py==2.1.2.14

```

（2）添加环境变量

打开环境变量文件

```bash

nano \~/.bashrc

```

在之前export 添加的环境变量后加上：

```bash

export LD\_LIBRARY\_PATH=$LD\_LIBRARY\_PATH:/usr/lib/nvidia 

```

保存关闭（依次CTRL X，Y，Enter）后重新加载环境变量

```bash

source \~/.bashrc

```

（3）测试是否安装成功

```bash

# 进入对应虚拟环境后，依次执行

python

import mujoco\_py

```

没有报错则安装成功。

比如我因为Cython版本太高报错，修改至对应版本（cython==0.29.37）；后又遇到没有OSMesa (Off-Screen Mesa) 库的开发包（方法：sudo apt-get update 和 sudo apt-get install build-essential libosmesa6-dev libgl1-mesa-glx libglfw3-dev patchelf）。

遇到的报错不尽相同，可以问AI解决。



## 3. 安装D4RL依赖

> 在[官方仓库](https://github.com/Farama-Foundation/D4RL)中其实已经给出了安装办法，

> ```bash

> git clone https://github.com/Farama-Foundation/d4rl.git

> cd d4rl

> pip install -e .

> ```

> 但是可能会遇到timeout，所以这里通过另一种方式安装。



在安装D4RL之前先安装一些依赖。

（1）gym

```bash

pip install gymnasium==1.1.1

```

如果D4RL文档中指定需要旧版Gym（例如gym而不是gymnasium），可以安装旧版：

```bash

pip install gym==0.21.0

```

（2）mjrl

直接用官方仓库安装D4RL会超时原因就是mjrl会远程拉取，所以我们通过本地方式安装。下载[mjrl](https://github.com/aravindr93/mjrl) zip压缩包，然后右键解压。cd 进入文件目录并安装。

```bash

# 比如我的路径是这样

cd /mnt/d/desktop/mjrl-master

# 安装之前ls一下，以防进错目录

ls

# 安装

pip install .

```

（3）其他依赖

\- 安装D4RL还需要一些其他库

```bash

pip install numpy==1.24.4 h5py==3.11.0 termcolor==1.1.0 pybullet==3.2.7 click==8.1.8 -i https://pypi.tuna.tsinghua.edu.cn/simple

```

## 4. 安装D4RL

（1）下载[D4RL官方仓库](https://github.com/Farama-Foundation/D4RL#)提供的zip，并右键解压。

（2）对 setup.py 里的内容做如下修改，在最下方。其他内容不要动。注释掉的这些就是我们在上面已经装好的包。

```bash

&#x20;   install\_requires=\[

&#x20;       "gym<0.24.0",

&#x20;       #"numpy",

&#x20;       #"mujoco\_py",

&#x20;       #"pybullet",

&#x20;       #"h5py",

&#x20;       #"termcolor",  # adept\_envs dependency

&#x20;       #"click",  # adept\_envs dependency

&#x20;       "dm\_control>=1.0.3",

&#x20;       #"mjrl @ git+https://github.com/aravindr93/mjrl@master#egg=mjrl",

&#x20;   ],

```

（3）cd 进文件目录并安装。

> 建议一开始将文件夹放在一个合适的位置后再安装，而不是桌面！ <font color=red>因为以 -e 方式安装后不能删除源文件！！</font>

> <img src="https://img2024.cnblogs.com/blog/3338811/202508/3338811-20250811110925572-83452475.png"  width="50%" height="50%">



```bash

# 比如我的路径

cd /mnt/d/desktop/D4RL-master

# 看一下有没有进错

ls

# 安装，这里的-e表示以可编辑模式安装，方便后续修改代码

pip install -e .

```



至此安装完成\~🎉🎉🎉



# 第三部分、碎碎念

坚持看到这里的同学，你已经成功99.99%啦！🥳

以上我们已经成功在wsl2上配置了离线强化学习库 D4RL 。不过在运行具体的代码时，可能还会遇见额外的问题。

比如我严格按照上述从零配置后，运行 **TD3+BC** 代码会报错。问一下AI，原来是缺少包 six ，导致如 hopper-medium-v2 没有注册到 gym 里。这时我们就安装 six 包（比如six==1.17.0）就好了。

接着我们再去运行

```bash

python main.py --env hopper-medium-v2

```

第一次运行时，你会发现它在下载数据集，非常慢，直接ctrl c 终止。然后回到家目录下，发现多了个 .d4rl 文件夹，双击打开，继续是 datasets 文件夹，原来是放数据集的地方，于是乎，我们直接实现去[官网](https://rail.eecs.berkeley.edu/datasets/offline\_rl/)将所需数据集下载下来就好啦，下完就是下面这样的👇

<img src="https://img2024.cnblogs.com/blog/3338811/202508/3338811-20250809154851554-251740154.png"  width="50%" height="50%">

这样下次你跑实验的时候，就会飞一般的感觉\\\~ (其实还是很慢啦！！只是不用重新下载数据集，强化学习的实验跑的真是太慢啦！！！！不过好在一般占显存不多，可以在自己电脑上调试完后，再用服务器跑啦\~）



（下面命令中多出来的是因为我在TD3+BC上改动了）

<img src="https://img2024.cnblogs.com/blog/3338811/202508/3338811-20250809155643149-494507439.png"  width="50%" height="50%">

祝科研顺利！

（有机会再写一写 Atari，dm-control 的配置过程，其实已经在服务器上配过一遍了，但是自己电脑上没有）


