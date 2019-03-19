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
            input.form-check-input(:id="org.oid", type="checkbox", v-model="org.checked")
            label.form-check-label(:for="org.oid") {{ $kaanna(org.nimi) }}

          p
            b-button.float-right(variant="link", v-b-modal="'createKysymys'")
              fas.mr-2(icon="plus-circle")
              span {{ $t('lisaa-uusi-kysymys') }}

      // Kysymykset
      div.row(v-for="kysymys in kysymyksetFormatted", :key="kysymys.id")
        div.col.col-fixed.col-new
          // Kysymys on uusi jos alle 30 päivää vanha
          // Todo: Toteuta paremmalla tavalla uusi
          p.float-right(ng-if="(new Date().getTime() - kysymys.luotu) / 1000 / 60 / 60 / 24 < 30") {{ $t('uusi') }}
        div.col
          .float-right
            p
              button.btn.btn-link
                fas(icon="pen")
              button.btn.btn-link
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
            div
              a.pr-2.d-inline(href="")
                fas.mr-2(:icon="['far','comment']")
                span {{ $t('kommentoi') }}
              p.px-2.d-inline.qty {{ $t('kommenttia', { maara: 0 }) }}
            hr

  // Uuden kysymyksen luonnin modaali
  b-modal(
    size="lg",
    id="createKysymys",
    @ok="createKysymys")
    template(slot="modal-title")
      span.mr-2 {{ $t('lisaa-uusi-kysymys') }}

      // Sisällön kieli
      b-dropdown.float-right(size="sm")
        template(slot="button-content")
          span {{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}
        b-dropdown-item(
          @click="valitseSisaltoKieli(kieli)",
          v-for="kieli in sovelluksenKielet",
          :key="kieli",
          :disabled="kieli === sisaltoKieli") {{ kieli }}

    div
      ep-form-content(name="kysymys-nimi")
        ep-content(
          v-model="newKysymys.kysymys",
          help="kysymys-nimi-ohje",
          :is-editable="true")

      ep-form-content(name="kysymys-vastaus")
        ep-content(
          v-model="newKysymys.vastaus",
          help="kysymys-vastaus-ohje",
          :is-editable="true")
    template(slot="modal-cancel") {{ $t('peruuta') }}
    template(slot="modal-ok") {{ $t('lisaa-kysymys') }}
    pre {{ newKysymys }}


</template>

<script lang="ts">

import _ from 'lodash';
import { Component, Mixins } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoot';
import {
  EpAikaleima,
  EpIcon,
  EpNavigation,
  EpSpinner,
  EpContent,
  EpFormContent,
} from "@/components";
import { Kysymykset, Ulkopuoliset } from "@/api";
import { KysymysDto } from '@/generated';
import { Kielet, UiKielet } from "@/stores/kieli";
import { Kieli } from '@/tyypit';

@Component({
  components: {
    EpAikaleima,
    EpNavigation,
    EpSpinner,
    EpIcon,
    EpContent,
    EpFormContent,
  },
})
export default class UkkRoute extends Mixins(EpRoute) {

  private rajain = '';

  private kysymykset: KysymysDto[] = [];

  private orgs: any[] = [];

  private newKysymys: KysymysDto = {};

  public async mounted() {
    this.kysymykset = (await Kysymykset.getKysymykset()).data;

    // Haetaan käyttäjän organisaatiot
    const orgs = _((await Ulkopuoliset.getUserOrganisations()).data)
      .remove(org => org.oid !== '1.2.246.562.10.00000000001') // Asetetaan erikseen
      .value();

    // TODO: Tee rajapinta backendiin, joka käyttää organisaatiopalvelua
    this.orgs.push({
      nimi: {
        fi: 'Opetushallitus',
        sv: 'Utbildningsstyrelsen',
        en: 'Finnish National Agency for Education'
      },
      oid: '1.2.246.562.10.00000000001',
      checked: true
    });
    this.orgs.push(...orgs);
  }

  private get kysymyksetFormatted() {
    // Todo: Ota huomioon sisältökieli
    return _(this.kysymykset)
      .filter((k: any) => _.includes(_.lowerCase(_.get(k, 'kysymys.fi')), _.lowerCase(this.rajain)))
      .sortBy(this.kysymykset, 'luotu', 'desc')
      .value();
  }

  private get organisaatiot() {
    return this.orgs;
  }

  private async createKysymys(event: any) {
    const res = (await Kysymykset.createKysymys(this.newKysymys)).data;
    this.kysymykset.push(res);
    this.newKysymys = {};
    console.log(res);
  }

  // TODO: tämä voisi olla oma komponentti
  get sisaltoKieli() { return Kielet.getSisaltoKieli(); }
  get sovelluksenKielet() { return UiKielet; }
  private valitseSisaltoKieli(kieli: Kieli) {
    Kielet.setSisaltoKieli(kieli);
  }

}

</script>

<style scoped lang="scss">

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
