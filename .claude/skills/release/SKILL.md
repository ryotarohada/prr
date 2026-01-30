---
name: release
description: Release a new version to npm and create git tag
disable-model-invocation: true
allowed-tools: Bash, Read, Edit
---

# Release workflow

Release a new npm package version.

## Steps

1. **Bump version** (choose patch/minor/major)

   ```bash
   npm version patch  # or minor, major
   ```

2. **Update version in display.ts**
   - Update version number in `showVersion()` function in `src/lib/display.ts`

3. **Build**

   ```bash
   pnpm build
   ```

4. **Amend commit** (include version update)

   ```bash
   git add -A && git commit --amend --no-edit
   ```

5. **Re-tag to correct commit**

   ```bash
   COMMIT=$(git rev-parse HEAD)
   VERSION=$(node -p "require('./package.json').version")
   git tag -d v$VERSION
   git tag v$VERSION $COMMIT
   ```

6. **Publish to npm**

   ```bash
   npm publish --access public
   ```

7. **Push to git (with tags)**

   ```bash
   git push && git push origin v$VERSION
   ```

## Notes

- Get user confirmation before publishing
- Tag the final commit, not the one created by `npm version`
