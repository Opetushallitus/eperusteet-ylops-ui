<template>
<div class="content">
  <ep-editointi :hooks="hooks">
    <template slot="header">
      <h2>
        <span>{{ $t('oppiaineet') }}</span>
      </h2>
    </template>
     <template slot="ohje">
      <div class="sidepad">
        <!-- <p>N/A</p> -->
      </div>
    </template>

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
            icon="plussa"
            @click="uusiOppiaine()">{{ $t('paikallinen-oppiaine') }}</ep-button>
          <ep-button
            class="w-100"
            v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"
            variant="outline-primary"
            icon="plussa"
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
              <fas icon="chevron-up" v-if="isOpened" />
              <fas icon="chevron-down" v-else />
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(oa, idx) in suodatettuOppiaineRakenne">
          <tr class="headerline" :class="[oa.isOpen && 'opened', oa._oppiaine || oa.perusteenOppiaineUri ? 'oppimaara': 'oppiaine']" :key="idx">
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
                <fas v-if="oa.isOpen" icon="chevron-up">
                </fas>
                <fas v-else icon="chevron-down">
                </fas>
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
                    <tr class="item">
                      <!-- td.op {{ oj.laajuus || 0 }}{{ $t('op') }}-->
                      <td class="nimi">
                        <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: oj.id } }">{{ $kaanna(oj.nimi) }} ({{ oj.koodi }})</router-link>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
            <td>
              <div>
                <div class="boxcontainer" v-for="(moduuli, idx) in oa.moduulit" :key="idx">
                  <div class="moduuli" :class="moduuli.classes">
                    <table>
                      <tr class="item">
                        <td>
                          <ep-color-indicator class="mr-2" :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'">
                          </ep-color-indicator>
                          <span>{{ $kaanna(moduuli.nimi) }}</span>
                          <span class="ml-1" v-if="moduuli.koodi">({{ moduuli.koodi.arvo }})</span>
                        </td>
                      </tr>
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
                      <td>
                        <ep-color-indicator class="mr-2" :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'"> </ep-color-indicator>
                        <span>{{ $kaanna(moduuli.nimi) }}</span>
                        <span class="ml-1">({{ moduuli.koodi.arvo }})</span>
                      </td>
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
  </ep-editointi>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { Lops2019ModuuliDto, Lops2019OppiaineDto } from '@shared/api/ylops';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { PerusteCache } from '@/stores/peruste';
import { koodiAlku, koodiNumero, koodiSorters } from '@/utils/perusteet';

import { Kielet } from '@shared/stores/kieli';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { EditointiKontrolliConfig } from '@/stores/editointi';

@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpButton,
    EpCollapse,
    EpColorIndicator,
    EpContent,
    EpEditointi,
    EpSearch,
    EpSpinner,
    EpToggle,
  },
})
export default class RouteOppiaineet extends Mixins(EpRoute, EpOpsComponent) {
  private cache: PerusteCache | null = null;
  private valitutModuuliUrit: { [uri: string]: string } | null = null;
  private query = '';
  private vainPuuttuvat = false;
  private opened: { [id: number]: any } = {};

  private hooks: EditointiKontrolliConfig = {
    source: {
      load: this.load,
    },
  };

  private async load() {
    const result = {
      ohjeet: [{ teksti: 'N/A' }],
    } as any;

    if (_.isEmpty(result.ohjeet)) {
      result.ohjeet.push({});
    }

    return result;
  }

  get isHovering() {
    return this.valitutModuuliUrit !== null;
  }

  get peruste() {
    if (this.cache) {
      return this.cache!.peruste;
    }
    else {
      return null;
    }
  }

  get oppiaineJarjestykset() {
    return this.store.oppiaineJarjestykset;
  }

  get total() {
    return {
      ..._(this.oppiaineRakenne)
        .map('stats')
        .reduce((acc, next) => {
          return {
            kaytetytModuulit: acc.kaytetytModuulit + next.kaytetytModuulit,
            kaikkiModuulit: acc.kaikkiModuulit + next.kaikkiModuulit,
          };
        }, {
          kaytetytModuulit: 0,
          kaikkiModuulit: 0,
        }),
      opintojaksot: _.size(this.store.opintojaksot) + _.size(this.store.tuodutOpintojaksot),
    };
  }

  get oppiaineetJaOppimaarat() {
    return _(this.peruste.oppiaineet as Lops2019OppiaineDto[])
      .map(oa => [oa, ...(oa.oppimaarat || [])])
      .flatten()
      .value();
  }

  get oppiaineetMap() {
    return _.keyBy(this.oppiaineetJaOppimaarat, 'koodi.uri');
  }

  get oppiaineidenModuulit() {
    return _.chain(this.oppiaineetJaOppimaarat)
      .map((oa: any) => {
        if (oa.perusteenOppiaineUri) {
          return {
            ...oa,
            moduulit: this.oppiaineetMap[oa.perusteenOppiaineUri].moduulit,
          };
        }
        else {
          return oa;
        }
      })
      .value();
  }

