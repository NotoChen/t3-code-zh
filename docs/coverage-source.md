# T3 Code 源码级覆盖率扫描（最终）

## 扫描对象

- 官方源码：`pingdotgg/t3code` 标签 `v0.1.9`
- 扫描目录：`apps/web/src`
- 文件数：1,906 个 `.ts` / `.tsx` 文件（排除 tests、fixtures、stories、`*.d.ts`）
- 解析方式：Babel AST
  - `JSXText`（标签内文本）
  - 文本属性：`label`、`title`、`description`、`placeholder`、`aria-label`、`alt` 等
  - 文本对象字段和静态模板字符串
- 过滤：排除 className、CSS 变量、SVG path、路径、URL、内部 action id、命令、代码表达式、测试数据等

## 最终统计

| 指标 | 数值 |
|---|---:|
| 源码候选 UI 字符串 | **2,773** |
| 词典已覆盖 | **2,728** |
| 未覆盖 | **45** |
| 可翻译 UI 文案覆盖率 | **100%**（45 条均为品牌名/路径/命令/内部 ID/代码片段） |
| 全量候选覆盖率 | **98.4%** |

## 运行时验证

在同一词典下，用 Playwright 扫描 23 个页面：

| 指标 | 数值 |
|---|---:|
| 运行时唯一字符串 | 869 |
| 已翻译 | 818 |
| 未翻译 | 51（项目名、模型名、主题名、快捷键条件、路径、单位） |
| 全量运行时覆盖率 | **94.1%** |
| 可翻译 UI 文案覆盖率 | **100%** |

## 说明

- 45 条源码未覆盖项不是待翻译 UI 文案，例如：
  - 品牌名：`T3 Code`、`T3 Chat`、`T3 Connect`、`Claude Code`
  - 模型名：`GPT-6`、`MiniMax-M3`、`GLM-5.3`
  - 路径/命令：`/Users/...`、`git clone`、`t3 auth pairing create`
  - 内部 ID：`web:cloud:...`、`environment-data:...`
  - JSX 片段：`left)`、`rows)`、`open ·`
- 因此“全量候选覆盖率 98.4%”不是翻译缺失 45 条用户可见文案；按可翻译 UI 口径为 100%。
- 扫描范围仍然只覆盖 `apps/web/src`；`packages/*` 和服务端返回文案未纳入这份分母。
- 源码扫描与 Playwright 运行时扫描职责不同：前者判断全量词条覆盖，后者验证真实渲染和 React 拆分。
