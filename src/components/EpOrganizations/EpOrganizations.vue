<template>
<div class="organisaatiot">
  <ep-form-content name="organisaatiot">
    <div class="selectors">
      <div class="options">
        <ep-toggle v-model="seutukunnille">
          {{ $t('seutukunta') }}
        </ep-toggle>
      </div>
    </div>
    <div class="selectors">
      <div v-if="seutukunnille" class="selectors">
        <h6>{{ $t('kunnat') }}</h6>
        <ep-multi-select :multiple="true"
                         v-model="valitutKunnat"
                         track-by="koodiUri"
                         :validation="kunnatValidation"
                         @search="query.kunnat = $event"
                         :is-editing="true"
                         :options="filteredKunnat"
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
    </div>

    <div class="selectors">
      <h6>{{ $t('jarjestajat') }}</h6>
      <ep-multi-select :multiple="true"
                       v-model="jarjestajat"
                       track-by="oid"
                       :validation="jarjestajatValidation"
                       :is-editing="true"
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
      <h6>{{ $t('oppilaitokset') }}</h6>
      <ep-multi-select :multiple="true"
                       v-model="oppilaitokset"
                       :validation="oppilaitosValidation"
                       @search="query.oppilaitokset = $event"
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

    <div v-if="!seutukunnille" class="selectors">
      <div v-if="kunnat.length > 0">
        <h6>{{ $t('kunnat') }}</h6>
        <ul class="kunnat">
          <li v-for="(kunta, idx) in kunnat" :key="idx">{{ $kaanna(kunta.nimi) }}</li>
        </ul>
      </div>
    </div>
  </ep-form-content>
</div>
</template>

<script lang="ts">

import EpButton from '@/components/EpButton/EpButton.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpMultiSelect from '@/components/forms/EpMultiSelect.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';

