<template>

  <div class="dokumentit">
    <div class="ylapaneeli d-flex align-items-center">
        <h2 class="otsikko">{{ $t('luo-pdf') }}</h2>
    </div>
    <div class="sisalto">
      <div class="mb-4">
        <h5>{{ $t('luo-ja-lataa-pdf') }}</h5>
        <p>{{ $t('luo-pdf-selite')}}</p>

        <EpPdfDokumentti v-if="dtoJulkaisu"
                         :dokumentti="dtoJulkaisu"
                         :dokumentti-href="hrefJulkaisu"
                         :is-polling="false"
                         :pdfnimi="$kaanna(opetussuunnitelmanimi)">
        </EpPdfDokumentti>
        <hr v-if="dtoJulkaisu">
        <EpPdfDokumentti :dokumentti="dto"
                         :dokumentti-href="href"
                         :is-polling="polling"
                         :pdfnimi="$kaanna(opetussuunnitelmanimi)">
        </EpPdfDokumentti>
        <div class="btn-group">
          <ep-button @click="createDocument" :disabled="!dto || polling" :show-spinner="polling" buttonClass="px-5"><span>{{ $t('luo-uusi-pdf') }}</span></ep-button>
        </div>
      </div>

      <div class="row">
        <div class="col kuvalataus">
          <ep-dokumentti-kuva-lataus tyyppi="kansikuva" :dto="dtoKuva" @saveImage="saveImage" @removeImage="removeImage"></ep-dokumentti-kuva-lataus>
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">{{$t('sijainti')}}</div>
          <img src="../../../../public/img/icons/pdfkuva_etusivu.svg" />
        </div>
      </div>

       <div class="row">
        <div class="col kuvalataus">
          <ep-dokumentti-kuva-lataus tyyppi="ylatunniste" :dto="dtoKuva" @saveImage="saveImage" @removeImage="removeImage"></ep-dokumentti-kuva-lataus>
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">&nbsp;</div>
          <img src="../../../../public/img/icons/pdfkuva_header.svg" />
        </div>
      </div>

       <div class="row">
        <div class="col kuvalataus">
          <ep-dokumentti-kuva-lataus tyyppi="alatunniste" :dto="dtoKuva" @saveImage="saveImage" @removeImage="removeImage"></ep-dokumentti-kuva-lataus>
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">&nbsp;</div>
          <img src="../../../../public/img/icons/pdfkuva_alatunniste.svg"/>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Watch } from 'vue-property-decorator';
import { baseURL, Dokumentit, DokumentitParams, DokumenttiDto, DokumenttiDtoTilaEnum } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpDokumenttiKuvaLataus from './EpDokumenttiKuvaLataus.vue';
import { success, fail } from '@/utils/notifications';
import { Debounced } from '@shared/utils/delay';
import { DokumenttiKuvaDto } from '@shared/generated/ylops';
import EpPdfDokumentti from '@shared/components/EpPdfLuonti/EpPdfDokumentti.vue';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpSpinner,
    EpDokumenttiKuvaLataus,
    EpPdfDokumentti,
  },
})
export default class RouteDokumentti extends EpOpsRoute {
  private previewUrl = null;
  private dto: DokumenttiDto | null = null;
  private dtoJulkaisu: DokumenttiDto | null = null;
  private dtoKuva: DokumenttiKuvaDto | null = null;
  private href: string | null = null;
  private hrefJulkaisu: string | null = null;
  private polling = false;

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  @Watch('kieli')
  private kieliChanged() {
    this.init();
  }

  get infoClass() {
    if (this.dto && this.href) {
      return 'luotu';
    }

    if (this.dto && this.dto.tila === _.toLower(DokumenttiDtoTilaEnum.EPAONNISTUI)) {
      return 'epaonnistui';
    }

    return 'ei-luotu';
  }

  get tilaFormatted() {
    if (this.dto) {
      return this.$t('dokumentti-' + _.kebabCase(this.dto.tila), {
        valmistumisaika: this.dto.valmistumisaika ? (this as any).$sdt(this.dto.valmistumisaika) : null,
      });
    }
    else {
      return this.$t('dokumentti-' + _.kebabCase(DokumenttiDtoTilaEnum.EIOLE));
    }
  }

