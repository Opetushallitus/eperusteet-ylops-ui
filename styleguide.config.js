const path = require("path");

module.exports = {
  title: 'ePerusteet Ylops lukio components',
  defaultExample: true,
  exampleMode: 'expand',
  usageMode: 'expand',
  pagePerSection: true,
  require: [
    path.join(__dirname, 'config/styleguide.plugins.ts')
  ],
  renderRootJsx: path.join(__dirname, 'config/styleguide.root.ts'),
  components: '',
  sections: [{
      name: 'Komponentit',
      components: 'src/components/**/[A-Z]*.vue'
  }],
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ],
    }
  },
}
