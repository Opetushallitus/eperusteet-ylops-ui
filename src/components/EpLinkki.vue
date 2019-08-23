<template lang="pug">
div.linkki
  a(:href="url") {{ cleanUrl }}
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import _ from 'lodash';

@Component
export default class EpLinkki extends Vue {
  @Prop()
  private url!: string;

  @Prop({
    required: false,
  })
  private label!: string;

  @Prop({
    default: true,
  })
  private onlyTopLevel!: boolean;

  get cleanUrl() {
    let result = this.url
      ? (this.url.replace(/^https?:\/\//, ''))
      : '';

    if (this.onlyTopLevel) {
      const idx = result.indexOf('/');
      if (idx > 0) {
        result = result.substr(0, idx);
      }
    }
    return result;
  }
}
</script>

<style scoped lang="scss">
.linkki {
  font-size: small;

  a {
    color: black;
  }
}
</style>

