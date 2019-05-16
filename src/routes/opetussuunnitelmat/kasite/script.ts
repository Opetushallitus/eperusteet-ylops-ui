
import _ from 'lodash';

import { Component } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';

import EpOpsRoute from '@/mixins/EpOpsRoute';
import { EpContent, EpFormContent, EpSearch, EpSpinner } from '@/components';
import EpInput from '@/components/forms/EpInput.vue';
import { Termisto } from '@/api';

import { Kielet, UiKielet } from '@/stores/kieli';
import { Kieli, TermiDto } from '@/tyypit';
import { kasiteValidator } from '@/validators/kasite';

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
  private termisto: Kasite[] = [];
  private kasite: TermiDto = {};
  private hakusana: string = '';

  avaaLuontiModal(e) {
    this.kasite = {
      termi: {},
    };
    (this as any).$refs.terminLuontiModal.show();
  }

  avaaMuokkausModal(kasite) {
    this.kasite = _.cloneDeep(kasite);
    (this as any).$refs.terminLuontiModal.show();
  }

  async poistaKasite(kasite) {
    try {
      await Termisto.deleteTermi(this.opsId, kasite.id);
      _.remove(this.termisto, k => k.kasite.id === kasite.id);
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
        this.termisto.push({
          closed: true,
          kasite: res.data,
        });
      }
      else {
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
      (this as any).$refs.terminLuontiModal.hide();
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
    return this.termisto.filter(
      termi =>
        _.includes(
          _.toLower(_.get(termi, 'kasite.termi.' + Kielet.getSisaltoKieli())),
          _.toLower(this.hakusana)
        )
        || _.includes(
          _.toLower(_.get(termi, 'kasite.selitys.' + Kielet.getSisaltoKieli())),
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
