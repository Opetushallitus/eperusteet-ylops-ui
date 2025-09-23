<template>
<div class="content">
  <div class="m-2">

    <h2 class="border-bottom pb-2 mb-3">
      <span>{{ $t('oppiaineet') }}</span>
    </h2>

    <div class="row">
      <div class="col-md-9">
        <div>
          <p>{{ $t('route-oppiaineet-kuvaus') }}</p>
        </div>
        <div>
          <div class="d-flex align-items-center">
            <div class="p-2">
              <ep-search v-model="query">
              </ep-search>
            </div>
            <div class="p-2 checkbox">
              <ep-toggle v-model="vainPuuttuvat">{{ $t('vain-liittamattomat-moduulit') }}</ep-toggle>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div>
          <ep-button
            class="w-100"
            v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"
            variant="outline-primary"
            icon="add"
            @click="uusiOppiaine()">{{ $t('paikallinen-oppiaine') }}</ep-button>
          <ep-button
            class="w-100"
            v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"
            variant="outline-primary"
            icon="add"
            @click="uusiOpintojakso()">{{ $t('opintojakso') }}
          </ep-button>
        </div>
      </div>
    </div>
    <table class="table table-borderless oppiaineet">
      <thead class="head">
        <tr>
          <th width="20%">{{ $t('oppiaine') }}</th>
          <th width="25%">{{ $t('luodut-opintojaksot') }}</th>
          <th width="25%">{{ $t('liitetyt-moduulit') }}</th>
          <th width="25%">{{ $t('vieraat-moduulit') }}</th>
          <th class="actions" width="5%">
            <button class="btn btn-link" @click="toggleAll()">
              <EpMaterialIcon v-if="isOpened">expand_less</EpMaterialIcon>
              <EpMaterialIcon v-else>expand_more</EpMaterialIcon>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(oa, idx) in suodatettuOppiaineRakenne" :key="idx">
          <tr class="headerline" :class="[oa.isOpen && 'opened', oa._oppiaine || oa.perusteenOppiaineUri ? 'oppimaara': 'oppiaine']">
            <td>
              <router-link :to="{ name: oa.route.type, params: oa.route[oa.route.type] }">
                <span>{{ $kaanna(oa.nimi) }}</span>
                <span class="ml-1" v-if="oa.koodi">({{ oa.koodi.arvo }})</span>
              </router-link>
            </td>
            <td>
              <span v-if="(oa.oppimaarat && oa.oppimaarat.length === 0) || oa.toggleEnabled">{{ oa.stats.opintojaksot }}</span>
            </td>
            <td :class="oa.stats.valid ? 'valid' : 'invalid'">
              <span v-if="(oa.oppimaarat && oa.oppimaarat.length === 0) || oa.toggleEnabled">{{ oa.stats.kaytetytModuulit }}/{{ oa.stats.kaikkiModuulit }}</span>
            </td>
            <td>
            </td>
            <td class="actions">
              <button class="btn btn-link"
                      @click="toggleOppiaine(oa)"
                      v-if="(oa.oppimaarat && oa.oppimaarat.length === 0) || oa.toggleEnabled">
                <EpMaterialIcon v-if="oa.isOpen">expand_less</EpMaterialIcon>
                <EpMaterialIcon v-else>expand_more</EpMaterialIcon>
              </button>
            </td>
          </tr>
          <tr class="dataline" v-if="(!oa.oppimaarat || oa.oppimaarat.length === 0) && (oa.opintojaksot.length > 0 || oa.moduulit.length > 0 || oa.vieraatModuulit > 0) && oa.isOpen" :key="-idx - 1">
            <td>
            </td>
            <td>
              <div class="boxcontainer" v-for="oj in oa.opintojaksot" :key="oj.id">
                <div class="opintojakso" @mouseover="hoverOpintojakso(oj)" @mouseleave="unhoverOpintojakso(oj)">
                  <table>
                    <tbody>
                      <tr class="item">
                        <!-- td.op {{ oj.laajuus || 0 }}{{ $t('op') }}-->
                        <td class="nimi">
                          <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: oj.id } }">{{ $kaanna(oj.nimi) }} ({{ oj.koodi }})</router-link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
            <td>
              <div>
                <div class="boxcontainer" v-for="(moduuli, idx) in oa.moduulit" :key="idx">
                  <div class="moduuli" :class="moduuli.classes">
                    <table>
                      <tbody>
                        <tr class="item">
                          <td>
                            <ep-color-indicator class="mr-2" :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'">
                            </ep-color-indicator>
                            <span>{{ $kaanna(moduuli.nimi) }}</span>
                            <span class="ml-1" v-if="moduuli.koodi">({{ moduuli.koodi.arvo }})</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div>
                <div class="boxcontainer" v-for="(moduuli, idx) in oa.vieraatModuulit" :key="idx">
                  <div class="moduuli" :class="moduuli.classes">
                    <table>
                      <tbody>
                        <tr class="item">
                          <td>
                            <ep-color-indicator class="mr-2" :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'">
                            </ep-color-indicator>
                            <span>{{ $kaanna(moduuli.nimi) }}</span>
                            <span class="ml-1" v-if="moduuli.koodi">({{ moduuli.koodi.arvo }})</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </td>
            <td>
            </td>
          </tr>
        </template>
        <tr class="total">
          <td>{{ $t('yhteensa') }}</td>
          <td>{{ total.opintojaksot }}</td>
          <td>{{ total.kaytetytModuulit }}/{{ total.kaikkiModuulit }}</td>
          <td>
          </td>
          <td>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { PerusteCache } from '@/stores/peruste';
