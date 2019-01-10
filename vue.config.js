const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {

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
      .test( /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/ )
      .use( 'file-loader' )
      .loader( 'raw-loader' );
  },

  devServer: {
    port: 9040,
    proxy: {
      "/eperusteet-ylops-service": {
        target: "http://localhost:8080",
        secure: false
      }
    }
  }
}