  // Alustetaan komponentti
  async init() {
    this.previewUrl = null;
    this.dto = null;
    this.dtoKuva = null;
    this.href = null;

    if (this.opsId) {
      await this.getDokumenttiTila();
    }

    // Haetaan kuvaliitteet
    const resKuva = await Dokumentit.getDokumenttiKuva(this.opsId, this.kieli);
    this.dtoKuva = resKuva.data;
  }

  // Haetaan dokumentin tila ja päivitetään muuttujat
  @Debounced(2000)
  private async getDokumenttiTila() {
    if (this.dto && this.dto.id) {
      this.dto = (await Dokumentit.query(this.dto.id)).data;
    }
    else {
      this.dto = (await Dokumentit.getLatestDokumentti(this.opsId, this.kieli)).data;
    }
    await this.getJulkaistuDokumentti();
    await this.handleTilaPolling();
  }

  async getJulkaistuDokumentti() {
    if (this.dto && !this.dto.julkaisuDokumentti && !this.dtoJulkaisu) {
      this.dtoJulkaisu = (await Dokumentit.getJulkaistuDokumentti(this.opsId, this.kieli)).data;
      if (this.dtoJulkaisu.id) {
        this.hrefJulkaisu = baseURL + DokumentitParams.get(_.toString(this.dtoJulkaisu.id)).url;
      }
    }
  }

  private async handleTilaPolling() {
    if (this.dto) {
      // Lopetetaan pollaaminen kun dokumentin luominen on päättynyt
      if (_.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)
        || _.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS)) {
        this.polling = false;

        if (_.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS) && this.dto.id) {
          this.href = baseURL + DokumentitParams.get(_.toString(this.dto.id)).url;
        }
        else if (_.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)) {
          fail('pdf-tiedosto-luonti-epaonnistui');
        }
      }
      else if (_.kebabCase(this.dto.tila) !== _.kebabCase(DokumenttiDtoTilaEnum.EIOLE)) {
        this.polling = true;
        await this.getDokumenttiTila();
      }
    }
  }

  // Luodaan uusi dokumentti
  private async createDocument() {
    this.polling = true;
    this.dto = (await Dokumentit.create(this.opsId, this.kieli)).data;
    await this.getDokumenttiTila();
  }

  // Tallennetaan uusi kansikuva
  private async saveImage(file, tyyppi) {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.dtoKuva = (await Dokumentit.addImage(this.opsId, tyyppi, this.kieli, formData)).data;
      success('pdf-tiedosto-kuva-lataus-onnistui');
    }
  }

  // Poistetaan kansikuva
  private async removeImage(tyyppi) {
    await Dokumentit.deleteImage(this.opsId, tyyppi, this.kieli);
    success('pdf-tiedosto-kuva-poisto-onnistui');
    if (this.dtoKuva) {
      this.dtoKuva[tyyppi] = undefined;
    }
  }

  get opetussuunnitelmanimi() {
    return this.ops.nimi;
  }
}

</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.luontitiedot {
  display: block;
}

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
    margin: 35px 50px 20px 15px;

    .pdf-box {
      margin: 25px 0px;
      width: 100%;
      border-radius: 2px;
      padding: 25px;

      .ikoni {
        font-size: 1.5rem;
      }

      &.luotu {
        background-color: $gray-lighten-10;

        .ikoni {
          color: $blue-lighten-6;
        }

        @media(max-width: 575px) {

          .ikoni {
            display: none;
          }
        }

        .teksti {
          font-weight: 600;
        }
      }

      &.ei-luotu {
        border: 1px solid $gray-lighten-9;
        color: $gray-lighten-2;
        font-style: italic;
      }

      &.epaonnistui {
        border: 1px solid $gray-lighten-9;
        color: $red;
      }

    }

    @media(max-width: 575px) {

      .sijaintikuva {
        display:none;
      }

    }

    .kuvalataus {
      min-width: 300px;
    }

    .sijainti-topic {
      margin-bottom: 40px;
      font-weight: 600;
    }

  }
}

</style>
