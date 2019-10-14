```vue
<template>
  <div>
    <ep-kaanna :value="value" />
  </div>
</template>

<script>
import { i18n } from '@shared/stores/kieli';

export default {
  i18n,
  data() {
    return {
      value: {
        _id: 1,
        sv: 'sv',
      },
    }
  },
}
</script>

```
