上一次封装之后，出现了布局错误的问题，并且修复了多次，也没有解决，如下:

第一次：这次代码调整，导致了中间大图的位置错误，请看图。
第二次：iPhone 上的布局正常了，但是 macOS Chrome 里的布局还是一样的错误。
第三次：不对。这个问题是在封装了 AdaptivePreviewArea.vue 之后才出现的。你应该对比一下当时的代码，找到真正的原因。

。。。

第六次：还还是一样的问题。

这样，你先恢复到 封装 adaptivePreviewArea.vue 之前的代码，然后重新封装这个文件。这次重新封装，要非常小心，避免产生现在这样的位置错误的问题。

第七次：（发现是自己搞错了）

还是一样的问题。

这个问题是封装 UploadWithDemo.vue 造成的。那么，你先回退到封装 UploadWithDemo.vue 之前的代码，然后重新封装这个文件。

...

第十次：

还是一样的问题。我回退到了封装 UploadWithDemo.vue 之前的代码。现在界面没有问题，AdaptivePreviewArea.vue 也没有问题，因此不要修改它。

请重新封装 UploadWithDemo.vue。

需求：
灰色区域内，把按钮”+“、文字”Upload...“和缩略图（带有demo），封装为组件，命名名为 UploadWithDemo.vue，放到 components 下的 upload 子文件夹下。

注意：
- 文字”Upload...“的内容，需要作为参数传入。
- 缩略图固定为4个，图片的 url 需要作为参数传入。

重要：
这是第二次封装，要小心修改代码，要完全复制目前的逻辑，不要遗漏，不要改变代码逻辑，以避免上次封装而造成的界面布局错误的问题。

ChatGPT 5：

已集成 UploadWithDemo 组件并替换原内联上传块，保持原类名与布局测量逻辑；calcPreviewSize 现在解析子组件 rootEl；新增 handleFilesFromChild 处理子组件文件列表；保留原 handleFiles 以防仍有引用。未出现编译错误。需要时可删除已不再使用的 hidden-file-input / fileInputRef 相关代码（现组件内部处理）。若要进一步精简告诉我。