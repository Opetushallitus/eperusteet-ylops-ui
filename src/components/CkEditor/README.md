CKEditor 5 komponentti:

```vue
const Tyypit = require('../../tyypit.ts');

new Vue({
  data(){
    return {
      layout: Tyypit.EditorLayout.normal,
      layoutMinimal:Tyypit.EditorLayout.minimal,
      layoutSimplified:Tyypit.EditorLayout.simplified,
      layoutNormal: Tyypit.EditorLayout.normal,
      value: 'Tekstiä',
    }
  },
  template: `
    <div>
        <p>
          <button @click="layout=layoutMinimal"><span v-if="layout==layoutMinimal">&gt;</span>Minimal</button>
          <button @click="layout=layoutSimplified"><span v-if="layout==layoutSimplified">&gt;</span>Simplified</button>
          <button @click="layout=layoutNormal"><span v-if="layout==layoutNormal">&gt;</span>Normal</button>
        </p>
        <ck-editor :layout="layout" :value="value" />
    </div>
  `
})
```