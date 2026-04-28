// File: metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Trik alias untuk platform Web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-webview') {
    // Arahkan ke versi web jika dibuka di browser/PWA
    return context.resolveRequest(context, 'react-native-web-webview', platform);
  }
  // Biarkan normal jika dibuka di Android/iOS
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;