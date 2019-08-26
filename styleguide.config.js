const path = require('path');

module.exports = {
  title: 'Default Style Guide',
  defaultExample: false,
  exampleMode: 'expand',
  usageMode: 'expand',
  sections: [{
    name: 'Components',
    description: '',
    components: [
      'src/components/EpCollapse/EpCollapse.vue',
      'src/components/EpButton/EpButton.vue',
      'src/components/EpPRefixList/EpPRefixList.vue',
      'src/components/EpSpinner/EpSpinner.vue',
      'src/components/EpKaanna/EpKaanna.vue',
      'src/components/EpInfo/EpInfo.vue',
      'src/components/EpIcon/EpIcon.vue',
      'src/components/EpLinkki.vue',
      'src/components/EpProgress.vue',
    ],
  }, {
    name: 'Form components',
    description: 'Custom form components',
    components: 'src/components/forms/Ep*.vue',
  }],
  require: [
    path.join(__dirname, 'config/styleguide.plugins.ts'),
  ],
}
