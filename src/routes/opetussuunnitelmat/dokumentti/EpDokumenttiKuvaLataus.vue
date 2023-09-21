<template>
  <ep-form-content :name="tyyppi">

    <div class="kuvaus">{{$t('pdf-tiedosto-kuvaus')}}</div>
    <div class="ops-dokumentti-tiedosto-lataus" :class="dto && dto[tyyppi] || file ? 'tiedosto' : 'ei-tiedosto'">
      <div class="justify-content-around align-items-center h-100 m-3" v-if="dto && dto[tyyppi]">
        <div class="h-100 justify-content-around align-items-center"><img :src="kuvaUrl" /></div>
        <div class="vali-viiva justify-content-center">
          <ep-button @click="removeImage()" variant="link" micon="delete" class="mt-2" inherit-style>
            <slot name="poista">{{ $t('poista') }}</slot>
          </ep-button>
        </div>
      </div>
      <div class="h-100" v-else>

        <b-form-file v-if="!file" v-model="file" accept="image/jpeg, image/png" :placeholder="placeholder" :drop-placeholder="dropPlaceholder" :browse-text="browseText" @input="onInput"></b-form-file>

        <div class="justify-content-around align-items-center h-100 m-3" v-if="file">
          <div class="h-100 justify-content-around align-items-center">
            <figure><img v-if="previewUrl" :src="previewUrl" />
              <figcaption>{{ $t('fu-valittu-tiedosto') }}: {{ file ? file.name : '' }}</figcaption>
            </figure>
          </div>
          <div class="justify-content-center">
              <div class="">
                <ep-button v-if="fileValidi" @click="saveImage()" variant="link" micon="save" class="mr-5" inherit-style>
                  <slot name="tallenna">{{ $t('tallenna') }}</slot>
                </ep-button>
                <ep-button @click="file = null" variant="link" micon="keyboard_return" inherit-style>
                  <slot name="peruuta">{{ $t('peruuta') }}</slot>
                </ep-button>
              </div>
          </div>
        </div>
      </div>
    </div>

  </ep-form-content>

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { baseURL, DokumentitParams } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import { fail } from '@/utils/notifications';
import _ from 'lodash';
import { DokumenttiKuvaDto } from '@shared/generated/ylops';

@Component({
  components: {
    EpButton,
    EpFormContent,
  },
})
export default class EpDokumenttiKuvaLataus extends Vue {
  private file = null;
  private previewUrl = null;
  private fileMaxSize = 1 * 1024 * 1024;
  private fileTypes: string [] = ['image/jpeg', 'image/png'];

  @Prop({ required: true })
  private tyyppi!: string;

  @Prop({ required: true })
  private dto: DokumenttiKuvaDto | null = null;

  get kuvaUrl() {
    return baseURL + DokumentitParams.getImage(this.dto!.opsId!, this.tyyppi, this.kieli).url;
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get placeholder() {
    return this.$t('fu-placeholder');
  }

  get dropPlaceholder() {
    return this.$t('fu-placeholder');
  }

  get browseText() {
    return this.$t('fu-browse-text');
  }

  @Watch('kieli')
  private kieliChanged() {
    this.file = null;
  }

  get fileValidi() {
    return this.file != null && (this.file as any).size <= this.fileMaxSize && _.includes(this.fileTypes, (this.file as any).type);
  }

  // Luodaan esikatselukuva kuvan valitsemisen jälkeen
  private onInput(file: any) {
    if (file != null && file.size > this.fileMaxSize) {
      fail('pdf-tiedosto-kuva-liian-suuri');
    }

    if (file != null && !_.includes(this.fileTypes, file.type)) {
      fail('pdf-tiedosto-kuva-vaara-tyyppi');
    }

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
@import "@shared/styles/_variables.scss";

.dokumentit {

  .kuvaus {
    font-size: 0.8rem;
    color: $gray;
  }

  .ops-dokumentti-tiedosto-lataus {
    margin: 10px 0px;
    width:100%;
    border-width: 1px;
    border-color: $gray-lighten-2;
    border-style: dashed;
    border-radius: 10px;
    position: relative;

    img {
      max-width: 500px;
      max-height: 500px;
    }

    &.tiedosto {
      background-color: $white;
    }

    &.ei-tiedosto {
      height: 150px;
      background-color: $gray-lighten-7;
    }

    .custom-file::v-deep{
      height: 100%;
      flex-direction: column;
      justify-content: center;
      display: flex;

      input {
        display: none;
      }

      .custom-file-label {
        width: 90%;
        background-image: url('../../../../public/img/icons/lataus_ikoni.svg');
        background-repeat: no-repeat;
        background-position: left;
        border: 0px;
        margin-left: 30px;
        height: 50px;
        background-color: inherit;
        padding-top: 0px;
        padding-left: 60px;
        position: relative;
        border-radius: 0;
      }

      .custom-file-label::after {
        text-decoration: underline;
        color: blue;
        padding: 0;
        display: inline;
        position: relative;
        background-color: $gray-lighten-7;
      }
    }
  }
}

</style>
