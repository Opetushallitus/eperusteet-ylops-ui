<template>
<ep-form-content :name="tyyppi">
  <div class="ops-dokumentti-tiedosto-lataus">
    <div class="d-flex justify-content-around align-items-center h-100" v-if="dto && dto[tyyppi]">
      <div class="d-flex w-25 h-100 justify-content-around align-items-center">
        <img class="h-75" :src="kuvaUrl" />
      </div>
      <div class="d-flex vali-viiva w-25 justify-content-center">
        <ep-button @click="removeImage()" variant="danger">
          <slot name="poista">{{ $t('poista') }}</slot>
        </ep-button>
      </div>
    </div>
    <div class="h-100" v-else>
      <b-form-file v-if="!file" v-model="file" accept="image/jpeg, image/png" :placeholder="placeholder" :drop-placeholder="dropPlaceholder" :browse-text="browseText" @input="onInput"></b-form-file>
      <div class="d-flex justify-content-around align-items-center h-100" v-if="file">
        <div class="d-flex w-25 h-100 justify-content-around align-items-center">
          <figure>
            <img class="h-75" v-if="previewUrl" :src="previewUrl" />
            <figcaption>{{ $t('fu-valittu-tiedosto') }}: {{ file ? file.name : '' }}</figcaption>
          </figure>
        </div>
        <div class="d-flex vali-viiva w-25 justify-content-center">
          <div class="btn-toolbar">
            <div class="btn-group">
              <ep-button @click="saveImage()">
                <slot name="tallenna">{{ $t('tallenna') }}</slot>
              </ep-button>
              <ep-button @click="file = null" variant="warning">
                <slot name="peruuta">{{ $t('peruuta') }}</slot>
              </ep-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</ep-form-content>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import { baseURL, DokumentitParams } from '@/api';
import { Kielet } from '@shared/stores/kieli';
import { DokumenttiDto } from '@/generated';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';


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

  // Luodaan esikatselukuva kuvan valitsemisen jälkeen
  private onInput(file: any) {
    if (file != null) {
      // Luodaan uusi lukija ja rekisteröidään kuuntelija
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };

      // Ladataan kuva Base64 muodossa
      reader.readAsDataURL(file);
    }
    else {
      // Poistetaan kuvan esikatselu
      this.previewUrl = null;
    }
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

<style lang="scss" scoped>

.dokumentit {

  .ops-dokumentti-tiedosto-lataus {
    width:800px;
    height: 300px;
    background-color: #f8f9fa;
    border: 2px solid #CED4DE;
    border-radius: 0.5rem;
    border-style: dashed;
    position: relative;

    .custom-file::v-deep{
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
