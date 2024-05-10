<template>
  <div class="mt-4">
    <slot name="header">
      <h3 v-if="perusteObject">{{ $kaanna(perusteObject[otsikko]) }}</h3>
    </slot>
    <ep-collapse tyyppi="perusteteksti" :border-bottom="false" :border-top="false" :expanded-by-default="perusteTekstiAvattu" v-if="perusteObject && perusteObject[teksti]">
      <template v-slot:header><h4>{{$t('perusteen-teksti')}}</h4></template>
      <span v-html="$kaanna(perusteObject[teksti])"></span>
    </ep-collapse>

    <ep-collapse class="mb-4" :use-padding="false" tyyppi="pohjateksti" :border-bottom="false" :border-top="false" :expanded-by-default="perusteTekstiAvattu" v-if="pohjaObject && pohjaObject[teksti]">
      <template v-slot:header><h4>{{$t('pohjan-teksti')}}</h4></template>
      <span v-html="$kaanna(pohjaObject[teksti])"></span>
    </ep-collapse>

    <div v-if="vlkObject && (hasContent || perusteObject)">
      <slot name="otsikko"></slot>
      <h4>{{ $t('paikallinen-teksti') }}</h4>
      <ep-content v-if="isEditing || contentNotEmpty" v-model="vlkObject[teksti]"
                    layout="normal"
                    :is-editable="isEditing"></ep-content>
      <ep-alert v-if="!isEditing && !contentNotEmpty" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import _ from 'lodash';

@Component({
  components: {
    EpCollapse,
    EpContent,
    EpAlert,
  },
})
export default class VuosiluokkaSisaltoTeksti extends Vue {
  @Prop({ required: false })
  private perusteObject!: any;

  @Prop({ required: false })
  private pohjaObject!: any;

  @Prop({ required: false })
  private vlkObject!: any;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: 'otsikko' })
  private otsikko!: string;

  @Prop({ default: 'teksti' })
  private teksti!: string;

  @Prop({ default: false })
  private perusteTekstiAvattu!: boolean;

  get hasContent() {
    return this.vlkObject != null && _.has(this.vlkObject, this.teksti);
  }

  get contentNotEmpty() {
    return this.vlkObject != null && this.vlkObject[this.teksti] != null;
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

</style>
