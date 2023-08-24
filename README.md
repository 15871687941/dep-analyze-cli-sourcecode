## 项目名称
dep-analyze-cli
## 项目说明
> dep-analyze-cli是一个命令行工具，用于分析使用nodejs开发的前后端项目依赖关系。并可以启动一个本地服务器，使用前端渲染库D3可视化展示依赖关系。

## 功能特点
+ 分析并输出当前项目生产环境依赖关系
+ 前端可视化展示当前项目生产环境依赖关系、是否存在循环依赖以及是否存在多个相同包名不同版本号的依赖等信息
+ 可以指定参数分析输出当前项目下任意依赖包的依赖关系

## 技术栈
+ prettier + eslint + lint-staged + husky
+ typescript + express + vue + D3
+ datastructure:graph

## 安装和使用
1. 在安装dep-analyze-cli工具之前，必须确保已经安装了[nodejs](https://nodejs.cn/download/)
2. 本项目已经发布到npm上，可以直接使用npm安装。
全局安装：<code>npm install dep-analyze-cli -g</code>
本地安装：<code>npm install dep-analyze-cli</code>
3. 全局安装方式，在windows下可以直接使用，在linux下必须要找到dep-analyze-cli路径，并将其链接到/usr/bin/下。
4. 本地安装方式，可以在当前项目控制台中输出./node_moduels/.bin/dep-analyze-cli使用该工具，也可以在package.json中构造命令脚本。
5. 使用方式
```
Usage: dep-analyze-cli [arguments] [options] 

Description:
  dep-analyze-cli can display the dependencies of a package and run a server to graphical display

Options:
  -h, --help     Display help information
  -p, --package  Specify a package name and also provide a version number
  -v, --version  Specify a version number and also provide a package name
  -d, --depth    Specify the depth of traversal 
  -j, --json     Specify the saved path of dependency information

Arguments:
  help           Display help information without any options
  analyze        Analyze the dependencies of a package. If no parameters are specified, the current project package will be analyzed by default

Examples:
  dep-analyze-cli help || dep-analyze-cli || dep-analyze-cli analyze -h       Display help information
  dep-analyze-cli runserver                                                   Run a server to graphically display dependency information of the current project package
  dep-analyze-cli analyze                                                     Display dependencies  of the current package and run a server
  dep-analyze-cli analyze -p=test -v=1.0.0                                    Display dependencies  of the package test@1.0.0
  dep-analyze-cli analyze -d=4                                                Display The first four levels dependency information of the current package with a server
  dep-analyze-cli analyze -j=./data/save.json                                 Save dependency information of the current package with a server
```
## 示例
[Ubuntu下演示视频]()
