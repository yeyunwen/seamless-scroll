---
"@seamless-scroll/core": patch
"@seamless-scroll/react": patch
"@seamless-scroll/shared": patch
"@seamless-scroll/vue": patch
---

fix: 通过支持以函数获取 dom 的方式解决 core 包无法活动最新 dom 的问题，通过 setObserver 和 clearObeserver 解决 Observer观察无效 dom 的问题
