const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );

module.exports = {
  lintOnSave: false,

  // CKEditor 5 theme
  css: {
    loaderOptions: {
      postcss: styles.getPostCssConfig( {
        themeImporter: {
          themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
        },
        minify: true
      } )
    }
  },

  configureWebpack: {
    plugins: [
      new CKEditorWebpackPlugin( {
        language: 'fi',
        additionalLanguages: ['sv','en'],
      } )
    ],
  },

  // SVG pictures for CKEditor must be added via raw-loader
  chainWebpack: config => {
    config.module.rule('svg')
      .test( /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/ )
      .use( 'file-loader' )
      .loader( 'raw-loader' );
  },

  devServer: {
    overlay: {
      warnings: false,
      errors: true,
    },
    clientLogLevel: "none",
    port: 9040,
    proxy: {
      "/eperusteet-ylops-service": {
        target: process.env.NODE_ENV === "e2e" ? "http://app:8080" : "http://localhost:8080",
        secure: false
      }
    },
  }
};
