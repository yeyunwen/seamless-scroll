# 发布流程

项目使用 Changesets 管理版本和变更日志，使用 GitHub Actions 发布预览包和正式 npm 包。

## 功能 PR

每个会影响 npm 包的功能或修复 PR 都需要带一个 changeset 文件。纯文档、示例或内部维护改动可以不带 changeset。

创建 changeset 时按 semver 选择版本级别：

- `patch`：兼容的 bug fix。
- `minor`：新增兼容能力或公开 API。
- `major`：不兼容变更。

## 预览包

分支 push 或创建 PR 后，`ci` workflow 会执行构建，并通过 `pkg-pr-new` 发布预览包。

预览包只用于测试，不会更新 npm 的正式版本。安装方式以 GitHub Actions 日志或 PR 评论中的 `pkg-pr-new` 输出为准。

## 正式发布

功能 PR 合并到 `main` 后，`Release` workflow 会读取 `main` 上尚未消费的 changeset，并创建或更新同一个 `Version Packages` PR。

如果多个功能需要一起发版，不要急着合并 `Version Packages` PR。等相关功能 PR 都合并后，`Version Packages` PR 会自动累积这些 changeset，并统一更新版本号和 changelog。

确认版本号和 changelog 后，合并 `Version Packages` PR。合并后 `Release` workflow 会执行 `pnpm release`，发布正式 npm 包。

## Trusted Publishing

正式发布使用 npm Trusted Publishing，不使用长期 `NPM_TOKEN`。

在 npm 后台为以下包配置 Trusted Publisher：

- `@seamless-scroll/core`
- `@seamless-scroll/react`
- `@seamless-scroll/vue`
- `@seamless-scroll/shared`

配置时选择 GitHub 仓库 `yeyunwen/seamless-scroll`，workflow 文件填写 `release.yml`。该文件在仓库中的路径是 `.github/workflows/release.yml`。

合并 `Version Packages` PR 前，需要先确认 npm Trusted Publishing 已配置完成。
