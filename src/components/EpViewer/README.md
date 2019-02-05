EpViewer komponentti:

```vue

new Vue({
  data(){
    return {
      value: '<p><span class="math-tex">x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}</span></p>',
    }
  },
  template: `
    <div>
        <ep-viewer :value="value" />
    </div>
  `
})

```