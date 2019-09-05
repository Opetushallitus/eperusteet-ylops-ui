<template>
  <div>
    <ep-content-base
      :value="contentValue"
      :help="help"
      :layout="layout"
      :locale="locale"
      :opsId="opsId"
      :opsKasitteet="opsKasitteet"
      :isEditable="isEditable"
      :validation="validation"
      @input="handleContentChange" />
  </div>

</template>

<script lang="ts">

import { Component, Mixins, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import EpContentBase from '@/components/EpContentBase/EpContentBase.vue';
import EpValidation from '@/mixins/EpValidation';

import { EditorLayout, TermiDto } from '@/tyypit';
import { Kielet } from '@/stores/kieli';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

@Component({
  components: {
    EpContentBase,
  },
})
export default class EpContent extends Mixins(EpValidation) {
  @Prop({ default: true })
  private lokalisoitu!: boolean;

  @Prop({ required: true })
  private value!: string | object;

  // CkEditorin layout (määrittää editorin ominaisuudet)
  @Prop({ default: 'simplified' })
  private layout!: EditorLayout;

  @Prop({ default: false })
  private isEditable!: boolean;

  @Prop({ default: '' })
  private help!: string;

  get opsId() {
    return this.isOpsRoute ? _.get(Opetussuunnitelma, 'opetussuunnitelma.id', 0) : 0;
  }

  get isOpsRoute() {
    return this.$route && this.$route.matched.filter(r => r.name === 'opetussuunnitelma').length > 0;
  }

  get opsKasitteet() {
    const kieli = Kielet.getSisaltoKieli();
    const termisto = Opetussuunnitelma.kasitteet || [];

    // Muodostetaan käsitteistä map nykyisen sisältökielen tiedoilla
    return _.reduce((o, kasite) => {
      const title = _.get(kasite, `termi.${kieli}`, '');
      const content = _.get(kasite, `selitys.${kieli}`, '');
      const avain = _.get(kasite, 'avain', null);
      if (avain) {
        return {
          ...o,
          [avain]: { title, content },
        };
      }
      else {
        return {};
      }
    }, {} as any);
  }

  get locale() {
    return Kielet.getUiKieli();
  }

  get contentValue() {
    if (!this.value) {
      return '';
    }
    else if (this.lokalisoitu) {
      const kieli = Kielet.getSisaltoKieli();
      return (this.value as any)[kieli];
    }
    else {
      return this.value;
    }
  }

  private handleContentChange(content: string) {
    if (this.lokalisoitu) {
      const kieli = Kielet.getSisaltoKieli();
      const value = (_.isPlainObject(this.value) ? this.value : {}) as object;
      this.$emit('input', {
        ...value,
        [kieli]: content,
      });
    }
    else {
      this.$emit('input', content);
    }
  }
}

</script>
<style scoped lang="scss">

</style>
