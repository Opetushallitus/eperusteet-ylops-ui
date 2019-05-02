<template lang="pug">

div.content
  h2 {{ $t('kasitteet') }}

  ep-spinner(v-if="isLoading")
  div(v-else)
    ep-search(v-model="hakusana")
    div.text-right
      b-button(variant="link", @click="avaaLuontiModal")
        fas.mr-2(icon="plus-circle")
        span {{ $t('lisaa-uusi-kasite') }}
    div(v-for="termi in suodatettuTermisto")
      div.float-right
        button.btn.btn-link(@click="avaaMuokkausModal(termi)")
          fas(icon="pen")
        button.btn.btn-link(@click="poistaKasite(termi)")
          fas(icon="times")
      ep-content.termi(:value="termi.termi")
      ep-content.selitys(:value="termi.selitys")

  // Kysymyksen luomisen ja muokkaamisen modaali
  b-modal.backdrop(
    id="terminLuontiModal",
    ref="terminLuontiModal",
    @ok="tallennaKasite",
    :no-close-on-backdrop="true",
    :lazy="true",
    :ok-disabled="validation.$invalid",
    size="lg")
    template(slot="modal-title")
      span.mr-2 {{ kasite.id ? $t('muokkaa-kasitetta') : $t('lisaa-uusi-kasite') }}
      // Sisällön kieli
      b-dropdown.float-right(size="sm")
        template(slot="button-content")
          span {{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}
        b-dropdown-item(
          @click="valitseSisaltoKieli(kieli)",
          v-for="kieli in sovelluksenKielet",
          :key="kieli",
          :disabled="kieli === sisaltoKieli") {{ kieli }}
    ep-form-content(name="kasite-termi")
      ep-input(
        v-model="kasite.termi",
        type="localized",
        help="kasite-termi-ohje",
        :validation="validation.termi",
        :is-editing="true")
    ep-form-content(name="kasite-selitys")
      ep-content(
        v-model="kasite.selitys",
        help="kasite-selitys-ohje",
        :validation="validation.selitys",
        :is-editable="true")
    ep-form-content(name="alaviite")
      b-form-checkbox(v-model="kasite.alaviite") {{ $t('merkitse-kasite-alaviitteeksi') }}
    template(slot="modal-cancel") {{ $t('peruuta') }}
    template(slot="modal-ok") {{ kasite.id ? $t('tallenna') : $t('lisaa-kasite') }}

</template>

<script lang="ts">
import _ from 'lodash';

import { Component } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';

import EpOpsRoute from '@/mixins/EpOpsRoute';
import { EpContent, EpFormContent, EpSearch, EpSpinner } from '@/components';
import EpInput from '@/components/forms/EpInput.vue';
import { Termisto } from '@/api';

import { Kielet, UiKielet } from '@/stores/kieli';
import { Kieli } from '@/tyypit';
import { kasiteValidator } from '@/validators/kasite';

import { TermiDto } from '../../../generated';

@Component({
  components: {
    EpContent,
    EpFormContent,
    EpInput,
    EpSearch,
    EpSpinner,
  },
  mixins: [
    validationMixin,
  ],
  validations() {
    return {
      kasite: {
        ...(this as any).validator
      }
    };
  }
})
export default class RouteKasite extends EpOpsRoute {
  private termisto: TermiDto[] = [];
  private kasite: TermiDto = {};
  private hakusana: string = '';

  avaaLuontiModal(e) {
    this.kasite = {};
    (this as any).$refs.terminLuontiModal.show();
  }

  avaaMuokkausModal(kasite) {
    this.kasite = _.cloneDeep(kasite);
    (this as any).$refs.terminLuontiModal.show();
  }

  async poistaKasite(kasite) {
    try {
      await Termisto.deleteTermi(this.opsId, kasite.id);
      _.remove(this.termisto, k => k.id === kasite.id);
      this.termisto = [...this.termisto];
    }
    catch (err) {
      // Todo: Termin poisto epäonnistui
    }
  }

  makeKey(item) {
    var termi = _.first(_.compact(_.values(item.termi))) || '';
    return termi.replace(/[^a-zA-Z0-9]/g, '') + new Date().getTime();
  }

  async tallennaKasite(e) {
    e.preventDefault();

    try {
      if (this.kasite.id) {
        // Tallennetaan muokattu käsite
        const res = await Termisto.updateTermi(
          this.opsId,
          this.kasite.id,
          this.kasite
        );
        _.remove(this.termisto, termi => termi.id === res.data.id);
        this.termisto.push(res.data);
      }
      else {
        // Luodaan uusi käsite + lisätään sille avain
        if (!this.kasite.avain) {
          this.kasite.avain = this.makeKey(this.kasite);
        }
        const res = await Termisto.addTermi(this.opsId, this.kasite);
        this.termisto.push(res.data);
      }
      (this as any).$refs.terminLuontiModal.hide();
    }
    catch (err) {
      // Todo: Tallennus epäonnistui
    }
  }

  async init() {
    try {
      const resp = await Termisto.getAllTermit(this.opsId);
      this.termisto = resp.data;
    }
    catch (err) {
      // Todo: Termien lataus epäonnistui
    }
  }

  get suodatettuTermisto() {
    return this.termisto.filter(
      termi =>
        _.includes(
          _.toLower(_.get(termi, 'termi.' + Kielet.getSisaltoKieli())),
          _.toLower(this.hakusana)
        )
        || _.includes(
          _.toLower(_.get(termi, 'selitys.' + Kielet.getSisaltoKieli())),
          _.toLower(this.hakusana)
        )
    );
  }

  private get validator() {
    return kasiteValidator([
      Kielet.getSisaltoKieli() // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  private get validation() {
    return (this as any).$v.kasite;
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli();
  }
  get sovelluksenKielet() {
    return UiKielet;
  }
  private valitseSisaltoKieli(kieli: Kieli) {
    Kielet.setSisaltoKieli(kieli);
  }
}
</script>

<style lang="scss" scoped>
.selitys {
  margin-left: 5px;
  margin-top: 5px;
}
</style>
