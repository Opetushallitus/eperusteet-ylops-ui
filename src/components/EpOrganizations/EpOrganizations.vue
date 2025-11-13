<template>
<div class="organisaatiot">
  <ep-form-content :showHeader="false">
    <div class="selectors">
      <div class="form-group required mb-4">
        <label>{{ $t('kunnat') }} *</label>
        <ep-multi-list-select
          v-model="valitutKunnat"
          tyyppi="kunta"
          :items="kunnatSelectOptions"
          @input="updateKunnat"
          :validation="$v.valitutKunnat"
          :is-loading="kunnat.length === 0"
          :required="true"
          :equality="kuntaEquals"/>
      </div>
    </div>

    <div class="selectors mb-4" :class="{'disabled-events': valitutKunnat.length === 0}">
      <label>{{ $t('jarjestajat') }} *</label>
      <ep-multi-list-select
          v-model="valitutJarjestajat"
          tyyppi="koulutuksen-jarjestaja"
          :items="jarjestajatSelectOptions"
          @input="updateJarjestajat"
          :validation="$v.valitutJarjestajat"
          :is-loading="kunnatLoading"
          :required="true"
          :equality="jarjestajaEquals"/>
    </div>

    <div class="selectors mb-4" :class="{'disabled-events': valitutJarjestajat.length === 0}">
      <div class="d-flex">
        <label>{{ $t('oppilaitokset') }}</label>
        <slot name="oppilaitokset-label-suffix" />
      </div>
      <ep-multi-list-select
          v-model="valitutOppilaitokset"
          tyyppi="oppilaitos"
          :items="oppilaitoksetSelectOptions"
          @input="updateOppilaitokset"
          :is-loading="jarjestajatLoading || kunnatLoading"
          :equality="jarjestajaEquals"/>
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
import { Ulkopuoliset } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiListSelect from '@shared/components/forms/EpMultiListSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpValidation from '@shared/mixins/EpValidation';
import { Koulutustyyppi } from '@shared/tyypit';

interface ValueType {
  jarjestajat: any[];
  oppilaitokset: any[];
  kunnat: any[];
  ryhmat: any[];
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

  @Prop({ default: false })
  lakkautetut!: boolean;

  kayttajanOrganisaatiot: any = {};
  kunnat: any[] = [];
  jarjestajat: any[] = [];
  oppilaitokset: any[] = [];
  valitutKunnat: any[] = [];
  valitutJarjestajat: any[] = [];
  valitutOppilaitokset: any[] = [];

  kunnatLoading: boolean = false;
  jarjestajatLoading: boolean = false;
  ryhmatLoading: boolean = false;

  query = {
    jarjestajat: '',
    oppilaitokset: '',
    kunnat: '',
  };

  get taiteenperusopetus() {
    return this.koulutustyyppi === Koulutustyyppi.tpo;
  }

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
      .map(org => _.omit(org, 'children'))
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
      .filter(org => this.lakkautetut || org.status !== 'PASSIIVINEN')
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
    this.jarjestajatLoading = true;
    this.valitutJarjestajat = valitut;
    const valitutJarjestajat = _.filter(this.jarjestajat, (jarjestaja) => _.includes(_.map(valitut, 'koodiUri'), jarjestaja.koodiUri));
    this.oppilaitokset = _.chain(valitutJarjestajat)
      .map('children')
      .flatten()
      .map(oppilaitos => {
        return {
          ...oppilaitos,
          tyypit: ['Oppilaitos'],
        };
      })
      .sortBy((org: any) => Kielet.kaanna(org.nimi))
      .value();
    const jarjestajaOids = _.map(this.valitutJarjestajat, 'oid');

    this.valitutOppilaitokset = _.chain(this.valitutOppilaitokset)
      .filter(valittuOppilaitos => _.find(this.oppilaitokset, oppilaitos => this.jarjestajaEquals(oppilaitos, valittuOppilaitos)))
      .map(valittuOppilaitos => _.find(this.oppilaitokset, oppilaitos => this.jarjestajaEquals(oppilaitos, valittuOppilaitos)))
      .filter(valittuOppilaitos => _.includes(jarjestajaOids, valittuOppilaitos.parentOid))
      .value();

    this.updateOppilaitokset(this.valitutOppilaitokset);
    this.updateInput();
    this.jarjestajatLoading = false;
  }

  async updateKunnat(kunnat) {
    this.kunnatLoading = true;
    this.valitutKunnat = kunnat;
    this.jarjestajat = _.chain((await Ulkopuoliset.getKoulutustoimijat(
      _.map(kunnat, 'koodiUri'),
      koulutustyypinOppilaitokset(this.koulutustyyppi))).data)
      .sortBy((org: any) => Kielet.kaanna(org.nimi))
      .value();

    const kuntaUris = _.map(kunnat, 'koodiUri');

    this.valitutJarjestajat = _.filter(
      this.valitutJarjestajat,
      valittuJarjestaja => _.some(this.jarjestajat, jarjestaja => this.jarjestajaEquals(jarjestaja, valittuJarjestaja)),
    );

    this.updateJarjestajat(this.valitutJarjestajat);
    this.kunnatLoading = false;
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
  }

  @Watch('value', { immediate: true })
  async onValueChange(value) {
    this.valitutKunnat = value.kunnat;
    this.valitutJarjestajat = value.jarjestajat;
    this.valitutOppilaitokset = value.oppilaitokset;
  }

  async mounted() {
    await this.update();
  }

  async kouluryhmaChange() {
    this.valitutJarjestajat = [];
    this.valitutOppilaitokset = [];
  }

  get kuntaEquals() {
    return (val1, val2) => _.isEqual(_.get(val1, 'koodiUri'), _.get(val2, 'koodiUri'));
  }

  get jarjestajaEquals() {
    return (val1, val2) => _.isEqual(_.get(val1, 'oid'), _.get(val2, 'oid'));
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