import { koodiAlku, koodiNumero, koodiSorters } from '@/utils/perusteet';
import { Kielet } from '@shared/stores/kieli';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { Lops2019ModuuliDto, Lops2019OppiaineDto } from '@shared/api/ylops';
import { useEpOpsRoute } from '@/mixins/EpOpsRoute';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $kaanna } from '@shared/utils/globals';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Use composables
const route = useRoute();
const router = useRouter();
const { store, isPohja } = useEpOpsRoute(props.opetussuunnitelmaStore);

// Component state
const cache = ref<PerusteCache | null>(null);
const valitutModuuliUrit = ref<{ [uri: string]: string } | null>(null);
const query = ref('');
const vainPuuttuvat = ref(false);
const opened = ref<{ [id: number]: any }>({});

// Computed properties
const isHovering = computed(() => {
  return valitutModuuliUrit.value !== null;
});

const peruste = computed(() => {
  if (cache.value) {
    return cache.value.peruste;
  }
  else {
    return null;
  }
});

const oppiaineJarjestykset = computed(() => {
  return store.value.oppiaineJarjestykset;
});

const total = computed(() => {
  return {
    ..._(oppiaineRakenne.value)
      .map('stats')
      .reduce((acc, next) => {
        return {
          kaytetytModuulit: acc.kaytetytModuulit + next.kaytetytModuulit,
          kaikkiModuulit: acc.kaikkiModuulit + next.kaikkiModuulit,
          opintojaksot: acc.opintojaksot + next.opintojaksot,
        };
      }, {
        kaytetytModuulit: 0,
        kaikkiModuulit: 0,
        opintojaksot: 0,
      }),
  };
});

const oppiaineetJaOppimaarat = computed(() => {
  if (!peruste.value?.oppiaineet) {
    return [];
  }
  return _(peruste.value.oppiaineet as Lops2019OppiaineDto[])
    .map(oa => [oa, ...(oa.oppimaarat || [])])
    .flatten()
    .value();
});

const oppiaineetMap = computed(() => {
  return _.keyBy(oppiaineetJaOppimaarat.value, 'koodi.uri');
});

const oppiaineidenModuulit = computed(() => {
  return _.chain(oppiaineetJaOppimaarat.value)
    .map((oa: any) => {
      if (oa.perusteenOppiaineUri) {
        return {
          ...oa,
          moduulit: oppiaineetMap.value[oa.perusteenOppiaineUri].moduulit,
        };
      }
      else {
        return oa;
      }
    })
    .value();
});

