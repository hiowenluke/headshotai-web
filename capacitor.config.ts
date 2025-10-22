import type { CapacitorConfig } from '@capacitor/cli';

// 可选：通过环境变量指定开发期外部服务器 (Live Reload)。
// 典型问题：真机 WebView 尝试访问旧端口 (如 8101) 导致 "Could not connect to the server"。
// 解决方式：明确告诉 Capacitor 使用当前 dev / preview 端口，而不是缓存的旧值。
//
// 支持的变量：
//   CAP_SERVER_URL  手动完整指定，如 http://192.168.2.61:5173
//   CAP_LIVE_HOST   与 CAP_LIVE_PORT 组合生成 (若未提供 CAP_SERVER_URL)。
//   CAP_LIVE_PORT   端口，默认取 VITE 端口 (5173)；预览可改 5174。
//   CAP_USE_LIVE_RELOAD=1 启用生成 config.server；生产打包请不要设置。

const useLive = process.env.CAP_USE_LIVE_RELOAD === '1';
const explicitUrl = process.env.CAP_SERVER_URL;
const liveHost = process.env.CAP_LIVE_HOST || process.env.HOST_DEV || '192.168.2.61';
const livePort = process.env.CAP_LIVE_PORT || process.env.VITE_PORT || '5173';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'headshot.aip.so',
  webDir: 'dist',
  ...(useLive ? {
    server: {
      // 若已提供完整 URL 则直接用；否则拼装。
      url: explicitUrl || `http://${liveHost}:${livePort}`,
      // iOS 允许 http (开发期)。生产用 https 时删除 cleartext。
      cleartext: true,
    }
  } : {})
};

export default config;
