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

    <div v-if="taiteenperusopetus">
      <label>{{ $t('organisaation-tyyppi') }} *</label>
      <b-form-group class="mt-0">
        <b-form-radio
          v-model="kouluryhma"
          name="koulu"
          @change="kouluryhmaChange"
          value="koulu">{{ $t('koulu') }}</b-form-radio>
        <b-form-radio
          v-model="kouluryhma"
          name="ryhma"
          @change="kouluryhmaChange"
          value="ryhma">{{ $t('ryhma') }}</b-form-radio>
      </b-form-group>
    </div>

    <div class="selectors mb-4" v-if="kouluryhma === 'ryhma'">
      <label>{{ $t('ryhmat') }} *</label>
      <ep-multi-list-select
          v-model="valitutRyhmat"
          tyyppi="ryhma"
          :items="ryhmaSelectOptions"
          :validation="$v.valitutRyhmat"
          :is-loading="!ryhmat"
          @input="updateRyhmat"
          :required="true"
          :equality="jarjestajaEquals"/>
    </div>

    <div v-else-if="kouluryhma === 'koulu'">
      <div class="selectors mb-4">
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

      <div class="selectors mb-4">
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

  kayttajanOrganisaatiot: any = {};
  kunnat: any[] = [];
  jarjestajat: any[] = [];
  oppilaitokset: any[] = [];
  ryhmat: any[] | null = null;

  valitutKunnat: any[] = [];
  valitutJarjestajat: any[] = [];
  valitutOppilaitokset: any[] = [];
  valitutRyhmat: any[] = [];

  kunnatLoading: boolean = false;
  jarjestajatLoading: boolean = false;
  ryhmatLoading: boolean = false;

  kouluryhmaModel: 'koulu' | 'ryhma' | null = null;

  query = {
    jarjestajat: '',
    oppilaitokset: '',
    kunnat: '',
  };

  get taiteenperusopetus() {
    return this.koulutustyyppi === Koulutustyyppi.tpo;
  }

  get kouluryhma() {
    if (!this.taiteenperusopetus) {
      return 'koulu';
    }

    return this.kouluryhmaModel;
  }

  set kouluryhma(value) {
    this.kouluryhmaModel = value;
  }

  get validationConfig() {
    if (this.kouluryhma === 'koulu') {
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

    if (this.kouluryhma === 'ryhma') {
      return {
        valitutKunnat: {
          required,
          'min-length': minLength(1),
        },
        valitutRyhmat: {
          required,
          'min-length': minLength(1),
        },
      };
    }
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

  get ryhmaSelectOptions() {
    return _.chain(this.ryhmat)
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
      ryhmat: this.valitutRyhmat,
    });
  }

  updateRyhmat(valitut) {
    this.valitutRyhmat = valitut;
    this.updateInput();
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
      valittuJarjestaja => _.some(this.jarjestajat, jarjestaja => this.jarjestajaEquals(jarjestaja, valittuJarjestaja))
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
  onValueChange(value) {
    this.valitutKunnat = value.kunnat;
    this.valitutJarjestajat = value.jarjestajat;
    this.valitutOppilaitokset = value.oppilaitokset;
    this.valitutRyhmat = value.ryhmat;
  }

  async mounted() {
    if (_.find(this.value.jarjestajat, jarjestaja => _.includes(jarjestaja.tyypit, 'Ryhma'))) {
      this.kouluryhma = 'ryhma';
      this.ryhmat = (await Ulkopuoliset.getOrganisaatioRyhmat()).data;
      this.updateRyhmat(this.value.jarjestajat);
    }
    else if (!_.isEmpty(this.value.jarjestajat)) {
      this.kouluryhma = 'koulu';
    }

    await this.update();
  }

  async kouluryhmaChange() {
    if (!this.ryhmat) {
      this.ryhmat = (await Ulkopuoliset.getOrganisaatioRyhmat()).data;
    }

    this.valitutJarjestajat = [];
    this.valitutOppilaitokset = [];
    this.valitutRyhmat = [];
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
