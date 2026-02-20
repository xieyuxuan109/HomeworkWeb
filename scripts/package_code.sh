#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_NAME="HomeworkWeb_code_bundle.zip"
OUTPUT_PATH="$ROOT_DIR/$OUTPUT_NAME"

cd "$ROOT_DIR"

# 仅打包源码，排除构建产物与版本控制目录
zip -r "$OUTPUT_PATH" \
  HomeworkSystem \
  frontend-03 \
  README.MD \
  -x "*/.git/*" "*/node_modules/*" "*/dist/*" "*/bin/*" "*/tmp/*" "*.DS_Store"

echo "打包完成: $OUTPUT_PATH"
