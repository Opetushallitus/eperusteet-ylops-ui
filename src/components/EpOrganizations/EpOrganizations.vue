<template>
<div class="organisaatiot">
  <ep-form-content name="organisaatiot">
    <div class="selectors">
      <div class="form-group required mb-5">
        <label>{{ $t('kunnat') }}*</label>
        <ep-multi-list-select
          :value="valitutKunnat"
          tyyppi="kunta"
          :items="kunnatSelectOptions"
          @input="updateKunnat"
          :validation="$v.valitutKunnat"/>
      </div>
    </div>

    <div class="selectors mb-5">
      <label>{{ $t('jarjestajat') }}*</label>
      <ep-multi-list-select
          :value="valitutJarjestajat"
          tyyppi="koulutuksen-jarjestaja"
          :items="jarjestajatSelectOptions"
          @input="updateJarjestajat"
          :validation="$v.valitutJarjestajat"/>
    </div>

    <div class="selectors mb-5">
      <label>{{ $t('oppilaitokset') }}</label>
      <ep-multi-list-select
          :value="valitutOppilaitokset"
          tyyppi="oppilaitos"
          :items="oppilaitoksetSelectOptions"
          @input="updateOppilaitokset"
          :validation="$v"/>
    </div>

  </ep-form-content>
</div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';

import { minLength, required } from 'vuelidate/lib/validators';
import { Kielet } from '@shared/stores/kieli';
import { koulutustyypinOppilaitokset } from '@/utils/perusteet';
import { metadataToTeksti } from '@/utils/organisaatiot';
import { Ulkopuoliset } from '@/api';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiListSelect from '@shared/components/forms/EpMultiListSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpValidation from '@shared/mixins/EpValidation';

interface ValueType {
  jarjestajat: any[];
  oppilaitokset: any[];
  kunnat: any[];
}


@Component({
  components: {
    EpButton,
    EpFormContent,
    EpMultiListSelect,
    EpSpinner,
    EpToggle,
  },
})
export default class EpOrganizations extends Mixins(EpValidation) {
  @Prop({ required: true })
  value!: ValueType;

  @Prop({ default: null })
  koulutustyyppi!: string | null;

  kayttajanOrganisaatiot: any = {};
  kunnat: any[] = [];
  jarjestajat: any[] = [];
  oppilaitokset: any[] = [];

  valitutKunnat: any[] = [];
  valitutJarjestajat: any[] = [];
  valitutOppilaitokset: any[] = [];

  query = {
    jarjestajat: '',
    oppilaitokset: '',
    kunnat: '',
  };

  get validationConfig() {
    return {
      valitutKunnat: {
        required,
        'min-length': minLength(1),
      },
      valitutJarjestajat: {
        required,
        'min-length': minLength(1),
      },
    };
  }

  filterAndSort(orgs, query) {
    return _.chain(orgs)
      .filter(org => Kielet.search(query, org.nimi))
      .sortBy(org => Kielet.kaanna(org.nimi))
      // Aakkosjärjestys selkeämpi?
      // .sortBy(org => this.kayttajanOrganisaatiot[org.oid])
      .value();
  }

  get filteredKunnat() {
    return this.filterAndSort(this.kunnat, this.query.kunnat);
  }

  get kunnatSelectOptions() {
    return _.chain(this.filteredKunnat)
      .map(org => {
        return {
          value: org,
          text: (this as any).$kaanna((org as any).nimi),
        };
      })
      .value();
  }

  get filteredJarjestajat() {
    return this.filterAndSort(this.jarjestajat, this.query.jarjestajat);
  }

  get jarjestajatSelectOptions() {
    return _.chain(this.filteredJarjestajat)
      .map(org => {
        return {
          value: org,
          text: (this as any).$kaanna((org as any).nimi),
        };
      })
      .value();
  }

  get filteredOppilaitokset() {
    return this.filterAndSort(this.oppilaitokset, this.query.oppilaitokset);
  }

  get oppilaitoksetSelectOptions() {
    return _.chain(this.filteredOppilaitokset)
      .map(org => {
        return {
          value: org,
          text: (this as any).$kaanna((org as any).nimi),
        };
      })
      .value();
  }

  updateInput() {
    this.$emit('input', {
      kunnat: this.valitutKunnat,
      jarjestajat: this.valitutJarjestajat,
      oppilaitokset: this.valitutOppilaitokset,
    });
  }

  updateOppilaitokset(valitut) {
    this.valitutOppilaitokset = valitut;
    this.updateInput();
  }

  updateJarjestajat(valitut) {
    this.valitutJarjestajat = valitut;
    this.oppilaitokset = _.chain(valitut)
      .map('children')
      .flatten()
      .sortBy((org: any) => Kielet.kaanna(org.nimi))
      .value();
    const jarjestajaOids = _.map(this.valitutJarjestajat, 'oid');
    this.valitutOppilaitokset = _.filter(this.valitutOppilaitokset,
      ol => _.includes(jarjestajaOids, ol.parentOid));
    this.updateInput();
  }

  async updateKunnat(kunnat) {
    this.valitutKunnat = kunnat;
    this.jarjestajat = _.chain((await Ulkopuoliset.getKoulutustoimijat(
      _.map(kunnat, 'koodiUri'),
      koulutustyypinOppilaitokset(this.koulutustyyppi))).data)
      .sortBy((org: any) => Kielet.kaanna(org.nimi))
      .value();

    const kuntaUris = _.map(kunnat, 'koodiUri');
    this.valitutJarjestajat = _.filter(
      this.valitutJarjestajat,
      jarjestaja => _.includes(kuntaUris, jarjestaja.kotipaikkaUri));
    this.updateJarjestajat(this.valitutJarjestajat);
  }

  async update() {
    const kunnat = (await Ulkopuoliset.kaikkiKoodistonKoodit('kunta')).data;
    this.kunnat = _.chain(kunnat)
      .map((kunta: any) => ({
        ...kunta,
        nimi: metadataToTeksti('nimi', kunta.metadata),
      }))
      .sortBy(org => Kielet.kaanna(org.nimi))
      .value();

    this.kayttajanOrganisaatiot = _.chain((await Ulkopuoliset.getUserOrganisations()).data)
      .reject(_.isNull)
      .keyBy('oid')
      .value();
  }

  @Watch('value', { immediate: true })
  onValueChange(value) {
    this.valitutKunnat = value.kunnat;
    this.valitutJarjestajat = value.jarjestajat;
    this.valitutOppilaitokset = value.oppilaitokset;
  }

  mounted() {
    this.update();
  }

}

</script>

<style scoped lang="scss">
.selectors {
  margin-top: 25px;

  h6 {
    color: #555;

    &.required {
      font-weight: bolder;
    }
  }

}
</style>
