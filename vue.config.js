const servicePort = process.env.YLOPS_SERVICE_PORT || 8081;
const webpack = require('webpack');
const path = require('path');

module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/eperusteet-ylops-app/uusi/' : '/',
  runtimeCompiler: true,
  configureWebpack: {
    resolve: {
      alias: {
        vue: path.resolve(__dirname, 'node_modules/vue'),
        '@shared': path.resolve(__dirname, 'node_modules/eperusteet-frontend-utils/vue/src'),
      },
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
  },
  devServer: {
    overlay: {
      warnings: false,
      errors: true,
    },
    clientLogLevel: 'none',
    host: '0.0.0.0',
    port: 9040,
    proxy: {
      '/eperusteet-ylops-service': {
        target: process.env.NODE_ENV === 'e2e' ? 'http://app:8080' : 'http://localhost:' + servicePort,
        secure: false,
      },
      '/virkailija-raamit': {
        target: process.env.NODE_ENV === 'e2e' ? 'http://app:8080' : 'http://localhost:' + servicePort,
        secure: false,
      },
    },
  },
};
