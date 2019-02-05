const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

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

  // SVG pictures for CKEditor must be added via raw-loader
  chainWebpack: config => {
    config.module.rule('svg')
      .test( /(ckeditor5-[^/\\]+|CkEditor)[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/ )
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
        target: "http://localhost:8080",
        secure: false
      }
    },
  }
};
