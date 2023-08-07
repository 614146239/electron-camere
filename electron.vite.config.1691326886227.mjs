// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import vue from "@vitejs/plugin-vue";
import { mediapipe } from "vite-plugin-mediapipe";
var __electron_vite_injected_dirname = "D:\\\u684C\u9762\u6587\u4EF6\\electron-camere";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve(__electron_vite_injected_dirname, "/src/renderer/src")
      }
    },
    plugins: [
      // 兼容底浏览器
      vue(),
      mediapipe({
        "face_mesh.js": ["FaceMesh"],
        "selfie_segmentation.js": ["SelfieSegmentation"]
      }),
      AutoImport({
        include: [
          /\.[tj]sx?$/,
          // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/
          // .vue
        ],
        resolvers: [ElementPlusResolver()]
        // 自动引入
        // imports: ['vue', 'pinia']
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ]
    // css: {
    //   postcss: {
    //     plugins: [
    //       postcsspxtoviewport({
    //         unitToConvert: 'px', // 要转化的单位
    //         viewportWidth: 800, // UI设计稿的宽度
    //         unitPrecision: 6, // 转换后的精度，即小数点位数
    //         propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
    //         viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
    //         fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
    //         selectorBlackList: ['ignore-'], // 指定不转换为视窗单位的类名，
    //         minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
    //         mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
    //         replace: true, // 是否转换后直接更换属性值
    //         // exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
    //         // exclude: [],
    //         landscape: false // 是否处理横屏情况
    //       })
    //     ]
    //   }
    // },
  }
});
export {
  electron_vite_config_default as default
};
