<template lang="pug">

div(v-if="hasContent")
  // Lokalisoitu teksti
  div(v-html="$kaanna(value)")

div(v-else)
  slot
    div.btn-group.btn-group-sm.float-right(ref="buttons", role="group")
      button.btn.btn-link(
        v-for="l in availableLocales",
        :key="l",
        @click="selectedLocale = l") {{ l }}
    b-tooltip(
      :target="() => $refs.buttons",
      :title="$t('sisalto-naytetaan-kielella',{ kieli: availableLocale })")

  // Lokalisoitu teksti
  div(v-html="value[availableLocale]")

</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import { Kielet } from '@/stores/kieli';
import { Kieli } from '@/tyypit';

@Component({
  name: 'EpKaanna',
})
export default class EpKaanna extends Vue {
  @Prop()
  private value!: object;

  private selectedLocale: Kieli = this.sisaltoKieli;

  get availableLocale() {
    if (this.availableLocales.length > 0) {
      if (_.includes(this.availableLocales, this.selectedLocale)) {
        return this.selectedLocale;
      }
      else {
        return this.availableLocales[0];
      }
    }
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli();
  }

  get hasContent() {
    return _.includes(this.availableLocales, this.sisaltoKieli);
  }

  get availableLocales() {
    const availableLocales: any[] = [];

    if (this.value != null) {
      const value = this.value;
      const locale = Kielet.getSisaltoKieli();

      _.forOwn(value, (text, key) => {
        if (!_.startsWith(key, '_') && !_.isEmpty(text)) {
          availableLocales.push(key)
        }
      });
    }

    return availableLocales;
  }
}

</script>

<style scoped lang="scss">

button {
  color: #495057;
}

</style>
