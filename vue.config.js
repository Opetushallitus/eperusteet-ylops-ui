const eperusteetServicePort = process.env.EPERUSTEET_SERVICE_PORT || 8080;
const servicePort = process.env.YLOPS_SERVICE_PORT || 8081;
const webpack = require('webpack');
const path = require('path');

module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/eperusteet-ylops-app/' : '/',
  runtimeCompiler: true,
  transpileDependencies: ['vue-clamp', 'resize-detector'],
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        'vue-i18n$': path.resolve(__dirname, 'node_modules/vue-i18n'),
        '@shared': path.resolve(__dirname, 'eperusteet-frontend-utils/vue/src'),
        '@assets': path.resolve(__dirname, 'eperusteet-frontend-utils/vue/public'),

      },
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
  },
  chainWebpack: config => {
    // enabloidaan sourcemap ja nimetään "oikeat" vuen scirpti-tiedostot uudelleen, jotta löytyy selaimen devtoolsissa helpommin
    // esim. RouteRoot.vue?bf9d -> RouteRoot.vue?script
    if (process.env.USE_SOURCEMAP) {
      config.devtool('source-map');
      config.output.devtoolModuleFilenameTemplate(info => {
        if (info.resourcePath.endsWith('.vue')) {
          if (info.query.startsWith('?vue&type=script') && !info.allLoaders.includes('babel')) {
            return `src://${info.resourcePath}?script`;
          }
        }
      });
    }
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
      '/eperusteet-service': {
        target: process.env.NODE_ENV === 'e2e' ? 'http://app:8080' : 'http://localhost:' + eperusteetServicePort,
        secure: false,
      },
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
