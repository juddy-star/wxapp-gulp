# wxapp-gulp 微信小程序的 gulp 编译工具

## features

- 支持内嵌 mpvue 配置
- 支持黑白名单配置
- 提供 watch, build2, mpvue 3种模式
- mpvue 的编译可插拔

## 命令

```js
gulp watch 开发模式，热更新 (不监听 mpvue 文件，直接使用 mpvue 的 distDll)

gulp watch --mpvue 开发模式，热更新 （监听 mpvue）

gulp build 生产模式 （不编译 mpvue，直接使用 mpvue 的 distDll）

gulp build --mpvue 生产模式 （编译 mpvue）

gulp mpvue 编译 mpvue，输出到 distDll 文件夹下（作为动态链接库使用）
```

## 目录 example

```js
├── gulpfile.js           ---------gulp入口
├── mpvue                 ---------mpvue的目录
│   └── distDll           ---------mpvue打包成dll存放目录
├── scripts               ---------gulp编译工具目录
│   ├── build.js          ---------build模式
│   ├── index.js          ---------入口
│   ├── legalList.js      ---------黑白名单配置
│   ├── mpvue.js          ---------mpvue模式
│   ├── utils.js          ---------工具类
│   └── watch.js          ---------watch模式
└── src                   ---------小程序源文件
```