const oppiaineidenModuulitMap = computed(() => {
  return _.chain(oppiaineidenModuulit.value)
    .keyBy('koodi.uri')
    .value();
});

const moduulit = computed(() => {
  const result = _(oppiaineetJaOppimaarat.value)
    .map('moduulit')
    .flatten()
    .value();
  return result;
});

const moduulitByKoodi = computed(() => {
  return _(moduulit.value)
    .filter('koodi.uri')
    .keyBy('koodi.uri')
    .value() as { [uri: string]: Lops2019ModuuliDto };
});

const suodatettuOppiaineRakenne = computed(() => {
  const rekursiivinenRakenne = {};

  _(oppiaineRakenne.value)
    .map(oa => {
      return {
        ...oa,
        route: {
          type: oa.paikallinen ? 'paikallinenOppiaine' : 'oppiaine',
          paikallinenOppiaine: {
            paikallinenOppiaineId: oa.id,
          },
          oppiaine: {
            oppiaineId: oa.id,
          },
        },
        vieraatModuulit: vainPuuttuvat.value ? [] : oa.vieraatModuulit,
        moduulit: _(oa.moduulit)
          .reject((moduuli) => vainPuuttuvat.value && moduuli.used)
          .filter((moduuli) => Kielet.search(query.value, moduuli.nimi))
          .sortBy(...koodiSorters())
          .value(),
        opintojaksot: _(oa.opintojaksot)
          .filter((oj) => Kielet.search(query.value, oj.nimi))
          .map(oj => {
            const ojOa: any = _.find(oj.oppiaineet, { koodi: oa.koodi.uri });
            return {
              ...oj,
              jarjestys: ojOa.jarjestys,
            };
          })
          .sortBy('jarjestys', ...koodiSorters())
          .value(),
      };
    })
    .filter((oa: any) => Kielet.search(query.value, oa.nimi)
      || !_.isEmpty(oa.moduulit)
      || !_.isEmpty(oa.opintojaksot))
    .forEach(oa => {
      if (oa._oppiaine) {
        rekursiivinenRakenne[oa._oppiaine].oppimaaratHandled.push(oa);
      }
      else if (oa.perusteenOppiaineUri) {
        const parentOa = _.find(oppiaineRakenne.value, { koodi: { uri: oa.perusteenOppiaineUri } });
        if (parentOa && parentOa._oppiaine) {
          rekursiivinenRakenne[parentOa._oppiaine].oppimaaratHandled.push(oa);
        }
        else if (parentOa && rekursiivinenRakenne[parentOa.id]) {
          rekursiivinenRakenne[parentOa.id].oppimaaratHandled.push(oa);
        }
      }
      else {
        oa.oppimaaratHandled = [];
        rekursiivinenRakenne[oa.id] = (oa);
      }

      return oa;
    });

  const sortedRakenne = _(rekursiivinenRakenne)
    .sortBy('jarjestys', (oa: any) => oa.paikallinen, koodiAlku, koodiNumero)
    .value();

  const flatten = item => {
    return [
      item,
      _.flatMapDeep(item.oppimaaratHandled, flatten),
    ];
  };

  return _.flatMapDeep(sortedRakenne, flatten);
});

// Helper functions
const moduuliPresentation = (moduuli: any, opintojaksojenModuulit: any) => {
  const active = moduuli.koodi && valitutModuuliUrit.value !== null && !!valitutModuuliUrit.value[moduuli.koodi.uri];
  const used = moduuli.koodi && !!opintojaksojenModuulit[moduuli.koodi.uri];
  return {
    ...moduuli,
    active,
    used,
    classes: {
      'moduuli-active': active,
      'moduuli-inactive': isHovering.value && !active,
      'moduuli-unused': !isHovering.value && !used,
    },
  };
};

