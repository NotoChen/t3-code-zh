# Contributing

感谢你帮助改进 T3 Code 中文界面（社区版）。

## 提交翻译

1. 在 `translations.js` 的 `window.__T3ZH_EXACT__` 中补充英文原文到中文的映射。
2. 不要翻译 Agent 输出、代码块、终端输出、Diff 内容或产品名/路径/命令。
3. 如果新增模板，请确保正则锚定完整字符串，避免把 `build` 中的 `d` 误替换成“天”这类问题。
4. 运行 `node tests/validate.cjs`。
5. 在 Pull Request 中附上截图和 T3 Code 版本。

## 版本兼容

当前主要适配 T3 Code Web `0.1.x`。T3 Code 大版本更新后，请先运行源码扫描或运行时扫描，确认新增文案后再补词条。
