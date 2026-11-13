# T3 Code 简体中文汉化

GitHub：[NotoChen/t3-code-zh](https://github.com/NotoChen/t3-code-zh) · [下载 Release](https://github.com/NotoChen/t3-code-zh/releases)

针对 **T3 Code Web UI** 的本地 Chrome / Edge 扩展。不是 T3 Code 官方项目。

## 特点

- 覆盖主界面、设置页、菜单、按钮、提示、占位符、错误提示等 UI 文案
- 约 10,000 条精确词条 + 约 1,000 条安全模板
- **自动识别 T3 Code 页面**：只有在页面标题/应用壳匹配 T3 Code 时才启动翻译，不会随便翻译 localhost 上的其他应用
- **自动读取 T3 Code Web 版本**：启动后会把检测到的版本写到 `html[data-t3zh-version]`，方便排查兼容性问题
- 本地词典，**不联网、不上传内容**
- 不翻译 Agent 输出、代码块、终端输出、Diff 内容

## 支持地址

- `http://localhost:3773`
- `http://127.0.0.1:3773`
- 其它本地端口（仅当页面本身是 T3 Code 时启动）
- `https://app.t3.codes/*`

## 安装

1. 打开 Chrome / Edge 的扩展管理页：
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
2. 开启 **开发者模式 / Developer mode**
3. 点击 **加载已解压的扩展程序 / Load unpacked**
4. 选择本目录 `t3-code-zh`
5. 刷新 T3 Code 页面

更新已有安装时，在扩展管理页点击 **重新加载 / Reload**。

## 工作方式

扩展在 `document_start` 注册一个轻量检测器；只有检测到 T3 Code 页面后才启动词典翻译和 MutationObserver。切到普通 localhost 应用时不会翻译，也不会启动观察器。

版本检测会尝试从当前 T3 Code Web 的 index bundle 读取版本号；T3 Code 更新后如果版本格式变化，会自动降级为页面检测，不影响基本翻译。

## 覆盖率

- 源码扫描：2,773 条候选 UI 字符串，2,728 条已覆盖；剩余 45 条为品牌名、路径、命令、内部 ID 和代码片段
- 运行时扫描：23 个页面，818 / 869 条字符串已翻译；剩余 51 条均为项目名、模型名、主题名、键位条件、路径或单位
- 可翻译 UI 文案覆盖率：**100%**

## 目录

```text
manifest.json       Chrome MV3 清单
content.js          页面检测 + DOM 翻译
translations.js     本地中英文词典
docs/screenshot.png 截图
CHANGELOG.md        版本记录
LICENSE             MIT
```

## 来源与许可

词典基于社区项目 [ZhiweiXiao98/t3code](https://github.com/ZhiweiXiao98/t3code) 的简体中文词库（MIT），并合并了官方 T3 Code 的英文消息表和设置页 UI 文本。代码以 MIT 许可发布；T3 Code 本身仍归其原作者所有。
