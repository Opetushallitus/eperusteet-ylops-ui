import _ from 'lodash';
import { Component, Mixins } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';
import EpRoute from '@/mixins/EpRoot';
import {
  EpAikaleima,
  EpContent,
  EpFormContent,
  EpIcon,
  EpKaanna,
  EpMainView,
  EpNavigation,
  EpSearch,
  EpSelect,
  EpSpinner,
} from '@/components';
import { Kysymykset, Ulkopuoliset } from '@/api';
import { Kielet, UiKielet } from '@/stores/kieli';
import { Kieli, KysymysDto } from '@/tyypit';
import { kysymysValidator } from '@/validators/ukk';
import { organizations } from '@/utils/organisaatiot';

@Component({
  components: {
    EpAikaleima,
    EpContent,
    EpFormContent,
    EpIcon,
    EpKaanna,
    EpMainView,
    EpNavigation,
    EpSearch,
    EpSelect,
    EpSpinner,
  },
  mixins: [
    EpRoute,
    validationMixin
  ],
  validations() {
    return {
      kysymys: {
        ...(this as any).validator,
      },
    };
  },
})
export default class RouteUkk extends Mixins(EpRoute) {
  private rajain = '';

  private kysymykset: any[] = [];

  private orgs: any[] = [];

  private kysymys: KysymysDto = {
    $uusi: true,
    organisaatiot: []
  };

  async init() {
    try {
      this.kysymykset = (await Kysymykset.getKysymykset() as any).data;

      // Haetaan käyttäjän organisaatiot
      const orgs = (await Ulkopuoliset.getUserOrganisations() as any).data;

      if (!_.find(orgs, o => o.oid === organizations.oph.oid)) {
        orgs.push(organizations.oph);
      }

      // Ei rajausta oletuksena
      _.each(orgs, o => {
        o.$checked = true;
      });

      this.orgs = orgs;
    }
    finally {
      // Todo: isLoading;
    }
  }

  private get validator() {
    return kysymysValidator([
      Kielet.getSisaltoKieli() // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  private get validation() {
    return (this as any).$v.kysymys;
  }

  private get kysymyksetFormatted() {
    return _(this.kysymykset)
      // Suodata kysymyksellä
      .filter((k: any) => _.includes(
        _.toLower(_.get(k, 'kysymys.' + Kielet.getSisaltoKieli())),
        _.toLower(this.rajain)
      ))
      // Suodata organisaatiolla
      .filter((k: any) => {
        // Tehdään lista valituista organisaatioista
        const checked: string[] = [];
        _.each(this.organisaatiot, org => {
          if (org.$checked) {
            checked.push(org.oid);
          }
        });

        // Tarkistetaan, löytyykö organisaatio haettavien joukosta
        let found = false;
        const kOrgs = _.map(k.organisaatiot, 'oid');
        _.each(checked, oid => {
          found = found || _.includes(kOrgs, oid);
        });

        return found;
      })
      .sortBy((k: any) => -k.luotu) // Laskeva järjestys
      .value();
  }

  private get organisaatiot() {
    return _.sortBy(this.orgs, o => _.get(o, 'nimi.' + Kielet.getSisaltoKieli()));
  }

  private get organisaatiotOptions() {
    return _.map(this.organisaatiot, o => _.get(o, 'nimi.' + Kielet.getSisaltoKieli()));
  }

  // Luodaan uusi kysymys tai muokataan kysymystä riippuen tilanteesta
  private async createUpdateKysymys(event: any) {
    event.preventDefault(); // Piilotetaan modaali myöhemmin
    try {
      if (this.kysymys.id) {
        // Muokataan olemassa olevaa
        const res = (await Kysymykset.updateKysymys(this.kysymys.id, (this as any).kysymys) as any).data;
        _.remove(this.kysymykset, k => k.id === res.id);
        this.kysymykset.push(res);
      }
      else {
        // Luodaan uusi kysymys
        const res = (await Kysymykset.createKysymys((this as any).kysymys) as any).data;
        this.kysymykset.push(res);
      }
      (this as any).$refs.createUpdateKysymys.hide();
    }
    catch (e) {
      // Todo: Tallentaminen epäonnistui
    }
  }

  // Poistetaan olemassa oleva kysymys
  private async deleteKysymys() {
    if (!this.kysymys || !this.kysymys.id) {
      return;
    }

    try {
      (await Kysymykset.deleteKysymys(this.kysymys.id));
      _.remove(this.kysymykset, k => k.id === this.kysymys.id);
      // Reaktiivisuus täytyy hoitaa käsin tässä tilanteessa
      this.kysymykset = [
        ...this.kysymykset
      ];
    }
    catch (e) {
      // Todo: Poistaminen epäonnistui
    }
  }

  // Aloitetaan kysymyksen muokkaamisen modaali
  private startKysymysModal(kysymys: KysymysDto) {
    if (kysymys) {
      this.kysymys = {
        $uusi: false,
        ..._.cloneDeep(kysymys)
      };
    }
    else {
      this.kysymys = {
        organisaatiot: [],
        $uusi: true
      };
    }
    (this as any).$refs.createUpdateKysymys.show();
  }

  // Aloitetaan kysymyksen poiston modaali
  private startRemoveKysymys(kysymys: KysymysDto) {
    this.kysymys = {
      $uusi: false,
      ..._.cloneDeep(kysymys)
    };
    (this as any).$refs.removeKysymys.show();
  }

  // TODO: tämä voisi olla oma komponentti
  // Modaalin kielivalitsimen metodit
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
