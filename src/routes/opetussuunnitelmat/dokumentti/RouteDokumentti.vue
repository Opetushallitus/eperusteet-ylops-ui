<template lang="pug">

div.content
  h2 {{ $t('dokumentti') }}
  div.mb-4(v-if="!isLoading")
    p {{ tilaFormatted }}…

    div.btn-group
      ep-button(
        @click="createDocument",
        :disabled="isPolling",
        :show-spinner="isPolling")
        fas.mr-2(icon="cog")
        span {{ $t('luo-uusi-dokumentti') }}
      a.btn.btn-secondary(
        v-if="dto && href",
        :href="href",
        target="_blank",
        rel="noopener noreferrer")
        fas.mr-2(icon="file-download")
        span {{ $t('lataa-dokumentti') }}

  h2 {{ $t('lisaasetukset') }}

  div.row
    div.col-lg-6
      div.form-group
        ep-form-content(name="kansikuva")
          div(v-if="!isLoading")
            div(v-if="dto && dto.kansikuva")
              img.img-fluid(:src="kansikuva")
              div.row.mt-3
                div.col-auto.mr-auto
                div.col-auto
                  ep-button(@click="removeImage()", variant="danger")
                    slot(name="poista") {{ $t('poista') }}

            div(v-else)
              b-form-file(
                v-model="file",
                accept="image/jpeg, image/png"
                :placeholder="placeholder",
                :drop-placeholder="dropPlaceholder",
                :browse-text="browseText",
                @input="onInput")

              div.row.mt-3(v-if="file")
                div.col-auto.mr-auto.align-self-center
                  div {{ $t('fu-valittu-tiedosto') }}: {{ file ? file.name : '' }}
                div.col-auto
                  div.btn-toolbar
                    div.btn-group
                      ep-button(@click="saveImage()")
                        slot(name="tallenna") {{ $t('tallenna') }}
                      ep-button(
                        @click="file = null",
                        variant="warning")
                        slot(name="peruuta") {{ $t('peruuta') }}

              img.mt-3.img-fluid(v-if="previewUrl", :src="previewUrl")

</template>

<script lang="ts">
import _ from 'lodash';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import { EpButton, EpFormContent } from '@/components';
import { Component, Watch } from 'vue-property-decorator';
import { baseURL, Dokumentit, DokumentitParams } from '@/api';
import { Kielet } from '@/stores/kieli';
import { DokumenttiDto } from '@/generated';
import TilaEnum = DokumenttiDto.TilaEnum;

@Component({
  components: {
    EpFormContent,
    EpButton,
  },
})
export default class RouteDokumentti extends EpOpsRoute {

  get kieli() {
    return Kielet.getSisaltoKieli();
  }

  get tilaFormatted() {
    if (this.dto) {
      return this.$t('dokumentti-' + _.kebabCase(this.dto.tila), {
        valmistumisaika: (this as any).$sdt(this.dto.valmistumisaika),
      });
    }
    else {
      return this.$t('dokumentti-' + _.kebabCase(TilaEnum.EIOLE));
    }
  }

  get kansikuva() {
    return baseURL + DokumentitParams.getImage(this.opsId, 'kansikuva', this.kieli).url;
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

  get isPolling() {
    return this.polling != null;
  }
  private file = null;
  private previewUrl = null;
  private dto: DokumenttiDto | null = null;
  private polling: any = null;
  private pollingFrequency = 1000;
  private href: string | null = null;

  // Alustetaan komponentti
  public async init() {
    this.file = null;
    this.previewUrl = null;
    this.dto = null;
    clearInterval(this.polling);
    this.polling = null;
    this.href = null;

    const res = await Dokumentit.getDokumenttiId(this.opsId, this.kieli);

    // Jos dokumentti löytyy, haetaan sen tila
    if (_.isNumber(res.data)) {
      const dokumenttiId = res.data;
      this.href = baseURL + DokumentitParams.get(dokumenttiId).url;
    }

    await this.getDokumenttiTila();
  }

  public destroyed() {
    clearInterval(this.polling);
  }

  @Watch('kieli')
  private kieliChanged() {
    this.init();
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

  // Haetaan dokumentin tila ja päivitetään muuttujat
  private async getDokumenttiTila() {
    // Päivitetään dokumentin tila
    this.dto = (await Dokumentit.getDokumentti(this.opsId, this.kieli)).data;

    // Lopetetaan pollaaminen kun dokumentin luominen on päättynyt
    if (_.kebabCase(this.dto.tila) === _.kebabCase(TilaEnum.EPAONNISTUI)
      || _.kebabCase(this.dto.tila) === _.kebabCase(TilaEnum.VALMIS)) {
      clearInterval(this.polling);
      this.polling = null;

      if (_.kebabCase(this.dto.tila) === _.kebabCase(TilaEnum.VALMIS) && this.dto.id) {
        this.href = baseURL + DokumentitParams.get(this.dto.id).url;
      }
    }
  }

  // Luodaan uusi dokumentti
  private async createDocument() {
    // Lopetetaan aikaisempi pollaus
    clearInterval(this.polling);
    this.polling = true;

    // Lähetetään pyyntö taustapalveluun
    this.dto = (await Dokumentit.create(this.opsId, this.kieli)).data;

    // Ohitetaan ensimmäinen pollaus, koska paluuarvossa on jo tämänhetkinen tila
    setTimeout(() => {
      // Aloitetaan tilan pollaaminen
      this.polling = setInterval(() => {
        this.getDokumenttiTila();
      }, this.pollingFrequency);
    }, this.pollingFrequency);
  }

  // Tallennetaan uusi kansikuva
  private async saveImage() {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file!);
      this.dto = (await Dokumentit.addImage(this.opsId, 'kansikuva', this.kieli, formData)).data;
      this.file = null;
      this.previewUrl = null;
    }
  }

  // Poistetaan kansikuva
  private async removeImage() {
    await Dokumentit.deleteImage(this.opsId, 'kansikuva', this.kieli);
    if (this.dto) {
      this.dto.kansikuva = undefined;
    }
  }
}
</script>
