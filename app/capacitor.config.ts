import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cs.digital.pass',
  appName: 'cs-digital-pass',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https'
  }  
};

export default config;
