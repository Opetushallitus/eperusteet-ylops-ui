<template>
<div class="kasitteet">
  <div class="ylapaneeli d-flex align-items-center">
    <h2 class="otsikko">{{ $t('kasitteet') }}</h2>
  </div>
  <ep-spinner v-if="isLoading"></ep-spinner>
  <div class="sisalto" v-else>
    <div class="otsikko-toiminnot">
      <ep-search class="mb-3" v-model="hakusana"></ep-search>
      <div class="lisaysnappi">
        <button @click="avaaMuokkausModal(null)">
          <EpMaterialIcon class="mr-2">add</EpMaterialIcon>
          <span>{{ $t('lisaa-kasite') }}</span>
        </button>
      </div>
    </div>
    <div class="kasitelista">
      <div class="kasite" v-for="(k, idx) in suodatettuTermisto" :key="idx">
        <ep-content class="termi" :class="{ closed: k.closed, open: !k.closed }" :value="k.kasite.termi" layout="simplified"></ep-content>
        <ep-content class="selitys" :class="{ closed: k.closed, open: !k.closed }" :value="k.kasite.selitys" layout="normal"></ep-content>
        <div class="toiminnot">
          <button class="btn btn-link" @click="avaaPoistoModal(k.kasite)">
            <EpMaterialIcon>delete</EpMaterialIcon>
          </button>
          <button class="btn btn-link" @click="avaaMuokkausModal(k.kasite)">
            <EpMaterialIcon>edit</EpMaterialIcon>
          </button>
          <button class="btn btn-link" @click="k.closed = !k.closed">
            <EpMaterialIcon v-if="k.closed">expand_more</EpMaterialIcon>
            <EpMaterialIcon v-else>expand_less</EpMaterialIcon>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Käsitteen poisto modal-->
  <b-modal class="backdrop" id="kasitteenPoistoModal" ref="kasitteenPoistoModal" @ok="poistaKasite" :lazy="true" size="lg"><span class="mr-2">{{ $t('haluatko-poistaa-kasitteen') }}</span><template slot="modal-cancel">{{ $t('peruuta') }}</template><template slot="modal-ok">{{ $t('poista') }}</template></b-modal>
  <!-- Käsitteen luomisen ja muokkaamisen modaali-->
  <b-modal class="backdrop" id="kasitteenLuontiModal" ref="kasitteenLuontiModal" @ok="tallennaKasite" :no-close-on-backdrop="true" :no-enforce-focus="true" :lazy="true" :ok-disabled="validation.$invalid" size="lg"><template slot="modal-title"><span class="mr-2">{{ kasite.id ? $t('muokkaa-kasitetta') : $t('lisaa-uusi-kasite') }}</span><!-- Sisällön kieli--><b-dropdown class="float-right" size="sm"><template slot="button-content"><span>{{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}</span></template>
    <b-dropdown-item
      @click="valitseSisaltoKieli(kieli)" v-for="kieli in sovelluksenKielet" :key="kieli" :disabled="kieli === sisaltoKieli">{{ kieli }}</b-dropdown-item>
  </b-dropdown>
  </template>
    <ep-form-content name="kasite-termi">
      <ep-input v-model="kasite.termi" type="localized" help="kasite-termi-ohje" :validation="validation.termi" :is-editing="true"></ep-input>
    </ep-form-content>
    <ep-form-content name="kasite-selitys">
      <ep-content v-model="kasite.selitys" help="kasite-selitys-ohje" :validation="validation.selitys" :is-editable="true" layout="normal"></ep-content>
    </ep-form-content>
    <ep-form-content name="alaviite">
      <ep-toggle v-model="kasite.alaviite">{{ $t('merkitse-kasite-alaviitteeksi') }}</ep-toggle>
    </ep-form-content><template slot="modal-cancel">{{ $t('peruuta') }}</template><template slot="modal-ok">{{ kasite.id ? $t('tallenna') : $t('lisaa-kasite') }}</template></b-modal>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { TermiDto, Termisto } from '@shared/api/ylops';
import { kasiteValidator } from '@/validators/kasite';
import { Kieli } from '@shared/tyypit';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

interface Kasite {
  kasite: TermiDto;
  closed: boolean;
}

@Component({
  components: {
    EpContent,
    EpFormContent,
    EpInput,
    EpSearch,
    EpSpinner,
    EpToggle,
    EpMaterialIcon,
  },
  mixins: [
    validationMixin,
  ],
  validations() {
    return {
      kasite: {
        ...(this as any).validator,
      },
    };
  },
} as any)
export default class RouteKasite extends EpOpsRoute {
  private termisto: Kasite[] = [];
  private kasite: TermiDto = {};
  private hakusana: string = '';

  avaaMuokkausModal(kasite: TermiDto | null) {
    if (!kasite) {
      this.kasite = {
        termi: {},
      };
    }
    else {
      this.kasite = _.cloneDeep(kasite);
    }
    (this as any).$refs.kasitteenLuontiModal.show();
  }

  avaaPoistoModal(kasite) {
    this.kasite = _.cloneDeep(kasite);
    (this as any).$refs.kasitteenPoistoModal.show();
  }

  async poistaKasite() {
    if (!this.kasite || !this.kasite.id) {
      return;
    }

    try {
      await Termisto.deleteTermi(this.opsId, this.kasite.id);
      _.remove(this.termisto, k => k.kasite.id === this.kasite.id);
      this.termisto = [...this.termisto];
      await this.store.updateSisalto();
    }
    catch (err) {
      // Todo: Termin poisto epäonnistui
    }
  }

  makeKey(item) {
    var termi = _.first(_.compact(_.values(item.termi))) || '';
    return termi.replace(/[^a-zA-Z0-9]/g, '') + new Date().getTime();
  }

  async tallennaMuuttunut(kasiteId: number) {
    // Tallennetaan muokattu käsite
    const res = await Termisto.updateTermi(
      this.opsId,
      kasiteId,
      this.kasite,
    );
    _.remove(this.termisto, termi => termi.kasite.id === kasiteId);
    this.termisto.push({
      closed: true,
      kasite: res.data,
    });
  }

  async tallennaUusi() {
    // Luodaan uusi käsite + lisätään sille avain
    if (!this.kasite.avain) {
      this.kasite.avain = this.makeKey(this.kasite);
    }
    const res = await Termisto.addTermi(this.opsId, this.kasite);
    this.termisto.push({
      closed: true,
      kasite: res.data,
    });
  }

  async tallennaKasite(e) {
    e.preventDefault();

    try {
      if (this.kasite.id) {
        await this.tallennaMuuttunut(this.kasite.id);
      }
      else {
        await this.tallennaUusi();
      }

      // Päivitetään OPS:n sisällä oleva käsitelista
      await this.store.updateSisalto();
      (this as any).$refs.kasitteenLuontiModal.hide();
    }
    catch (err) {
      // Todo: Tallennus epäonnistui
    }
  }

  async init() {
    try {
      const resp = await Termisto.getAllTermit(this.opsId);
      this.termisto = resp.data.map(kasite => {
        return { closed: true, kasite };
      });
    }
    catch (err) {
      // Todo: Termien lataus epäonnistui
    }
  }

  get suodatettuTermisto() {
    const hakutermi = _.toLower(this.hakusana);
    const kieli = Kielet.getSisaltoKieli.value;

    return this.termisto.filter(termi => _.includes(
      _.toLower(
        _.get(termi, 'kasite.termi.' + kieli) + ' ' + _.get(termi, 'kasite.selitys.' + kieli),
      ),
      hakutermi,
    ));
  }

  get validator() {
    return kasiteValidator([
      Kielet.getSisaltoKieli.value, // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  get validation() {
    return (this as any).$v.kasite;
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get sovelluksenKielet() {
    return UiKielet;
  }

  valitseSisaltoKieli(kieli: Kieli) {
    Kielet.setSisaltoKieli(kieli);
  }
}

</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.kasitteet {
  //margin-top: 4px;

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

.otsikko-toiminnot {
  display: flex;

  .has-search {
    flex: 1 1 0%;
  }

  .lisaysnappi {
    flex: 1 1 20%;
    text-align: right;

    button {
      border: 0;
      outline: 0;
      background-color: transparent;

      span {
        vertical-align: text-top;
      }

      svg {
        width: 25px;
        height: 25px;
        vertical-align: middle;
        color: #0041dc;
      }
    }
  }
}

.kasitelista {
  display:flex;
  flex-wrap: wrap;
}

.kasite:nth-child(odd) {
  background-color: #f3f3f3;
}

.kasite {
  padding: 5px 15px;
  display: flex;
  align-items: top;
  width: 100%;
  line-height: 2.5em;

  .termi {
    flex-grow: 2;
    font-weight: 600;
    width: 6em;
    min-width: auto;
  }

  .termi.closed {
    white-space: nowrap;

    ::v-deep div {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .selitys {
    margin-left: 10px;
    flex-grow: 6;
    width: 10em;
    min-width: auto;
    overflow: hidden;
    line-height: 1.5em;

    ::v-deep img {
      max-width: 100%;
    }

  }

  .selitys.open {
    margin-top: 0.5em;
  }

  .selitys.closed {
    height: 2.5em;
    line-height: 2.5em;
    white-space: nowrap;
    text-overflow: ellipsis;

    ::v-deep p {
      margin: 0;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .toiminnot {
    flex-grow: 1;
    text-align: right;
    width: 7em;
  }
  .toiminnot svg {
    color: #222;
  }
}
</style>
