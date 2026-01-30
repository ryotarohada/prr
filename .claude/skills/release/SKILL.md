---
name: release
description: Release a new version to npm and create git tag
disable-model-invocation: true
allowed-tools: Bash, Read, Edit
---

# Release workflow

npm パッケージの新バージョンをリリースする手順。

## 手順

1. **バージョンをバンプ** (patch/minor/major から選択)
   ```bash
   npm version patch  # or minor, major
   ```

2. **display.ts のバージョンを更新**
   - `src/lib/display.ts` の `showVersion()` 関数内のバージョン番号を更新

3. **ビルド**
   ```bash
   pnpm build
   ```

4. **コミットを修正** (バージョン更新を含める)
   ```bash
   git add -A && git commit --amend --no-edit
   ```

5. **タグを正しいコミットに付け直す**
   ```bash
   # 現在のコミットハッシュを取得
   COMMIT=$(git rev-parse HEAD)
   VERSION=$(node -p "require('./package.json').version")

   # 古いタグを削除して新しいタグを作成
   git tag -d v$VERSION
   git tag v$VERSION $COMMIT
   ```

6. **npm に公開**
   ```bash
   npm publish --access public
   ```

7. **git push (タグ含む)**
   ```bash
   git push && git push origin v$VERSION
   ```

## 注意事項

- 公開前にユーザーの確認を得ること
- タグは `npm version` が作るものではなく、最終コミットに付けること
