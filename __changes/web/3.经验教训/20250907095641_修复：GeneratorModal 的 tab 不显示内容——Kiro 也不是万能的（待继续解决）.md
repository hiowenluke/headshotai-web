曲折的经历，记录一下。

需求：
```
重构 GeneratorModal，把每个 tab 创建组件，简化主文件。
```

一开始使用 VS Code Claude Sonnet 4 来重构，封装了几个组件，但是 GeneratorModal 不显示 tab 的内容，尝试解决了几次，还是搞不定。

于是 Kiro 上场，先尝试解决这问题，结果试了 2次，没有解决。

由于 Kiro 太贵（每次 5个 vibe 起步、每个 vibe $0.08，大约 $0.4，是 Github Copilot 的 10 倍），于是决定，撤销之前的重构，让 Kiro 来重构。

但是，Kiro 重构之后 （上一次提交，fffedb7f355eabdd80037addc935214da0e575e2），也存在同样的问题，tab 内容不显示。

于是回到 VS Code，换成 Sonnet 4，让它来解决这个问题。

在尝试了两次之后，并且告诉它换个思路之后，终于可以显示 tab 的内容了。

问题算是解决了一半。因为 1P 只显示了底部的按钮，上面的图片预览、upload 区域，都还是没有显示。