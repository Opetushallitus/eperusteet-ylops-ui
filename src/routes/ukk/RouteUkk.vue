<template lang="pug">

div
  ep-navigation(tyyli="ops")

  div.content
    div.container-fluid
      // Rajaimet
      div.row
        div.col.col-fixed
          ep-icon.float-right(icon="question", background-color="#CE52C6")
        div.col
          h2 {{ $t('ukk') }}

          p {{ $t('ukk-kuvaus-nakyma') }}
          div.form-group.has-search
            span.form-control-feedback
              fas(icon="search")
            input.form-control.mb-3(type="search", :placeholder="$t('etsi') + '…'" v-model="rajain")

          p {{ $t('ukk-luoja-rajaus') }}:
          .form-check.form-check-inline(v-for="org in organisaatiot")
            input.form-check-input(:id="org.oid", type="checkbox", v-model="org.$checked")
            label.form-check-label(:for="org.oid") {{ $kaanna(org.nimi) }}

          p
            b-button.float-right(variant="link", @click="startCreateKysymys")
              fas.mr-2(icon="plus-circle")
              span {{ $t('lisaa-uusi-kysymys') }}

      // Kysymykset
      div.row(v-for="kysymys in kysymyksetFormatted", :key="kysymys.id")
        div.col.col-fixed.col-new
          // Todo: Toteuta profiililla uusi
          // Kysymys on uusi jos alle 30 päivää vanha
          //p.float-right(v-if="(new Date().getTime() - kysymys.luotu) / 1000 / 60 / 60 / 24 < 30") {{ $t('uusi') }}
        div.col
          .float-right
            button.btn.btn-link(@click="startUpdateKysymys(kysymys)")
              fas(icon="pen")
            button.btn.btn-link(@click="deleteKysymys(kysymys)")
              fas(icon="times")
          div
            p
              ep-aikaleima.text-secondary(:value="kysymys.luotu" type="ago")
            h5
              ep-content(
                v-model="kysymys.kysymys",
                :is-editable="false")
            p.text-secondary
              ep-content(
                v-model="kysymys.vastaus",
                :is-editable="false")
            //div
              a.pr-2.d-inline(href="")
                fas.mr-2(:icon="['far','comment']")
                span {{ $t('kommentoi') }}
              p.px-2.d-inline.qty {{ $t('kommenttia', { maara: 0 }) }}
            hr

  // Kysymyksen luomisen/muokkaamisen modaali
  b-modal.backdrop(
    id="createUpdateKysymys",
    ref="createUpdateKysymys"
    @ok="createUpdateKysymys",
    :no-close-on-backdrop="true",
    :lazy="true",
    :ok-disabled="validation.$invalid",
    size="lg")
    template(slot="modal-title")
      span.mr-2 {{ kysymys.$uusi ? $t('lisaa-uusi-kysymys') : $t('muokkaa-kysymys') }}

      // Sisällön kieli
      b-dropdown.float-right(size="sm")
        template(slot="button-content")
          span {{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}
        b-dropdown-item(
          @click="valitseSisaltoKieli(kieli)",
          v-for="kieli in sovelluksenKielet",
          :key="kieli",
          :disabled="kieli === sisaltoKieli") {{ kieli }}

    ep-form-content(name="kysymys-nimi")
      ep-content(
        v-model="kysymys.kysymys",
        help="kysymys-nimi-ohje",
        :validation="validation.kysymys",
        :is-editable="true")

    ep-form-content(name="kysymys-vastaus")
      ep-content(
        v-model="kysymys.vastaus",
        help="kysymys-vastaus-ohje",
        :validation="validation.vastaus",
        :is-editable="true")

    ep-form-content(name="nayta-organisaatioissa")
      ep-select(
        help="kysymys-organisaatiot-ohje",
        v-model="kysymys.organisaatiot",
        :validation="validation.organisaatiot",
        :is-editing="true",
        :items="organisaatiot",
        :multiple="true")
        template(slot="item", slot-scope="{ item }")
          span {{ $kaanna(item.nimi) }}

    template(slot="modal-cancel") {{ $t('peruuta') }}
    template(slot="modal-ok") {{ kysymys.$uusi ? $t('lisaa-kysymys') : $t('tallenna') }}

</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Mixins } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';
import EpRoute from '@/mixins/EpRoot';
import {
  EpAikaleima,
  EpIcon,
  EpNavigation,
  EpSpinner,
  EpContent,
  EpFormContent,
  EpSelect,
} from '@/components';
import { Kysymykset, Ulkopuoliset } from '@/api';
import { Kielet, UiKielet } from '@/stores/kieli';
import { Kieli, KysymysDto } from '@/tyypit';
import { kysymysValidator } from '@/validators/ukk';

