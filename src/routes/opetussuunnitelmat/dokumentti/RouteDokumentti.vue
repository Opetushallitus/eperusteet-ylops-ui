<template lang="pug">

.dokumentit
  .ylapaneeli.d-flex.align-items-center
    h2.otsikko {{ $t('luo-pdf') }}
  .sisalto
    div.mb-4
      p {{ tilaFormatted }}…

      div.btn-group
        ep-button(
          @click="createDocument",
          :disabled="isPolling",
          :show-spinner="isPolling",
          variant="link"
          )
          span {{ $t('luo-uusi-pdf') }}
        a.btn.btn-link(
          v-if="dto && href",
          :href="href",
          target="_blank",
          rel="noopener noreferrer",
          variant="link")
          fas.mr-2(icon="file-download")
          span {{ $t('lataa-pdf') }}

    h2 {{ $t('lisaasetukset') }}

    div.row
      div.col-lg-6
        div.form-group
          ep-dokumentti-kuva-lataus(tyyppi="kansikuva" :dto="dto" @saveImage="saveImage" @removeImage="removeImage")
          ep-dokumentti-kuva-lataus(tyyppi="ylatunniste" :dto="dto" @saveImage="saveImage" @removeImage="removeImage")
          ep-dokumentti-kuva-lataus(tyyppi="alatunniste" :dto="dto" @saveImage="saveImage" @removeImage="removeImage")
</template>

<script lang="ts">

import _ from 'lodash';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Component, Watch } from 'vue-property-decorator';
import { baseURL, Dokumentit, DokumentitParams } from '@/api';
import { Kielet } from '@shared/stores/kieli';
import { DokumenttiDto } from '@/generated';
import EpDokumenttiKuvaLataus from './EpDokumenttiKuvaLataus.vue';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpSpinner,
    EpDokumenttiKuvaLataus,
  },
})
export default class RouteDokumentti extends EpOpsRoute {
  private previewUrl = null;
  private dto: DokumenttiDto | null = null;
  private polling: any = null;
  private pollingFrequency = 1000;
  private href: string | null = null;

  get kieli() {
    return Kielet.getSisaltoKieli;
  }

  @Watch('kieli')
  private kieliChanged() {
    this.init();
  }

  get tilaFormatted() {
    if (this.dto) {
      return this.$t('dokumentti-' + _.kebabCase(this.dto.tila), {
        valmistumisaika: this.dto.valmistumisaika ? (this as any).$sdt(this.dto.valmistumisaika) : null,
      });
    }
    else {
      return this.$t('dokumentti-' + _.kebabCase(DokumenttiDto.TilaEnum.EIOLE));
    }
  }

  get isPolling() {
    return this.polling != null;
  }

  // Alustetaan komponentti
  async init() {
    this.previewUrl = null;
    this.dto = null;
    clearInterval(this.polling);
    this.polling = null;
    this.href = null;

    const res = await Dokumentit.getDokumenttiId(this.opsId, this.kieli);

    // Jos dokumentti löytyy, haetaan sen tila
    if (_.isNumber(res.data)) {
      const dokumenttiId = res.data;
      this.href = baseURL + DokumentitParams.get(_.toString(dokumenttiId)).url;
    }

    await this.getDokumenttiTila();
  }

  // Haetaan dokumentin tila ja päivitetään muuttujat
  private async getDokumenttiTila() {
    // Päivitetään dokumentin tila
    this.dto = (await Dokumentit.getDokumentti(this.opsId, this.kieli)).data;

    // Lopetetaan pollaaminen kun dokumentin luominen on päättynyt
    if (_.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDto.TilaEnum.EPAONNISTUI)
      || _.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDto.TilaEnum.VALMIS)) {
      clearInterval(this.polling);
      this.polling = null;

      if (_.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDto.TilaEnum.VALMIS) && this.dto.id) {
        this.href = baseURL + DokumentitParams.get(_.toString(this.dto.id)).url;
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
  private async saveImage(file, tyyppi) {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.dto = (await Dokumentit.addImage(this.opsId, tyyppi, this.kieli, formData)).data;
    }
  }

  // Poistetaan kansikuva
  private async removeImage(tyyppi) {
    await Dokumentit.deleteImage(this.opsId, tyyppi, this.kieli);
    if (this.dto) {
      this.dto[tyyppi] = undefined;
    }
  }

  destroyed() {
    clearInterval(this.polling);
  }
}

</script>

<style lang="scss" scoped>
.dokumentit {
  margin-top: 4px;

  .ylapaneeli {
    border-bottom: 1px solid #eee;
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    padding: 15px;
  }
}

</style>
