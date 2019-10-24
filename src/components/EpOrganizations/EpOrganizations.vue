<template>
<div class="organisaatiot">
  <ep-form-content name="organisaatiot">
    <div class="selectors">
      <h6>{{ $t('jarjestajat') }}</h6>
      <ep-multi-select :multiple="true"
                       v-model="jarjestajat"
                       track-by="oid"
                       :validation="jarjestajatValidation"
                       :is-editing="true"
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
    <div class="selectors">
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
  },
})
export default class EpOrganizations extends Mixins(EpValidation) {
  private value: any = null;
  private jarjestajat: any[] = [];
  private oppilaitokset: any[] = [];

  private query = {
    jarjestajat: '',
    oppilaitokset: '',
  };

  private koodisto: any = {
    jarjestajat: [], // Koulutuksen järjestäjät
    kunnat: [], // Kunnat joihin järjestävät kuuluvat
    kuntaMap: {}, // Kunnat joihin järjestävät kuuluvat
    oppilaitokset: [], // Oppilaitokset
    organisaatiot: [], // Käyttöoikeuksia sisältävät organisaatiot
  };

  get jarjestajatValidation() {
    return this.validation ? this.validation.jarjestajat : [];
  }

  get oppilaitosValidation() {
    return this.validation ? this.validation.oppilaitokset : [];
  }

  get filteredJarjestajat() {
    return _.filter(this.koodisto.jarjestajat, (org) => Kielet.search(this.query.jarjestajat, org.nimi));
  }

  get filteredOppilaitokset() {
    return _.filter(this.koodisto.oppilaitokset, (org) => Kielet.search(this.query.oppilaitokset, org.nimi));
  }

  get kunnat() {
    return _([
      ...this.jarjestajat,
      ...this.oppilaitokset,
    ])
      .map((org) => this.koodisto.kuntaMap[org.kotipaikkaUri])
      .uniq()
      .value();
  }

  @Watch('kunnat')
  onChange() {
    this.$emit('input', {
      jarjestajat: _.map(this.jarjestajat, (org) => _.pick(org, 'oid')),
      oppilaitokset: _.map(this.oppilaitokset, (org) => _.pick(org, 'oid')),
      kunnat: _.map(this.kunnat, (org) => _.pick(org, 'koodiUri', 'koodiArvo', 'versio')),
    });
  }

  public async mounted() {
    const kunnat = _((await Ulkopuoliset.kaikkiKoodistonKoodit('kunta')).data)
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
}

</script>

<style scoped lang="scss">
.selectors {
  margin-top: 15px;
}
</style>
