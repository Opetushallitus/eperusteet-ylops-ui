<template lang="pug">

.organisaatiot
  h5 {{ $t('organisaatiot') }}
  .selectors
    h6 {{ $t('jarjestajat') }}
    multiselect(
      v-model="jarjestajat",
      track-by="oid"
      :options="filteredJarjestajat",
      :close-on-select="true",
      :clear-on-select="true",
      :placeholder="''",
      :internalSearch="false",
      @search-change="query.jarjestajat = $event",
      :multiple="true")
      template(slot="singleLabel", slot-scope="{ option }")
        span.selected {{ $kaanna(option.nimi) }}
      template(slot="option", slot-scope="{ option, search }")
        div {{ $kaanna(option.nimi) }}
      template(slot="tag", slot-scope="{ option, search, remove }")
        span.selected
          span {{ $kaanna(option.nimi) }}
          button.btn.btn-link
            fas(icon="times")
      template(slot="noResult")
        div {{ $t('ei-hakutuloksia') }}

  .selectors
    h6 {{ $t('oppilaitokset') }}
    multiselect(
      v-model="oppilaitokset",
      track-by="oid"
      :options="filteredOppilaitokset",
      :close-on-select="true",
      :clear-on-select="true",
      :placeholder="''",
      :internalSearch="false",
      @search-change="query.oppilaitokset = $event",
      :multiple="true")
      template(slot="singleLabel", slot-scope="{ option }")
        span.selected {{ $kaanna(option.nimi) }}
      template(slot="option", slot-scope="{ option, search }")
        div {{ $kaanna(option.nimi) }}
      template(slot="tag", slot-scope="{ option, search, remove }")
        span.selected
          span {{ $kaanna(option.nimi) }}
          button.btn.btn-link(@click="remove(option)")
            fas(icon="times")
      template(slot="noResult")
        div {{ $t('ei-hakutuloksia') }}

  .selectors
    div(v-if="kunnat.length > 0")
      h6 {{ $t('kunnat') }}
      ul.kunnat
        li(v-for="kunta in kunnat") {{ $kaanna(kunta.nimi) }}

</template>


<script lang="ts">

import {
  EpButton,
  EpSpinner,
} from '@/components';

import _ from 'lodash';
import Multiselect from 'vue-multiselect';
import { Watch, Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { Kielet } from '@/stores/kieli';
import { hasOrganisaatioTyyppi, metadataToTeksti } from '@/utils/organisaatiot';

import {
  Ulkopuoliset,
  Opetussuunnitelmat,
} from '@/api';

import {
  Kieli,
  OrganisaatioTyyppi,
} from '@/tyypit';

@Component({
  components: {
    EpSpinner,
    EpButton,
    Multiselect,
  },
})
export default class EpOrganizations extends Vue {
  private value: any = null;
  private jarjestajat: any[] = [];
  private oppilaitokset: any[] = [];

  private query = {
    jarjestajat: '',
    oppilaitokset: '',
  };

  private koodisto: any = {
    jarjestajat: [],   // Koulutuksen järjestäjät
    kunnat: [],        // Kunnat joihin järjestävät kuuluvat
    kuntaMap: {},      // Kunnat joihin järjestävät kuuluvat
    oppilaitokset: [], // Oppilaitokset
    organisaatiot: [], // Käyttöoikeuksia sisältävät organisaatiot
  };

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
    const kunnat = _((await Ulkopuoliset.kaikki('kunta')).data)
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
  }

}

</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.selectors {
  margin-top: 16px;
}

.selected {
  background: $color-ops-header;
  margin-right: 5px;
  position: relative;
  top: -3px;
  padding: 4px;
  border-radius: 5px;
  color: #fff;
  font-weight: 700;
}

</style>
