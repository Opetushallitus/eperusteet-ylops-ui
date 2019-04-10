const { styles } = require('@ckeditor/ckeditor5-dev-utils');
const servicePort = process.env.YLOPS_SERVICE_PORT || 8080;

module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/eperusteet-ylops-app/uusi/' : '/',
  css: {
    loaderOptions: {
      postcss: styles.getPostCssConfig({
        themeImporter: {
          themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
        },
        minify: true,
      }),
    },
  },
  chainWebpack: config => {
    // Aiheuttaa varoituksia ilman asetusta
    config.optimization.providedExports(process.env.NODE_ENV === 'production');
  },
  devServer: {
    overlay: {
      warnings: false,
      errors: true,
    },
    clientLogLevel: 'none',
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
