CKEditor 5 komponentti:

```vue

new Vue({
  data(){
    return {
      value: 'Tekstiä',
    }
  },
  template: `
    <div>
        <ck-editor :isExtended="true" :value="value" />
    </div>
  `
})

```