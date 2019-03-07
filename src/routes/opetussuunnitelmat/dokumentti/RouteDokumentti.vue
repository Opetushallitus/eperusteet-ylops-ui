<template lang="pug">

div.content
  h2 {{ $t('dokumentti') }}
  div.mb-4
    p(v-if="!isLoading") {{ tilaFormatted() }}…

    div.btn-group
      ep-button(
        @click="createDocument",
        :disabled="isPolling",
        :show-spinner="isPolling")
        fas(icon="cog")
        | &nbsp;&nbsp;
        span {{ $t('luo-uusi-dokumentti') }}
      a.btn.btn-secondary(
        v-if="href",
        :href="href",
        target="_blank",
        rel="noopener noreferrer")
        fas.icon-asd(icon="file-download")
        | &nbsp;&nbsp;
        span {{ $t('lataa-dokumentti') }}

  h2 {{ $t('lisaasetukset') }}

  .row
    .col-lg-6
      div.form-group
        ep-form-content(name="kansilehti")
          b-form-file(
            v-model="file",
            accept="image/jpeg, image/png"
            :placeholder="placeholder",
            :drop-placeholder="dropPlaceholder",
            :browse-text="browseText",
            @input="onInput")

          .row.mt-3(v-if="file")
            .col-auto.mr-auto.align-self-center
              div {{ $t('fu-valittu-tiedosto') }}: {{ file ? file.name : '' }}
            .col-auto
              .btn-toolbar
                .btn-group
                  ep-button(@click="save()")
                    slot(name="tallenna") {{ $t('tallenna') }}
                  ep-button(
                    @click="file = null",
                    variant="warning")
                    slot(name="peruuta") {{ $t('peruuta') }}

          img.mt-3.img-fluid(v-if="previewUrl", :src="previewUrl")

</template>


<script lang="ts">

import _ from "lodash";
import EpOpsRoute from "@/mixins/EpOpsRoute";
import { EpButton, EpFormContent } from "@/components";
import { Component } from "vue-property-decorator";
import { baseURL, Dokumentit, DokumentitParams } from "@/api";
import { Kielet } from "@/stores/kieli";
import { DokumenttiDto } from "@/generated";
import TilaEnum = DokumenttiDto.TilaEnum;

@Component({
  components: {
    EpFormContent,
    EpButton,
  },
})
export default class RouteDokumentti extends EpOpsRoute {

  private file = null;
  private previewUrl = null;
  private dto: DokumenttiDto | null = null;
  private polling: any = null;
  private pollingFrequency = 1000;
  private href: string = '';

  async init() {
    const res = await Dokumentit.getDokumenttiId(this.ops.id!, Kielet.getSisaltoKieli());

    // Jos dokumentti löytyy, haetaan sen tila
    if (_.isNumber(res.data)) {
      const dokumenttiId = res.data;

      this.href = baseURL + DokumentitParams.get(dokumenttiId).url;

      await this.getTila();
    }
  }

  private tilaFormatted() {
    if (this.dto) {
      return this.$t('dokumentti-' + _.kebabCase(this.dto.tila), {
        valmistumisaika: (this as any).$sdt(this.dto.valmistumisaika)
      });
    } else {
      return this.$t('dokumentti-' + _.kebabCase(TilaEnum.EIOLE));
    }
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
    return this.polling !== null;
  }

  private async getTila() {
    // Päivitetään dokumentin tila
    this.dto = (await Dokumentit.getDokumentti(this.ops.id!, Kielet.getSisaltoKieli())).data;

    // Lopetetaan pollaaminen kun dokumentin luominen on päättynyt
    if (_.kebabCase(this.dto.tila) == _.kebabCase(TilaEnum.EPAONNISTUI)
      || _.kebabCase(this.dto.tila) == _.kebabCase(TilaEnum.VALMIS)) {
      clearInterval(this.polling);
      this.polling = null;

      if (_.kebabCase(this.dto.tila) == _.kebabCase(TilaEnum.VALMIS) && this.dto.id) {
        this.href = baseURL + DokumentitParams.get(this.dto.id).url;
      }
    }
  }

  private async createDocument() {
    this.dto = (await Dokumentit.create(this.ops.id!, Kielet.getSisaltoKieli())).data;

    // Lopetetaan aikaisempi pollaus
    clearInterval(this.polling);
    this.polling = true;
    // Ohitetaan ensimmäinen pollaus, koska paluuarvossa on tila
    setTimeout(() => {
      // Aloitetaan tilan pollaaminen
      this.polling = setInterval(() => {
        this.getTila();
      }, this.pollingFrequency);
    }, this.pollingFrequency);
  }

  private save() {
    // Todo: Image saving
    alert('WIP image saving!');
  }

  private onInput(file: any) {
    if (file != null) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };

      // Ladataan kuva Base64 muodossa
      reader.readAsDataURL(file)
    }
    else {
      // Poistetaan kuvan esikatselu
      this.previewUrl = null;
    }
  }

}
</script>