const paikallinenOppiaineRakenne = computed(() => {
  if (!peruste.value || !store.value.paikallisetOppiaineet) {
    return [];
  }
  return _(store.value.paikallisetOppiaineet)
    .map(poa => mapPaikallinenOppiaine(poa))
    .value();
});

const paikallinenOppiaineIlmanOppimaariaRakenne = computed(() => {
  return _(paikallinenOppiaineRakenne.value)
    .reject('perusteenOppiaineUri')
    .map(poa => ({ ...poa, jarjestys: _.get(_.find(oppiaineJarjestykset.value, { koodi: _.get(poa, 'koodi.uri') }), 'jarjestys') }))
    .value();
});

const mapPaikallinenOppiaine = (poa) => {
  const oppimaaranOmatModuulit = poa.perusteenOppiaineUri ? oppiaineidenModuulitMap.value[poa.perusteenOppiaineUri].moduulit : [];

  const opintojaksot = _(store.value.opintojaksot)
    .concat(store.value.tuodutOpintojaksot)
    .filter(oj => _.includes(
      _((oj as any).oppiaineet)
        .map('koodi')
        .filter(_.identity)
        .value(),
        poa.koodi!,
    ))
    .map(oj => {
      const ojOa: any = _.find((oj as any).oppiaineet, { koodi: poa.koodi });
      return {
        ...oj,
        jarjestys: ojOa.jarjestys,
      };
    })
    .sortBy('jarjestys', ...koodiSorters())
    .value();

  const valitutModuulit = _(opintojaksot)
    .map('moduulit')
    .flatten()
    .map(m => {
      return moduulitByKoodi.value[m.koodiUri];
    })
    .value();

  const omatModuulit = _(valitutModuulit)
    .filter((m: any) => _.includes(_.map(oppimaaranOmatModuulit, 'koodi.uri'), m.koodi.uri))
    .value();

  const vieraatModuulit = _(opintojaksot)
    .map('moduulit')
    .flatten()
    .map(moduuli => moduulitByKoodi.value[moduuli.koodiUri])
    .reject(moduuli => _.includes(omatModuulit, moduuli))
    .value();

  // Käytetään vain esityksessä
  const opintojaksojenModuulit = _(opintojaksot)
    .map('moduulit')
    .flatten()
    .keyBy('koodiUri')
    .value();

  const kaytetytModuulit = _.size(_.uniq(_.map(omatModuulit, 'koodi.uri')));

  return {
    ...poa,
    koodi: {
      arvo: poa.koodi,
      uri: poa.koodi,
    },
    isOpen: !opened.value[poa.id!] || !_.isEmpty(query.value),
    toggleEnabled: _.size(opintojaksot) > 0,
    paikallinen: true,
    opintojaksot,
    moduulit: _.map(oppimaaranOmatModuulit, (moduuli) => moduuliPresentation(moduuli, opintojaksojenModuulit)),
    vieraatModuulit: _.map(vieraatModuulit, (moduuli) => moduuliPresentation(moduuli, opintojaksojenModuulit)),
    stats: {
      opintojaksot: _.size(opintojaksot),
      kaytetytModuulit: kaytetytModuulit,
      kaikkiModuulit: _.size(oppimaaranOmatModuulit),
      valid: kaytetytModuulit === _.size(oppimaaranOmatModuulit),
    },
  };
};

const perusteenOppiaineRakenne = computed(() => {
  if (!peruste.value) {
    return [];
  }

  return _(peruste.value.oppiaineet as Lops2019OppiaineDto[])
    .map(oa => {
      const oppimaarat = oa.oppimaarat || [];
      const paikallisetOppimaarat = _(paikallinenOppiaineRakenne.value)
        .filter(poa => _.includes(_.map(oa.oppimaarat, 'koodi.uri'), poa.perusteenOppiaineUri))
        .value();

      return {
        ...oa,
        oppimaarat,
        paikallisetOppimaarat,
      };
    })
    .map(oa => [
      oa,
      ...oa.oppimaarat,
      ...oa.paikallisetOppimaarat,
    ])
    .flatten()
    .map(oa => oa.paikallinen ? mapPaikallinenOppimaara(oa) : mapOppiaineet(oa))
    .map(oa => ({ ...oa, jarjestys: _.get(_.find(oppiaineJarjestykset.value, { koodi: _.get(oa, 'koodi.uri') }), 'jarjestys') }))
    .value();
});

