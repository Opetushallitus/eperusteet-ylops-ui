<template lang="pug">
  ep-form-content(:name="tyyppi")

    div.ops-dokumentti-tiedosto-lataus

      div.d-flex.justify-content-around.align-items-center.h-100(v-if="dto && dto[tyyppi]")
        div.d-flex.w-25.h-100.justify-content-around.align-items-center
          img.h-75(:src="kuvaUrl")
        div.d-flex.vali-viiva.w-25.justify-content-center
          ep-button(@click="removeImage()", variant="danger")
            slot(name="poista") {{ $t('poista') }}

      div.h-100(v-else)
        b-form-file(
          v-if="!file",
          v-model="file",
          accept="image/jpeg, image/png"
          :placeholder="placeholder",
          :drop-placeholder="dropPlaceholder",
          :browse-text="browseText",
          @input="onInput")

        div.d-flex.justify-content-around.align-items-center.h-100(v-if="file")
          div.d-flex.w-25.h-100.justify-content-around.align-items-center
            figure
              img.h-75(v-if="previewUrl", :src="previewUrl")
              figcaption {{ $t('fu-valittu-tiedosto') }}: {{ file ? file.name : '' }}
          div.d-flex.vali-viiva.w-25.justify-content-center
            div.btn-toolbar
              div.btn-group
                ep-button(@click="saveImage()")
                  slot(name="tallenna") {{ $t('tallenna') }}
                ep-button(
                  @click="file = null",
                  variant="warning")
                  slot(name="peruuta") {{ $t('peruuta') }}

</template>

<script lang="ts">

import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import { baseURL, Dokumentit, DokumentitParams } from '@/api';
import { Kielet } from '@shared/stores/kieli';
import { DokumenttiDto } from '@/generated';

@Component({
  components: {
    EpButton,
    EpFormContent,
  },
})
export default class EpDokumenttiKuvaLataus extends Vue {
  private file = null;
  private previewUrl = null;

  @Prop({required: true})
  private tyyppi!: string;

  @Prop({required: true})
  private dto: DokumenttiDto | null = null;

  get kuvaUrl() {
    return baseURL + DokumentitParams.getImage(this.dto!.opsId!, this.tyyppi, this.kieli).url;;
  }

  get kieli() {
    return Kielet.getSisaltoKieli;
  }

  get placeholder() {
    return this.$t('fu-placeholder');
  }

  get dropPlaceholder() {
    return this.$t('fu-drop-placeholder');
  }

  get browseText() {
    return this.$t('fu-browse-text');
  }

  @Watch('kieli')
  private kieliChanged() {
    this.file = null;
  }

  async saveImage() {
    this.$emit('saveImage', this.file, this.tyyppi);
  }

  async removeImage() {
    this.$emit('removeImage', this.tyyppi);
    this.file = null;
  }
}

</script>

<style lang="scss">
.dokumentit {

  .ops-dokumentti-tiedosto-lataus {
    width:800px;
    height: 300px;
    background-color: #f8f9fa;
    border: 2px solid #CED4DE;
    border-radius: 0.5rem;
    border-style: dashed;
    position: relative;

    .custom-file {
      height: 200px;

      .custom-file-label {
        border: 0px;
        padding: 130px 90px;
        height: 200px;
        background-color: #f8f9fa;
      }

      .custom-file-label::after {
        height: auto;
        background-color: inherit;
        padding: 130px 130px 0px 0px;
        text-decoration: underline;
        color: blue;
      }
    }
  }

  .ops-dokumentti-tiedosto-lataus::before {
    z-index: 50;
    content: '';
    position: absolute;
    border-left: 2px #ced4de solid;
    height: 85%;
    width: 1%;
    transform: translate(5000%, 10%);
  }
}

</style>
