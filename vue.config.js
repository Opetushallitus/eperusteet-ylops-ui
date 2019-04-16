const { styles } = require('@ckeditor/ckeditor5-dev-utils');
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const path = require('path');

const servicePort = process.env.YLOPS_SERVICE_PORT || 8080;

module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/eperusteet-ylops-app/uusi/' : '/',
  transpileDependencies: [/ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/],
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
  configureWebpack: {
    optimization: {
      providedExports: process.env.NODE_ENV === 'production',
    },
    plugins: [
      new CKEditorWebpackPlugin({
        // ISO 639-1
        language: 'fi',
        additionalLanguages: ['sv', 'en'],
        verbose: process.env.NODE_ENV === 'production',
      })
    ]
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg');
    svgRule.include.add(path.join(__dirname, '/public'));
    svgRule.include.add(path.join(__dirname, '/src'));

    config.module
      .rule('cke-svg')
      .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
      .use('raw-loader')
      .loader('raw-loader');
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