const mapPaikallinenOppimaara = (pom) => {
  const oppimaaranOmatModuulit = pom.perusteenOppiaineUri ? oppiaineidenModuulitMap.value[pom.perusteenOppiaineUri].moduulit : [];

  const opintojaksot = _(store.value.opintojaksot)
    .concat(store.value.tuodutOpintojaksot)
    .filter(oj => _.includes(
      _((oj as any).oppiaineet)
        .map('koodi')
        .filter(_.identity)
        .value(),
        pom.koodi!.uri,
    ))
    .value();

  const valitutModuulit = _(opintojaksot)
    .map('moduulit')
    .flatten()
    .map(m => {
      return moduulitByKoodi.value[m.koodiUri];
    })
    .value();

  const omatModuulit = _(valitutModuulit)
    .filter((m: any) => _.includes(_.map(oppimaaranOmatModuulit, 'koodi.uri'), m.koodi.uri))
    .value();

  const opintojaksojenModuulit = _(opintojaksot)
    .map('moduulit')
    .flatten()
    .keyBy('koodiUri')
    .value();

  const vieraatModuulit = _(opintojaksot)
    .map('moduulit')
    .flatten()
    .map(moduuli => moduulitByKoodi.value[moduuli.koodiUri])
    .reject(moduuli => _.includes(omatModuulit, moduuli))
    .value();

  const kaytetytModuulit = _.size(_.uniq(_.map(omatModuulit, 'koodi.uri')));

  return {
    ...pom,
    isOpen: !opened.value[pom.id!] || !_.isEmpty(query.value),
    toggleEnabled: _.size(opintojaksot) > 0,
    moduulit: _.map(pom.moduulit, (moduuli) => moduuliPresentation(moduuli, opintojaksojenModuulit)),
    vieraatModuulit: _.map(vieraatModuulit, (moduuli) => moduuliPresentation(moduuli, opintojaksojenModuulit)),
    paikallinen: true,
    opintojaksot,
    stats: {
      opintojaksot: _.size(opintojaksot),
      kaytetytModuulit: kaytetytModuulit,
      kaikkiModuulit: _.size(oppimaaranOmatModuulit),
      valid: kaytetytModuulit === _.size(oppimaaranOmatModuulit),
    },
  };
};

const mapOppiaineet = (oa) => {
  const opintojaksot = _(store.value.opintojaksot)
    .concat(store.value.tuodutOpintojaksot)
    .filter(oj => _.includes(
      _((oj as any).oppiaineet)
        .map('koodi')
        .filter(_.identity)
        .value(),
    oa.koodi!.uri))
    .value();

  const opintojaksojenModuulit = _(opintojaksot)
    .map('moduulit')
    .flatten()
    .keyBy('koodiUri')
    .value();

  const vieraatModuulit = _(opintojaksot)
    .map('moduulit')
    .flatten()
    .map(moduuli => moduulitByKoodi.value[moduuli.koodiUri])
    .reject((moduuli: any) => {
      // Vertailua ei voida tehdä arvolla, koska ne voivat olla esim. ÄI ja AI
      if (moduuli.koodi && oa.koodi!.uri) {
        // Käytetään KoodiUrin loppuosaa
        const mKoodi = _.split(moduuli.koodi!.uri, '_').pop(); // esim. ai1
        const oKoodi = _.split(oa.koodi!.uri, '_').pop(); // esim. ai
        // Poistetaan vielä oppimäärän numerot (käytetään kielten oppimäärissä)
        return _.startsWith(mKoodi, oKoodi!.replace(/[0-9]/g, '')) || _.parseInt(moduuli._oppiaine) === oa.id;
      }
      else {
        return false;
      }
    })
    .map(moduuli => moduuliPresentation(moduuli, opintojaksojenModuulit))
    .value();

  const kaytetytModuulit = _.size(_.filter(oa.moduulit, moduuli => opintojaksojenModuulit[moduuli.koodi.uri]));

  return {
    ...oa,
    isOpen: !opened.value[oa.id!] || !_.isEmpty(query.value),
    moduulit: _.map(oa.moduulit, (moduuli) => moduuliPresentation(moduuli, opintojaksojenModuulit)),
    vieraatModuulit,
    paikallinen: false,
    opintojaksot,
    stats: {
      opintojaksot: _.size(opintojaksot),
      kaytetytModuulit,
      kaikkiModuulit: _.size(oa.moduulit),
      valid: kaytetytModuulit === _.size(oa.moduulit),
    },
  };
};

