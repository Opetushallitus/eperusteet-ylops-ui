<template>
<div v-if="hasContent">
  <!-- Lokalisoitu teksti-->
  <div v-html="$kaanna(value)">
  </div>
</div>
<div v-else>
  <slot>
    <div class="btn-group btn-group-sm float-right" ref="buttons" role="group">
      <button class="btn btn-link" v-for="l in availableLocales" :key="l" @click="selectedLocale = l">{{ l }}</button>
    </div>
    <b-tooltip :target="() => $refs['buttons']" :title="$t('sisalto-naytetaan-kielella', { kieli: availableLocale })">
    </b-tooltip>
  </slot>
  <!-- Lokalisoitu teksti-->
  <div v-if="availableLocale" v-html="value[availableLocale]" />
</div>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import { Kielet } from '@shared/stores/kieli';
import { Kieli } from '@/tyypit';


@Component
export default class EpKaanna extends Vue {
  @Prop()
  private value!: object;

  private selectedLocale: Kieli = this.sisaltoKieli;

  get sisaltoKieli(): Kieli {
    return Kielet.getSisaltoKieli();
  }

  get availableLocales(): string[] {
    const availableLocales: any[] = [];

    if (this.value != null) {
      const value = this.value;
      const locale = Kielet.getSisaltoKieli();

      _.forOwn(value, (text, key) => {
        if (!_.startsWith(key, '_') && !_.isEmpty(text)) {
          availableLocales.push(key);
        }
      });
    }

    return availableLocales;
  }

  get availableLocale(): Kieli | null {
    if (this.availableLocales.length > 0) {
      if (_.includes(this.availableLocales, this.selectedLocale)) {
        return this.selectedLocale;
      }
      else {
        return this.availableLocales[0] as Kieli;
      }
    }

    return null;
  }

  get hasContent(): boolean {
    return _.includes(this.availableLocales, this.sisaltoKieli);
  }
}

</script>

<style scoped lang="scss">

button {
  color: #495057;
}

</style>
