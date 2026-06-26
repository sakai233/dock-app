# Dock App

> 一个轻量级的 Windows 桌面悬浮图标管理器，让你的桌面更整洁、操作更高效。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white)](#)

## ✨ 功能特性

- **悬浮 Dock 栏**：顶部悬浮的毛玻璃效果 Dock 栏，美观优雅
- **自定义图标**：自由添加、删除、拖拽排序图标
- **快速启动**：一键打开应用程序、文件夹或网页
- **主题定制**：支持自定义颜色、透明度、模糊度、图标大小
- **流畅动画**：丰富的过渡动画和交互效果
- **自动隐藏**：鼠标移开后自动折叠，节省屏幕空间
- **滚轮切换**：鼠标滚轮快速切换图标
- **数据持久化**：配置和图标自动保存，启动即恢复

## 🖼️ 预览

Dock App 提供精美的毛玻璃效果和流畅的动画交互：

- 悬停图标放大上浮效果
- 面板平滑滑入滑出
- 新增/删除图标动画
- 弹性过渡曲线

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x（推荐 18.x 或 20.x LTS）
- Windows 系统（推荐 Windows 10/11）

### 安装依赖

```bash
npm install
```

> 如果 Electron 下载慢，可以设置国内镜像：
> ```bash
> $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
> $env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
> npm install
> ```

### 开发运行

```bash
npm start
```

### 打包构建

```bash
# 生成便携版 exe
npm run build

# 仅打包（不生成安装包）
npm run pack
```

构建产物将输出到 `dist/` 目录。

## 📖 使用说明

### 基本操作

| 操作 | 说明 |
|------|------|
| 鼠标悬停 Dock 栏 | 展开 Dock，显示图标 |
| 点击图标 | 启动对应的应用程序/路径/URL |
| 滚轮滚动 | 左右切换更多图标 |
| 拖拽图标 | 重新排列图标顺序 |
| 悬停图标 + 点击 × | 删除图标 |
| 点击 ⚙️ 设置按钮 | 打开设置面板 |
| 点击 ➕ 按钮 | 添加新图标 |

### 添加应用图标

1. 点击 Dock 栏右侧的 **➕** 按钮
2. 输入图标名称（可选，选择文件后自动填充）
3. 选择一个表情图标
4. 点击「📁 浏览」选择应用程序（.exe、.lnk 等）
5. 点击「添加」完成

### 个性化设置

点击 ⚙️ 按钮打开设置面板，可自定义：

- **主题颜色**：Dock 栏背景色
- **背景透明度**：0-100% 可调
- **毛玻璃模糊程度**：0-50px 可调
- **图标大小**：24-80px 可调

## 🏗️ 项目结构

```
dock-app/
├── index.html          # 主页面（UI 界面 + 前端逻辑）
├── main.js             # Electron 主进程
├── preload.js          # 预加载脚本（IPC 通信桥接）
├── package.json        # 项目配置
├── .gitignore          # Git 忽略规则
└── README.md           # 项目文档
```

### 核心模块

- **main.js**：窗口管理、文件读写、IPC 通信、文件选择对话框
- **index.html**：Dock UI 渲染、事件处理、动画效果
- **preload.js**：主进程与渲染进程之间的安全通信桥

## 🛠️ 技术栈

- **Electron 28** - 跨平台桌面应用框架
- **原生 JavaScript** - 无框架依赖，轻量高效
- **CSS3** - 毛玻璃、动画、过渡效果
- **HTML5** - 语义化结构

## 💾 数据存储

应用数据保存在系统用户数据目录：

- **设置配置**：`%APPDATA%/DockApp/settings.json`
- **图标数据**：`%APPDATA%/DockApp/icons.json`

## 📝 更新日志

### v1.0.0

- 🎉 初始版本发布
- ✨ 基础 Dock 悬浮栏功能
- 🎨 毛玻璃效果与主题定制
- 🖱️ 拖拽排序与滚轮切换
- ⚙️ 设置面板
- 🎬 丰富的过渡动画
- 📁 支持添加桌面应用图标

## 📄 许可证

MIT License © 2024

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受你的新 Dock 吧！** 🚀