const oppiaineRakenne = computed(() => {
  return [
    ...perusteenOppiaineRakenne.value,
    ...paikallinenOppiaineIlmanOppimaariaRakenne.value,
  ];
});

const isOpened = computed(() => {
  return _.isEmpty(opened.value);
});

// Methods
const toggleOppiaine = (oa: any) => {
  opened.value[oa.id] = !opened.value[oa.id];
};

const hoverOpintojakso = (oj: any) => {
  valitutModuuliUrit.value = _(oj.moduulit)
    .keyBy('koodiUri')
    .value();
};

const unhoverOpintojakso = (oj: any) => {
  valitutModuuliUrit.value = null;
};

const toggleAll = () => {
  if (_.isEmpty(opened.value)) {
    opened.value = _.keyBy(oppiaineRakenne.value, 'id');
  }
  else {
    opened.value = {};
  }
};

const uusiOppiaine = () => {
  router.push({
    name: 'paikallinenOppiaine',
    params: {
      ...route.params,
      paikallinenOppiaineId: 'uusi',
    },
  });
};

const uusiOpintojakso = () => {
  router.push({
    name: 'opintojakso',
    params: {
      ...route.params,
      opintojaksoId: 'uusi',
    },
  });
};

// Lifecycle
onMounted(async () => {
  cache.value = await PerusteCache.of(_.parseInt(route.params.id as string));
  nextTick(() => {
    toggleAll();
  });
});

</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

table.oppiaineet {
  border-collapse: collapse;

  th, td {
    border: none;
  }

  thead {
    border: none;
  }

  svg[data-icon='chevron-up'], svg[data-icon='chevron-down'] {
    color: $black;
  }

  tr {
    a:hover {
      text-decoration:underline;
    }
  }

  tr.headerline {

    &:nth-child(2n - 1) {
     background-color: #F9F9F9;
    }

    &.oppimaara.opened {
     background: $paletti-background-light-2;
    }

    &.oppimaara td:first-of-type {
      padding-left: 40px;
    }

    td.actions {
      padding: 5px;
    }

    .invalid {
      color: $red;
    }

    .valid {
      color: $green-lighten-2;
    }
  }

  tr.total {
    border: 1px solid $paletti-background-light-2;
    font-weight: bold;
    font-size: 80%;

    td {
      padding: 14px;
    }
  }

  tr.dataline {
    background: $paletti-background-light;
    border: 1px solid #DFEFFF;
    font-size: 80%;

    td.chevron {
      width: 10px;
    }

    td {
      padding: 2px;

      tr.item {
        padding: 0;

        td.op {
          padding: 4px;
        }
        td.nimi {
          padding: 4px;
        }
      }

      .opintojakso {
        padding: 4px;
        padding-left: 0;
      }

      .moduuli {
        padding: 4px;
        color: #000;
      }

      .moduuli-unused {
        color: #888;
      }

      .moduuli-inactive {
        color: #888;
      }

      .moduuli-active {
        background: #fff;
        border-radius: 12px;
        box-shadow: 2px 2px 2px #cdd8ef;
      }
    }
  }

  tr td a {
    color: #2b2b2b;
  }
}
</style>
