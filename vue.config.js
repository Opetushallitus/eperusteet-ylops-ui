const servicePort = process.env.YLOPS_SERVICE_PORT || 8081;
const webpack = require('webpack');

module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/eperusteet-ylops-app/uusi/' : '/',
  runtimeCompiler: true,
  configureWebpack: {
    /*optimization: {
      providedExports: process.env.NODE_ENV === 'production', // https://github.com/vuejs/vue-cli/issues/1708
    },*/
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
