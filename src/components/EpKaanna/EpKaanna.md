EpKaanna komponentti:

```vue

new Vue({
  data(){
    return {
      value: {
        _id: 1,
        sv: 'sv',
      },
    }
  },
  template: `
    <div>
        <ep-kaanna :value="value" />
    </div>
  `
})

```
