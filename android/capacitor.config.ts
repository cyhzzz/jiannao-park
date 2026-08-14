import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jiannao.brain',
  appName: '健脑乐园',
  webDir: '../www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#f4f6f9',
      showSpinner: false,
    },
  },
};

export default config;
