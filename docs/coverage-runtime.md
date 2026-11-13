# T3 Code 扩展运行时覆盖率（最终）

审计对象：T3 Code 0.1.9 Web UI + `t3-code-zh` 1.0.0 词典  
审计方式：Playwright 实际打开 T3 Code，枚举页面可见文本、`placeholder`、`title`、`aria-label`、`alt`。

## 结果

| 口径 | 已翻译 | 总数 | 覆盖率 |
|---|---:|---:|---:|
| 全部运行时英文字符串 | 818 | 869 | **94.1%** |
| 可翻译 UI 文案（剔除项目名、模型名、主题名、快捷键条件、路径、单位） | 818 | 818 | **100%** |

剩余 51 条均为不可翻译或不应翻译项：

- 项目名：`curtain`、`ZangBai's Book`
- 模型名：`deepseek`、`MiniMax-M3`、`GLM-5.3`、`Kimi K3`、`GPT-6...`
- 主题名：`Grove`、`Ocean`、`Ember`、`Iris`
- 键位条件：`composerFocus`、`terminalFocus`、`rightPanelOpen && !terminalFocus`
- 路径/单位/技术词：`/Users/...`、`px`、`fps`、`Android`

源码级最终报告见 `t3-code-zh-source-coverage.md`。