@Component({
  components: {
    EpAikaleima,
    EpNavigation,
    EpSpinner,
    EpIcon,
    EpContent,
    EpFormContent,
    EpSelect,
  },
  mixins: [
    EpRoute,
    validationMixin,
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
    organisaatiot: [],
  };

  public async mounted() {
    this.kysymykset = (await Kysymykset.getKysymykset() as any).data;

    // Haetaan käyttäjän organisaatiot
    const orgs = (await Ulkopuoliset.getUserOrganisations() as any).data;

    if (!_.find(orgs, (o) => o.oid === '1.2.246.562.10.00000000001')) {
      this.orgs.push({
        nimi: {
          fi: 'Opetushallitus',
          sv: 'Utbildningsstyrelsen',
          en: 'Finnish National Agency for Education',
        },
        oid: '1.2.246.562.10.00000000001',
      });
    }

    // Ei rajausta oletuksena
    _.each(orgs, (o) => {
      o.$checked = true;
    });

    this.orgs.push(...orgs);
  }

  private get validator() {
    return kysymysValidator([
      Kielet.getSisaltoKieli(), // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  private get validation() {
    return (this as any).$v.kysymys;
  }

  private get kysymyksetFormatted() {
    return _(this.kysymykset)
      // Suodata kysymyksellä
      .filter((k: any) => _.includes(
        _.lowerCase(_.get(k, 'kysymys.' + Kielet.getSisaltoKieli())),
        _.lowerCase(this.rajain),
      ))
      // Suodata organisaatiolla
      .filter((k: any) => {
        // Tehdään lista valituista organisaatioista
        const checked: string[] = [];
        _.each(this.organisaatiot, (org) => {
          if (org.$checked) {
            checked.push(org.oid);
          }
        });

        // Tarkistetaan, löytyykö organisaatio haettavien joukosta
        let found = false;
        const kOrgs = _.map(k.organisaatiot, 'oid');
        _.each(checked, (oid) => {
          found = found || _.includes(kOrgs, oid);
        });

        return found;
      })
      .sortBy((k: any) => -k.luotu) // Laskeva järjestys
      .value();
  }

  private get organisaatiot() {
    return _.sortBy(this.orgs, (o) => _.get(o, 'nimi.' + Kielet.getSisaltoKieli()));
  }

  private get organisaatiotOptions() {
    return _.map(this.organisaatiot, (o) => _.get(o, 'nimi.' + Kielet.getSisaltoKieli()));
  }

  // Luodaan uusi kysymys tai muokataan kysymystä riippuen tilanteesta
  private async createUpdateKysymys(event: any) {
    event.preventDefault(); // Piilotetaan modaali myöhemmin
    try {
      if (this.kysymys.id) {
        // Muokataan olemassa olevaa
        const res = (await Kysymykset.updateKysymys(this.kysymys.id, (this as any).kysymys) as any).data;
        _.remove(this.kysymykset, (k) => k.id === res.id);
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
  private async deleteKysymys(kysymys: any) {
    if (kysymys.id) {
      (await Kysymykset.deleteKysymys(kysymys.id));
      _.remove(this.kysymykset, (k) => k.id === kysymys.id);
      // Reaktiivisuus täytyy hoitaa käsin tässä tilanteessa
      this.kysymykset = [
        ...this.kysymykset,
      ];
    }
  }

  // Aloitetaan kysymyksen lisäämisen modaali
  private startCreateKysymys() {
    this.kysymys = {
      organisaatiot: [],
      $uusi: true,
    };
    (this as any).$refs.createUpdateKysymys.show();
  }

  // Aloitetaan kysymyksen muokkaamisen modaali
  private startUpdateKysymys(kysymys: KysymysDto) {
    this.kysymys = {
      $uusi: false,
      ..._.cloneDeep(kysymys),
    };
    (this as any).$refs.createUpdateKysymys.show();
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
</script>

<style scoped lang="scss">

@import "@/styles/_variables.scss";

.col-fixed {
  flex: 0 0 100px;
}

.col-new {
  color: #3367E3;
}
.qty {
  user-select: all;
}

.btn-link {
  text-decoration: none;
}

// FIXME: Haku komponentti voisi olla oma komponentti
.has-search .form-control {
  padding-left: 2.375rem;
  border-radius: 15px;
  background: #F3F3F3;
  border-width: 0;

  &::placeholder {
    color: #aaa;
  }

}

.has-search .form-control-feedback {
  position: absolute;
  z-index: 2;
  display: block;
  width: 2.375rem;
  height: 2.375rem;
  line-height: 2.375rem;
  text-align: center;
  pointer-events: none;
  color: #aaa;
}

</style>
