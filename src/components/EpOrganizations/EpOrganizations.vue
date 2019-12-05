<template>
<div class="organisaatiot">
  <ep-form-content name="organisaatiot">
    <div class="selectors">
      <div class="form-group required">
        <label>{{ $t('kunnat') }}*</label>
        <ep-multi-select :multiple="true"
          :is-editing="true"
          :options="filteredKunnat"
          :validation="$v.valitutKunnat"
          :value="valitutKunnat"
          @input="updateKunnat"
          @search="query.kunnat = $event"
          help="ops-koulutuksen-jarjestaja-ohje"
          track-by="koodiUri"
          required>
          <template slot="singleLabel" slot-scope="{ option }">
            <span class="selected">{{ $kaanna(option.nimi) }}</span>
          </template>
          <template slot="option" slot-scope="{ option }">
            <div>{{ $kaanna(option.nimi) }}</div>
          </template>
          <template slot="tag" slot-scope="{ option, remove }">
            <span class="selected">
              <span>{{ $kaanna(option.nimi) }}</span>
              <button class="btn btn-link" @click="remove(option)">
                <fas icon="times">
                </fas>
              </button>
            </span>
          </template>
        </ep-multi-select>
      </div>
    </div>

    <div class="selectors">
      <label>{{ $t('jarjestajat') }}*</label>
      <ep-multi-select :multiple="true"
                       :value="valitutJarjestajat"
                       track-by="oid"
                       :validation="$v.valitutJarjestajat"
                       :is-editing="true"
                       @input="updateJarjestajat"
                       @search="query.jarjestajat = $event"
                       :options="filteredJarjestajat"
                       help="ops-koulutuksen-jarjestaja-ohje">
        <template slot="singleLabel" slot-scope="{ option }">
          <span class="selected">{{ $kaanna(option.nimi) }}</span>
        </template>
        <template slot="option" slot-scope="{ option }">
          <div>{{ $kaanna(option.nimi) }}</div>
        </template>
        <template slot="tag" slot-scope="{ option, remove }">
          <span class="selected">
            <span>{{ $kaanna(option.nimi) }}</span>
            <button class="btn btn-link" @click="remove(option)">
              <fas icon="times">
              </fas>
            </button>
          </span>
        </template>
      </ep-multi-select>
    </div>

    <div class="selectors">
      <label>{{ $t('oppilaitokset') }}</label>
      <ep-multi-select :multiple="true"
                       :value="valitutOppilaitokset"
                       :validation="$v"
                       @search="query.oppilaitokset = $event"
                       @input="updateOppilaitokset"
                       :is-editing="true"
                       track-by="oid"
                       :options="filteredOppilaitokset"
                       help="ops-oppilaitokset-ohje">
        <template slot="singleLabel" slot-scope="{ option }">
          <span class="selected">{{ $kaanna(option.nimi) }}</span>
        </template>
        <template slot="option" slot-scope="{ option }">
          <div>{{ $kaanna(option.nimi) }}</div>
        </template>
        <template slot="tag" slot-scope="{ option, remove }">
          <span class="selected">
            <span>{{ $kaanna(option.nimi) }}</span>
            <button class="btn btn-link" @click="remove(option)">
              <fas icon="times">
              </fas>
            </button>
          </span>
        </template>
      </ep-multi-select>
    </div>

  </ep-form-content>
</div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { minLength, required } from 'vuelidate/lib/validators';
import { Kielet } from '@shared/stores/kieli';
import { koulutustyypinOppilaitokset } from '@/utils/perusteet';
import { metadataToTeksti } from '@/utils/organisaatiot';
import { Ulkopuoliset } from '@/api';

import EpButton from '@/components/EpButton/EpButton.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpMultiSelect from '@/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpValidation from '@/mixins/EpValidation';

interface ValueType {
  jarjestajat: any[];
  oppilaitokset: any[];
  kunnat: any[];
}


@Component({
  components: {
    EpButton,
    EpFormContent,
    EpMultiSelect,
    EpSpinner,
    EpToggle,
  },
})
export default class EpOrganizations extends Mixins(EpValidation) {
  @Prop({ required: true })
  value!: ValueType;

  @Prop({ required: false })
  koulutustyyppi: string | null = null;

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
      .sortBy(org => this.kayttajanOrganisaatiot[org.oid])
      .value();
  }

  get filteredKunnat() {
    return this.filterAndSort(this.kunnat, this.query.kunnat);
  }

  get filteredJarjestajat() {
    return this.filterAndSort(this.jarjestajat, this.query.jarjestajat);
  }

  get filteredOppilaitokset() {
    return this.filterAndSort(this.oppilaitokset, this.query.oppilaitokset);
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
