/// <reference types="vitest" />

// Vite 插件导入
import vue from '@vitejs/plugin-vue'
// Node.js 模块导入
import path from 'path'
import os from 'os'
import { defineConfig, loadEnv } from 'vite'

// Vite 配置 - https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // 获取本地网络接口 IP 地址
  const localIPs = Object.values(os.networkInterfaces())
    .flat()
    .filter((i: any) => i && !i.internal && i.family === 'IPv4')
    .map((i: any) => i.address)

  // 构建预览模式允许的主机列表
  const PREVIEW_ALLOWED_SET = new Set<string>([
    'localhost',
    '127.0.0.1',
    env.HOST_DEV,      // 开发环境主机
    env.HOST_PREVIEW,  // 预览环境主机
    env.HOST_PROD,     // 生产环境主机
    // 确保隧道域名即便环境变量未载入也可访问
    'ooo.natappvip.cc',
    'webnative.natappvip.cc',
    ...localIPs        // 本地网络 IP
  ].filter(Boolean))

  const PREVIEW_ALLOWED = Array.from(PREVIEW_ALLOWED_SET)

  // 非 CI 环境下输出允许的主机列表
  if (!process.env.CI) {
    // eslint-disable-next-line no-console
    console.log('[vite] 预览模式允许的主机 =', PREVIEW_ALLOWED)
  }

  return {
    // 插件配置
    plugins: [vue()],

    // 指定index.html位置
    root: './public',

    // 静态资源目录（相对于 root）
    // 由于 root 已经是 public，我们需要明确指定静态资源的位置
    publicDir: path.resolve(__dirname, './public'),

    // 路径解析配置
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '/src': path.resolve(__dirname, './src')
      }
    },

    // 构建优化配置
    build: {
      target: 'es2020', // 现代浏览器目标，支持更多ES特性
      outDir: '../dist', // 输出到项目根目录的dist
      emptyOutDir: true, // 构建前清空输出目录

      // 代码分割优化
      cssCodeSplit: true, // CSS 代码分割

      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // 生产环境移除 console
          drop_debugger: true,
          pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
        }
      },

      // Chunk 大小警告阈值
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'public/index.html')
        },
        output: {
          // 入口文件命名
          entryFileNames: 'assets/app.[hash].js',

          // Chunk 文件命名（懒加载路由）
          chunkFileNames: (chunkInfo) => {
            // 路由懒加载文件使用 route- 前缀
            if (chunkInfo.name.includes('views') || chunkInfo.name.includes('pages')) {
              return 'assets/route-[name].[hash].js';
            }
            return 'assets/[name].[hash].js';
          },

          // CSS 文件命名
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/[name].[hash].css';
            }
            return 'assets/[name].[hash].[ext]';
          },

          // 手动分包策略
          manualChunks: (id) => {
            // 第三方依赖 - 长缓存
            if (id.includes('node_modules')) {
              // Ionic 框架单独分包
              if (id.includes('@ionic/vue') || id.includes('@ionic/core')) {
                return 'vendor-ionic';
              }

              // Vue 核心库单独分包
              if (id.includes('vue') && !id.includes('@ionic')) {
                return 'vendor-vue';
              }

              // 图标库已移除，现在使用自定义 SVG

              // Axios 单独分包
              if (id.includes('axios')) {
                return 'vendor-axios';
              }

              // 其他第三方库
              return 'vendor-libs';
            }

            // 业务代码分包
            // Composables 分包
            if (id.includes('/composables/')) {
              return 'composables';
            }

            // Services 分包
            if (id.includes('/services/')) {
              return 'services';
            }

            // Components 分包（非页面级）
            if (id.includes('/components/') && !id.includes('/pages/')) {
              return 'components';
            }

            // Utils 分包
            if (id.includes('/utils/')) {
              return 'utils';
            }
          }
        }
      },

      // 确保静态文件被复制
      copyPublicDir: true
    },

    // 预览服务器配置
    preview: {
      host: true,
      port: 5174,
      allowedHosts: PREVIEW_ALLOWED,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5010',
          changeOrigin: true
        },
        // 只代理 demo 图片到后端，不代理 icons 等前端静态资源
        '/images/demo': {
          target: 'http://127.0.0.1:5010',
          changeOrigin: true
        },
        // 代理用户上传的图片
        '/upload': {
          target: 'http://127.0.0.1:5010',
          changeOrigin: true
        }
      }
    },

    // 测试配置
    test: {
      globals: true,
      environment: 'jsdom'
    },

    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': 'http://127.0.0.1:5010',  // API 代理到本地后端
        // 只代理 demo 图片到后端，不代理 icons 等前端静态资源
        '/images/demo': {
          target: 'http://127.0.0.1:5010',
          changeOrigin: true
        },
        // 代理用户上传的图片
        '/upload': {
          target: 'http://127.0.0.1:5010',
          changeOrigin: true
        }
      },
    },

    // 构建基础路径
    base: './'
  }
})