import _ from 'lodash';
import { Watch, Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import { OphOid, hasOrganisaatioTyyppi, metadataToTeksti } from '@/utils/organisaatiot';

import {
  Ulkopuoliset,
  Opetussuunnitelmat,
} from '@/api';

import {
  Kieli,
  OrganisaatioTyyppi,
} from '@/tyypit';

import EpValidation from '@/mixins/EpValidation';


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
  private value: any = null;
  private seutukunnille = false;
  private valitutKunnat: any[] = [];
  private kuntienJarjestajat: any = {};
  private jarjestajat: any[] = [];
  private oppilaitokset: any[] = [];

  private query = {
    jarjestajat: '',
    oppilaitokset: '',
    kunnat: '',
  };

  private koodisto: any = {
    jarjestajat: [], // Koulutuksen järjestäjät
    kunnat: [], // Kunnat joihin järjestävät kuuluvat
    kaikkiKunnat: [], // Kaikki kunnat
    kuntaMap: {}, // Kunnat joihin järjestävät kuuluvat
    oppilaitokset: [], // Oppilaitokset
    organisaatiot: [], // Käyttöoikeuksia sisältävät organisaatiot
  };

  filterAndSort(orgs, query) {
    return _.chain(orgs)
      .filter(org => Kielet.search(query, org.nimi))
      .sortBy(org => Kielet.kaanna(org.nimi))
      .value();
  }

  get kunnatValidation() {
    return this.validation ? this.validation.kunnat : [];
  }

  get jarjestajatValidation() {
    return this.validation ? this.validation.jarjestajat : [];
  }

  get oppilaitosValidation() {
    return this.validation ? this.validation.oppilaitokset : [];
  }

  get filteredKunnat() {
    return this.filterAndSort(this.kunnat, this.query.kunnat);
  }

  get kuntienJarjestajatFlattened() {
    return _.chain(this.kuntienJarjestajat)
      .values()
      .flatten()
      .sortBy(org => Kielet.kaanna(org.nimi))
      .value();
  }

  get filteredJarjestajat() {
    if (this.seutukunnille) {
      return this.filterAndSort(this.kuntienJarjestajatFlattened, this.query.jarjestajat);
    }
    else {
      return this.filterAndSort(this.koodisto.jarjestajat, this.query.jarjestajat);
    }
  }

  get jarjestajienOppilaitokset() {
    return _.chain(this.filteredJarjestajat)
      .map('children')
      .flatten()
      // .sortBy(org => Kielet.kaanna(org.nimi))
      .value();
  }

  get filteredOppilaitokset() {
    return this.filterAndSort(this.koodisto.oppilaitokset, this.query.oppilaitokset);
  }

  get kunnat() {
    if (this.seutukunnille) {
      return this.koodisto.kaikkiKunnat;
    }
    else {
      return _([
        ...this.jarjestajat,
        ...this.oppilaitokset,
        ])
        .map((org) => this.koodisto.kuntaMap[org.kotipaikkaUri])
        .uniq()
        .value();
    }
  }

  @Watch('valitutKunnat')
  async onKunnatChange(kunnat) {
    if (kunnat && this.seutukunnille) {
      const toimijat = {};
      _.forEach((await Ulkopuoliset.getKoulutustoimijat(_.map(kunnat, 'koodiUri'), [])).data, (toimija: any) => {
        if (!toimijat[toimija.kotipaikkaUri]) {
          toimijat[toimija.kotipaikkaUri] = [];
        }
        toimijat[toimija.kotipaikkaUri].push(toimija);
      });
      this.kuntienJarjestajat = toimijat;
    }
  }

  @Watch('kunnat')
  onChange() {
    this.$emit('input', {
      jarjestajat: _.map(this.jarjestajat, (org) => _.pick(org, 'oid')),
      oppilaitokset: _.map(this.oppilaitokset, (org) => _.pick(org, 'oid')),
      kunnat: this.seutukunnille
        ? []
        : _.map(this.kunnat, (org) => _.pick(org, 'koodiUri', 'koodiArvo', 'versio')),
    });
  }

  async update() {
    this.koodisto.kaikkiKunnat = (await Ulkopuoliset.kaikkiKoodistonKoodit('kunta')).data;
    const kunnat = _(this.koodisto.kaikkiKunnat)
      .map((kunta: any) => ({
        ...kunta,
        nimi: metadataToTeksti('nimi', kunta.metadata),
      }))
      .keyBy('koodiUri')
      .value();

    this.koodisto.organisaatiot = _((await Ulkopuoliset.getUserOrganisations()).data)
      .reject(_.isNull)
      .value();
    this.koodisto.kunnat = _(this.koodisto.organisaatiot)
      .map('kotipaikkaUri')
      .filter(_.identity)
      .uniq()
      .map((kunta: string) => kunnat[kunta])
      .value();
    this.koodisto.kuntaMap = kunnat;
    this.koodisto.oppilaitokset = _(this.koodisto.organisaatiot)
      .filter('oppilaitosTyyppiUri')
      .value();
    this.koodisto.jarjestajat = _(this.koodisto.organisaatiot)
      .filter((org) => hasOrganisaatioTyyppi([OrganisaatioTyyppi.Toimija], org.tyypit))
      .value();
    const jarjestajaOids = _.map(this.koodisto.jarjestajat, 'oid');
    const oppilaitostenJarjestajatRes = await Promise.all(_.chain(this.koodisto.oppilaitokset)
      .map('parentOid')
      .reject(parentOid => parentOid === OphOid || _.includes(jarjestajaOids, parentOid))
      .uniq()
      .map(oid => Ulkopuoliset.getOrganisaatio(oid))
      .value());
    this.koodisto.jarjestajat = [
      ...this.koodisto.jarjestajat,
      ..._.map(oppilaitostenJarjestajatRes, 'data')];
  }

  public mounted() {
    this.update();
  }
}

</script>

<style scoped lang="scss">
.selectors {
  margin-top: 25px;

  h6 {
    color: #555;
  }

}
</style>
