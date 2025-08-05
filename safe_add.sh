#!/bin/bash

echo "🔍 ステージ予定の変更ファイル一覧:"
git status --short

echo ""
read -p "⚠️ 本当にステージしてよい内容ですか？ (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "🛑 git add を中止しました。ファイルを確認してください。"
  exit 1
fi

echo ""
read -p "📜 差分を表示して確認しますか？ (yes/no): " show_diff
if [ "$show_diff" == "yes" ]; then
  git diff
  echo ""
  read -p "差分を確認しましたか？続けてもいいですか？ (yes/no): " confirm_diff
  if [ "$confirm_diff" != "yes" ]; then
    echo "🛑 git add を中止しました。"
    exit 1
  fi
fi

# 危険な文字列チェック
echo ""
echo "🔎 コード内の危険な記述（console.log や TODO など）をチェック中..."
dangerous_patterns=("console.log" "debugger" "print(" "TODO" "FIXME")
flag=0

for file in $(git diff --name-only); do
  for pattern in "${dangerous_patterns[@]}"; do
    if grep -q "$pattern" "$file"; then
      echo "⚠️ $file に '$pattern' が含まれています"
      flag=1
    fi
  done
done

if [ "$flag" -eq 1 ]; then
  echo "🛑 問題が見つかりました。修正してから再実行してください。"
  exit 1
fi

# git add 実行
echo ""
read -p "✅ 問題なければ git add を実行しますか？ (yes/no): " add_confirm
if [ "$add_confirm" == "yes" ]; then
  git add .
  echo "✅ git add を実行しました"
else
  echo "🛑 git add は実行されませんでした。"
fi
