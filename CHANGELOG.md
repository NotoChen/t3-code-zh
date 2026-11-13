# Changelog

## 1.1.0

- Add automatic T3 Code page detection; the extension no longer starts translating on unrelated localhost apps.
- Detect the T3 Code web bundle version and expose it as `data-t3zh-version`.
- Keep the existing source-scan and runtime coverage reports.

## 1.0.0

- First public release.
- Source-level dictionary generated from the official T3 Code v0.1.9 source and community zh-CN catalog.
- Source coverage: 2,728 / 2,773 candidate strings; all remaining 45 items are non-UI brand/path/command/internal-ID fragments.
- Runtime coverage: 818 / 869 strings; all remaining 51 items are project/model/theme/keybinding/path/unit names.
