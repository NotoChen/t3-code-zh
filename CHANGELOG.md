# Changelog

## 1.1.3

- Formalize the extension name as `T3 Code 中文界面（社区版）` and clarify that it is an unofficial community project.

## 1.1.2

- Replace the placeholder “中” icon with the official T3 Code app icon assets from the upstream MIT project.

## 1.1.1

- Add 16/32/48/128 extension icons and toolbar action metadata.
- Add `homepage_url`, `author`, `short_name`, and minimum Chrome version to the manifest.
- Add privacy policy, contributing guide, security policy, validation tests, packaging script, and GitHub Actions CI.
- Expand README with installation, compatibility, permissions, privacy, troubleshooting, acknowledgements, and license sections.

## 1.1.0

- Add automatic T3 Code page detection; the extension no longer starts translating on unrelated localhost apps.
- Detect the T3 Code web bundle version and expose it as `data-t3zh-version`.
- Keep the existing source-scan and runtime coverage reports.

## 1.0.0

- First public release.
- Source-level dictionary generated from the official T3 Code v0.1.9 source and community zh-CN catalog.
- Source coverage: 2,728 / 2,773 candidate strings; all remaining 45 items are non-UI brand/path/command/internal-ID fragments.
- Runtime coverage: 818 / 869 strings; all remaining 51 items are project/model/theme/keybinding/path/unit names.
