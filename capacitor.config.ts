import type { CapacitorConfig } from '@capacitor/cli';

// URL app đang chạy (HTTPS). Đổi giá trị này khi bạn deploy production rồi build lại APK.
// Tạm thời trỏ tới tunnel cloudflared của máy dev.
const SERVER_URL =
  process.env.CAP_SERVER_URL || 'https://res-para-dated-ken.trycloudflare.com';

const config: CapacitorConfig = {
  appId: 'com.sagrifood.hrm',
  appName: 'Sagri Cham Cong',
  webDir: 'capacitor-www',
  server: {
    url: SERVER_URL,
    cleartext: true,
    androidScheme: 'https',
  },
};

export default config;
