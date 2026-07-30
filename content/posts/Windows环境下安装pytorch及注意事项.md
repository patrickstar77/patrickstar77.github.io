---
title: "Windows环境下安装PyTorch及注意事项"
date: 2026-07-30T11:00:00+08:00
draft: false
slug: "windows-pytorch-installation"
description: "Windows环境安装GPU版PyTorch时的版本匹配、CUDA和环境配置注意事项。"
tags: ["PyTorch", "Windows", "CUDA"]
categories: ["环境配置"]
showToc: true
---

最近学习pytorch，在安装配置环境时花了很大功夫，实际上整件事情并不难，但是由于有很多细节比如版本匹配问题，可能会踩很多坑，从而浪费大量时间，故我在成功安装配置完pytorch后，写下一点总结，为后来者提供一些参考，使能够将更多的时间真正专注于科研上，而不必在安装配置上徒添烦恼。
# 一、大概流程
关于安装pytorch的教程很多，不过质量参差不齐，查阅了很多教程，这篇**“[2023最新pytorch安装（超详细版）](https://blog.csdn.net/weixin_44752340/article/details/130542629#:~:text=%E4%BB%8EPyTorch)”**非常详细具体，总体流程可完全参照这篇文章（此外推荐**B站“我是土堆”**的安装视频，非常细致）。整体环节如下：

安装Anaconda--> 是否有GPU？--> 安装CPU or GPU版pytorch

在安装pytorch前安装Anaconda是因为Anaconda可以解决pip带来的不同Python包之间的冲突问题，而且可以创建多个虚拟环境，方便管理，避免所有的包都安装在原生环境上。

安装CPU版和GPU版操作亦有所区别，如果不小心安装了CPU版本，还想继续安装GPU版本的话，可以再创建一个虚拟环境安装GPU版，CPU版可删可不删。

此外，（GPU版本）装好cuda toolkit后，还要安装cuDNN。cuda（Compute Unified Device Architecture），是NVIDIA支持GPU的通用并行计算架构，该架构使GPU能够解决复杂的计算问题。cuDNN是基于cuda的深度学习GPU加速库，有了它可以在GPU上完成高效的深度学习计算。注意和cuda版本匹配，[安装地址](https://developer.nvidia.com/cudnn-archive)

==本博客给出的是GPU版pytorch安装的一些问题，CPU版只看上面推荐教程就够了==


# 二、相关细节
## 1.版本对应问题  
有三个版本需要关注，==python版本、cuda版本、pytorch版本==。选择的时候需要相互匹配，不然可能安装失败或者运行时出bug。具体的版本对应关系可以参考其他博主的总结，这里提一些注意点。
> 关于版本对应关系，我的思路是：**先根据显卡驱动确定cuda版本，根据cuda可以确定pytorch版本，最后确定python版本**。这是确定版本的思路，安装过程跟着上面那篇博文里来就行。
* 安装Anaconda时可能会安装上最新版本的python，但是没关系，可以在创建虚拟环境时额外指定python版本，
` conda create –n 虚拟环境名字 python=版本`（这就是创建虚拟环境的命令）
比如你安装Anaconda附带的python是v3.12，可以在创建虚拟环境时使用` conda create –n pytorch python=3.8`，从而安装3.8版本。
* 如果有GPU，在win+r，cmd后输入nvidia-smi，可以看见
![](https://img2024.cnblogs.com/blog/3338811/202409/3338811-20240925105413331-415283056.png)
  > 原作者解释：上面的CUDA Version表示CUDA Driver版本就是11.6，即驱动所能支持的最大运行API版本就是11.6。我如果要安装CUDA Runtime（运行版本），要保证CUDA Driver 版本 >= CUDA Runtime 版本，也就是CUDA Runtime需要是11.6及以前的。  

  注意上面的CUDA Version（对应CUDA Driver版本），现在我们还要装一个CUDA Toolkit（也就是作者说的CUDA Runtime），当然电脑里可能已经有了，用`nvcc -V`可以查看；如果没有，可以直接[点击链接](https://developer.nvidia.com/cuda-toolkit-archive)去英伟达官网下载，并且会自动添加环境变量，下载时务必注意版本。此时再次nvcc -V应出现如下结果：
![](https://img2024.cnblogs.com/blog/3338811/202409/3338811-20240925110231577-841380011.png)
  > 有人遇到这样一种情况：电脑里已经有CUDA Toolkit了，但是nvcc -V查看不了，可能是因为没有添加环境变量，此时重新添加环境变量就好了。建议是直接重新下一个CUDA Toolkit，因为你可能根本找不到文件在哪。成功添加环境变量后是这样的：
![](https://img2024.cnblogs.com/blog/3338811/202409/3338811-20240925112053844-1728025535.png)

* 安装完cuda后，接着去[pytorch官网](https://pytorch.org/)选择对应版本(保持和CUDA Toolkit一样，比如CUDA Toolkit是11.3.58，那么pytorch就下载cu113后缀版本）下载pytorch。
![](https://img2024.cnblogs.com/blog/3338811/202504/3338811-20250402121207205-195731818.png)
比如其中一种下载链接
```
pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu117
```
这里的cu117就是指cuda11.7，说明这个pytorch版本与cuda11.7（即CUDA Toolkit 11.7）版本是匹配的！==这一点非常重要==！！！。

## 2.pytorch下载速率问题
上面通过官网下载pytorch很有可能网络连接超时等问题，这里提供另一种不用换国内源也能很快安装好的方法————**本地安装**。<br/> 

我们现在已经确定了pytorch的官方pip链接，比如上文中提到的这样一条官方下载链接：
```
pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu117
```
事实上需要下载的是三个包：**torch，torchvision，torchaudio**，因此你根据这个链接里的包以及对应的版本，直接网上去下载whl文件到本地，然后再本地安装。比如torch==1.13.1+cu117这个包对应的whl文件有：
![](https://img2024.cnblogs.com/blog/3338811/202409/3338811-20240925115418686-2020337644.png)

> （图片中有如cp38-cp38这样的字眼，可以理解成对应python3.8的意思）
这里给出这三个包的下载地址：
[torch](https://download.pytorch.org/whl/torch_stable.html)（这里面其实已经囊括了torch、torchaudio和torchvision）
[torchvision](https://download.pytorch.org/whl/torchvision)
[torchaudio](https://download.pytorch.org/whl/torchaudio)
实际上，当你足够熟悉后，在以后创建新的虚拟环境安装pytorch时，直接去上面下载地址里面找到你想要的版本就可以了，下的时候注意一下torch、torchaudio、torchvision的版本对应。
   
全部下载完后pip安装whl文件就行。  

这里以我配置的为例，版本情况：python3.8，cuda11.7，本地安装pytorch的代码是：
```
pip install torch-1.13.1+cu117-cp38-cp38-win_amd64.whl
pip install torchaudio-0.13.1+cu177-cp38-cp38-win_amd64.whl
pip install torchvision-0.14.1+cu117-cp38-cp38-win_amd64.whl
```
> install后面那一串就是下载好的文件的文件名。

接着再根据上面博文中的写的验证是否安装成功，便全部完成了。

> 本博客是对[该作者博文](https://blog.csdn.net/weixin_44752340/article/details/130542629#:~:text=%E4%BB%8EPyTorch)的一个补充，并直接援引了原博文的一些图片。该作者已经写的十分详细，但我自己安装的时候还是遇到了很多麻烦，故此在此总结。我只能说明我个人情况，诸位在安装时可能还会遇到别的莫名其妙的问题，恕我不能面面俱到。
