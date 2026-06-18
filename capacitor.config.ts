import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'website.forclients.bulsa',
  appName: 'Bulsa',
  webDir: 'dist',
  plugins: {
    SplashScreen: { launchAutoHide: true, backgroundColor: '#F0F5F6' },
    StatusBar: { style: 'LIGHT', backgroundColor: '#F0F5F6' },
    LocalNotifications: {
      iconColor: '#2878A9',
      presentationOptions: ['badge', 'sound', 'banner', 'list'],
    },
  },
};

export default config;
