const path = require("path");

module.exports = {
  // set your styleguidist configuration here
  title: 'Default Style Guide',
  defaultExample: true,

  require: [
    path.join(__dirname, 'config/styleguide.plugins.ts')
  ],

  renderRootJsx: path.join(__dirname, 'config/styleguide.root.ts')
  // components: 'src/components/**/[A-Z]*.vue',
  // sections: [
  //   {
  //     name: 'First Section',
  //     components: 'src/components/**/[A-Z]*.vue'
  //   }
  // ],
  // webpackConfig: {
  //   // custom config goes here
  // }
}
