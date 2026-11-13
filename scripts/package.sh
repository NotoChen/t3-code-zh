#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
VERSION="$(node -p "require('./manifest.json').version")"
rm -rf dist
mkdir -p dist
zip -r -X "dist/t3-code-zh-${VERSION}.zip" \
  manifest.json content.js translations.js icons README.md LICENSE CHANGELOG.md PRIVACY.md CONTRIBUTING.md SECURITY.md docs \
  -x '*.DS_Store'
echo "built dist/t3-code-zh-${VERSION}.zip"
