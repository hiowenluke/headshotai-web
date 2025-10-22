# 我

当前用户（id 112327427190669663663）上传的 faces 图片已经被全部删除，客户端 FaceThumbBar 还是会显示这些图片，虽然显示的是找不到图片的错误。



# Codex

。。。

已经把“服务器端已无数据但缩略条仍显示 404 图”的问题处理好，方式是让服务端返回空列表时视为权威结果，立即清掉本地缓存与 UI 列表。

## actions taken

- 更新 [FaceUploadController.vue](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) 的 `syncRecentUploads`：当 [authState.recentFaces](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) 为空且本地仍有旧缩略图时，调用 `clearAllUploads({ clearCache: true })`，同步清理 `uploadedPhotos` 与 `recent_faces_cache`，避免再回显失效图片。只有在本地本来就为空时才回退到缓存加载（用于网络/API 异常场景）。
- 运行 `npm run build` 验证代码通过 TypeScript 检查和构建。

## quality gates

- Build: PASS (`npm run build`)

## requirements coverage

- 服务器端所有 faces 删除后，缩略栏不再显示旧缓存、不会出现找不到图片的错误提示：Done

如需把这个逻辑同步到其他入口或补充自动化测试，聊一句我就跟进。