  get oppiaineidenModuulitMap() {
    return _.chain(this.oppiaineidenModuulit)
      .keyBy('koodi.uri')
      .value();
  }

  get moduulit() {
    const result = _(this.oppiaineetJaOppimaarat)
      .map('moduulit')
      .flatten()
      .value();
    return result;
  }

  get moduulitByKoodi() {
    return _(this.moduulit)
      .filter('koodi.uri')
      .keyBy('koodi.uri')
      .value() as { [uri: string]: Lops2019ModuuliDto };
  }

  get suodatettuOppiaineRakenne() {
    const rekursiivinenRakenne = {};

    _(this.oppiaineRakenne)
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
          vieraatModuulit: this.vainPuuttuvat ? [] : oa.vieraatModuulit,
          moduulit: _(oa.moduulit)
            .reject((moduuli) => this.vainPuuttuvat && moduuli.used)
            .filter((moduuli) => Kielet.search(this.query, moduuli.nimi))
            .sortBy(...koodiSorters())
            .value(),
          opintojaksot: _(oa.opintojaksot)
            .filter((oj) => Kielet.search(this.query, oj.nimi))
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
      .filter((oa: any) => Kielet.search(this.query, oa.nimi)
        || !_.isEmpty(oa.moduulit)
        || !_.isEmpty(oa.opintojaksot))
      .forEach(oa => {
        if (oa._oppiaine) {
          rekursiivinenRakenne[oa._oppiaine].oppimaaratHandled.push(oa);
        }
        else if (oa.perusteenOppiaineUri) {
          const parentOa = _.find(this.oppiaineRakenne, { koodi: { uri: oa.perusteenOppiaineUri } });
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
  }

  private moduuliPresentation(moduuli: any, opintojaksojenModuulit: any) {
    const active = moduuli.koodi && this.valitutModuuliUrit !== null && !!this.valitutModuuliUrit[moduuli.koodi.uri];
    const used = moduuli.koodi && !!opintojaksojenModuulit[moduuli.koodi.uri];
    return {
      ...moduuli,
      active,
      used,
      classes: {
        'moduuli-active': active,
        'moduuli-inactive': this.isHovering && !active,
        'moduuli-unused': !this.isHovering && !used,
      },
    };
  }

  get paikallinenOppiaineRakenne() {
    if (!this.peruste || !this.store.paikallisetOppiaineet) {
      return [];
    }
    return _(this.store.paikallisetOppiaineet)
      .map(poa => this.mapPaikallinenOppiaine(poa))
      .value();
  }

  get paikallinenOppiaineIlmanOppimaariaRakenne() {
    return _(this.paikallinenOppiaineRakenne)
      .reject('perusteenOppiaineUri')
      .map(poa => ({ ...poa, jarjestys: _.get(_.find(this.oppiaineJarjestykset, { koodi: _.get(poa, 'koodi.uri') }), 'jarjestys') }))
      .value();
  }

  private mapPaikallinenOppiaine(poa) {
    const oppimaaranOmatModuulit = poa.perusteenOppiaineUri ? this.oppiaineidenModuulitMap[poa.perusteenOppiaineUri].moduulit : [];

    const opintojaksot = _(this.store.opintojaksot)
      .concat(this.store.tuodutOpintojaksot)
      .filter(oj => _.includes(
        _(oj.oppiaineet)
          .map('koodi')
          .filter(_.identity)
          .value(),
          poa.koodi!
      ))
      .map(oj => {
        const ojOa: any = _.find(oj.oppiaineet, { koodi: poa.koodi });
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
        return this.moduulitByKoodi[m.koodiUri];
      })
      .value();

    const omatModuulit = _(valitutModuulit)
      .filter((m: any) => _.includes(_.map(oppimaaranOmatModuulit, 'koodi.uri'), m.koodi.uri))
      .value();

    const vieraatModuulit = _(opintojaksot)
      .map('moduulit')
      .flatten()
      .map(moduuli => this.moduulitByKoodi[moduuli.koodiUri])
      .reject(moduuli => _.includes(omatModuulit, moduuli))
      .value();

    // Käytetään vain esityksessä
    const opintojaksojenModuulit = _(opintojaksot)
      .map('moduulit')
      .flatten()
      .keyBy('koodiUri')
      .value();

    return {
      ...poa,
      koodi: {
        arvo: poa.koodi,
        uri: poa.koodi,
      },
      isOpen: !this.opened[poa.id!] || !_.isEmpty(this.query),
      toggleEnabled: _.size(opintojaksot) > 0,
      paikallinen: true,
      opintojaksot,
      moduulit: _.map(oppimaaranOmatModuulit, (moduuli) => this.moduuliPresentation(moduuli, opintojaksojenModuulit)),
      vieraatModuulit: _.map(vieraatModuulit, (moduuli) => this.moduuliPresentation(moduuli, opintojaksojenModuulit)),
      stats: {
        opintojaksot: _.size(opintojaksot),
        kaytetytModuulit: _.size(omatModuulit),
        kaikkiModuulit: _.size(oppimaaranOmatModuulit),
        valid: _.size(omatModuulit) === _.size(oppimaaranOmatModuulit),
      },
    };
  }

  get perusteenOppiaineRakenne() {
    if (!this.peruste) {
      return [];
    }

    return _(this.peruste.oppiaineet as Lops2019OppiaineDto[])
      .map(oa => {
        const oppimaarat = oa.oppimaarat || [];
        const paikallisetOppimaarat = _(this.paikallinenOppiaineRakenne)
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
      .map(oa => oa.paikallinen ? this.mapPaikallinenOppimaara(oa) : this.mapOppiaineet(oa))
      .map(oa => ({ ...oa, jarjestys: _.get(_.find(this.oppiaineJarjestykset, { koodi: _.get(oa, 'koodi.uri') }), 'jarjestys') }))
      .value();
  }

  private mapPaikallinenOppimaara(pom) {
    const oppimaaranOmatModuulit = pom.perusteenOppiaineUri ? this.oppiaineidenModuulitMap[pom.perusteenOppiaineUri].moduulit : [];

    const opintojaksot = _(this.store.opintojaksot)
      .concat(this.store.tuodutOpintojaksot)
      .filter(oj => _.includes(
        _(oj.oppiaineet)
          .map('koodi')
          .filter(_.identity)
          .value(),
          pom.koodi!.uri
      ))
      .value();

    const valitutModuulit = _(opintojaksot)
      .map('moduulit')
      .flatten()
      .map(m => {
        return this.moduulitByKoodi[m.koodiUri];
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
      .map(moduuli => this.moduulitByKoodi[moduuli.koodiUri])
      .reject(moduuli => _.includes(omatModuulit, moduuli))
      .value();

    return {
      ...pom,
      isOpen: !this.opened[pom.id!] || !_.isEmpty(this.query),
      toggleEnabled: _.size(opintojaksot) > 0,
      moduulit: _.map(pom.moduulit, (moduuli) => this.moduuliPresentation(moduuli, opintojaksojenModuulit)),
      vieraatModuulit: _.map(vieraatModuulit, (moduuli) => this.moduuliPresentation(moduuli, opintojaksojenModuulit)),
      paikallinen: true,
      opintojaksot,
      stats: {
        opintojaksot: _.size(opintojaksot),
        kaytetytModuulit: _.size(omatModuulit),
        kaikkiModuulit: _.size(oppimaaranOmatModuulit),
        valid: _.size(omatModuulit) === _.size(oppimaaranOmatModuulit),
      },
    };
  }

  private mapOppiaineet(oa) {
    const opintojaksot = _(this.store.opintojaksot)
      .concat(this.store.tuodutOpintojaksot)
      .filter(oj => _.includes(
        _(oj.oppiaineet)
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
      .map(moduuli => this.moduulitByKoodi[moduuli.koodiUri])
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
      .map(moduuli => this.moduuliPresentation(moduuli, opintojaksojenModuulit))
      .value();

    const kaytetytModuulit = _.size(opintojaksojenModuulit) - _.size(vieraatModuulit);

    return {
      ...oa,
      isOpen: !this.opened[oa.id!] || !_.isEmpty(this.query),
      moduulit: _.map(oa.moduulit, (moduuli) => this.moduuliPresentation(moduuli, opintojaksojenModuulit)),
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
  }

  get oppiaineRakenne() {
    return [
      ...this.perusteenOppiaineRakenne,
      ...this.paikallinenOppiaineIlmanOppimaariaRakenne,
    ];
  }

  get isOpened() {
    return _.isEmpty(this.opened);
  }

  async mounted() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    this.$nextTick(() => {
      this.toggleAll();
    });
  }

  private toggleOppiaine(oa: any) {
    this.$set(this.opened, oa.id, !this.opened[oa.id]);
  }

  private hoverOpintojakso(oj: any) {
    this.valitutModuuliUrit = _(oj.moduulit)
      .keyBy('koodiUri')
      .value();
  }

  private unhoverOpintojakso(oj: any) {
    this.valitutModuuliUrit = null;
  }

  private toggleAll() {
    if (_.isEmpty(this.opened)) {
      this.opened = _.keyBy(this.oppiaineRakenne, 'id');
    }
    else {
      this.opened = {};
    }
  }

  public uusiOppiaine() {
    this.$router.push({
      name: 'paikallinenOppiaine',
      params: {
        ...this.$router.currentRoute.params,
        paikallinenOppiaineId: 'uusi',
      },
    });
  }

  public uusiOpintojakso() {
    this.$router.push({
      name: 'opintojakso',
      params: {
        ...this.$router.currentRoute.params,
        opintojaksoId: 'uusi',
      },
    });
  }
}
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
