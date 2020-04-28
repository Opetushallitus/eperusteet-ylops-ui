<template>
  <div class="mt-4">
    <h3>{{ $kaanna(perusteObject[otsikko]) }}</h3>
    <ep-collapse :border-bottom="false" :border-top="false" :expandedByDefault="perusteTekstiAvattu">
      <template v-slot:header><h4>{{$t('perusteen-teksti')}}</h4></template>
      <span v-html="$kaanna(perusteObject[teksti])"></span>
    </ep-collapse>

    <div v-if="vlkObject">
      <h4>{{ $t('paikallinen-teksti') }}</h4>
      <ep-content v-if="isEditing || hasContent" v-model="vlkObject[teksti]"
                    layout="normal"
                    :is-editable="isEditing"></ep-content>
      <ep-alert v-if="!isEditing && !hasContent" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';

@Component({
  components: {
    EpCollapse,
    EpContent,
    EpAlert,
  },
})
export default class VuosiluokkakokonaisuusSisaltoTeksti extends Vue {
  @Prop({ required: true })
  private perusteObject!: any;

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
    return this.vlkObject != null && this.vlkObject[this.teksti] != null;
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

</style>
