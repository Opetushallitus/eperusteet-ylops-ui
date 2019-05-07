<template lang="pug">

div.content
  h1
    span {{ $t('oppiaineet') }}
    .float-right
      ep-button(icon="plus", @click="uusiOppiaine()") {{ $t('lisaa-paikallinen-oppiaine') }}
  p {{ $t('route-oppiaineet-kuvaus') }}
  .search
    .inlay
      input.form-control.search(
        type="text",
        :placeholder="$t('rajaa')",
        v-model="query")
      fas.inner-icon(icon="search")

  table.table.table-borderless.oppiaineet
    thead.head
      tr
        th(width="20%") {{ $t('oppiaine') }}
        th(width="25%") {{ $t('luodut-opintojaksot') }}
        th(width="25%") {{ $t('liitetyt-moduulit') }}
        th(width="25%") {{ $t('vieraat-moduulit') }}
        th(width="5%")
          button.btn.btn-link(@click="toggleAll()")
            fas(icon="chevron-down")
    tbody
      template(v-for="oa in suodatettuOppiaineRakenne")
        tr.headerline
          td
            router-link(:to=`{ name: 'oppiaine', params: { oppiaineId: oa.id } }`)
              | {{ $kaanna(oa.nimi) }} ({{ oa.koodi.arvo }})
          td
            span(v-if="oa.oppimaarat.length === 0") {{ oa.stats.opintojaksot }}
          td(:class="oa.stats.valid ? 'valid' : 'invalid'")
            span(v-if="oa.oppimaarat.length === 0") {{ oa.stats.kaytetytModuulit }}/{{ oa.stats.kaikkiModuulit }}
          td
          td
            button.btn.btn-link(@click="toggleOppiaine(oa)", v-if="oa.oppimaarat.length === 0")
              fas(v-if="oa.isOpen", icon="chevron-down")
              fas(v-else, icon="chevron-up")
        tr.dataline(v-if="oa.oppimaarat.length === 0 && oa.isOpen")
          td
          td
            .boxcontainer(v-for="oj in oa.opintojaksot", :key="oj.id")
              .opintojakso(
                @mouseover="hoverOpintojakso(oj)",
                @mouseleave="unhoverOpintojakso(oj)")
                tr.item
                  // td.op {{ oj.laajuus || 0 }}{{ $t('op') }}
                  td.nimi 
                    router-link(:to=`{ name: 'opintojakso', params: { opintojaksoId: oj.id } }`)
                      | {{ $kaanna(oj.nimi) }} ({{ oj.koodi }})
          td
            div
              .boxcontainer(v-for="moduuli in oa.moduulit")
                .moduuli(:class="moduuli.classes")
                  tr.item
                    td
                      ep-color-ball.mr-2(:kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'")
                      span {{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})
                    // td.op {{ moduuli.laajuus }}{{ $t('op') }}
                    // td.nimi
                      span {{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})
          td
            div
              .boxcontainer(v-for="moduuli in oa.vieraatModuulit")
                .moduuli(:class="moduuli.classes")
                  // tr.item
                    td.op {{ moduuli.laajuus }}{{ $t('op') }}
                    td.nimi {{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})
                  td
                    ep-color-ball.mr-2(:kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'")
                    span {{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})
          td
      tr.total
        td {{ $t('yhteensa') }}
        td {{ total.opintojaksot }}
        td {{ total.kaytetytModuulit }}/{{ total.kaikkiModuulit }}
        td
        td

  // h2 {{ $t('paikalliset') }}
  // ep-button(icon="plus", @click="uusiOppiaine()") {{ $t('lisaa-paikallinen-oppiaine') }}

</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import {
  EpButton,
  EpCollapse,
  EpContent,
  EpEditointi,
  EpSpinner,
} from '@/components';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019OppiaineDto } from '@/tyypit';
import EpRoute from '@/mixins/EpRoute';
import { PerusteCache } from '@/stores/peruste';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { EpColorBall } from '@/components';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpSpinner,
  },
})
export default class RouteOppiaineet extends Mixins(EpRoute) {
  private cache: PerusteCache | null = null;
  private valitutModuuliUrit: { [uri: string]: string } | null = null;
  private query = '';
  private opened: { [id: number]: any } = {};

  get isHovering() {
    return this.valitutModuuliUrit !== null;
  }

  get peruste() {
    if (this.cache) {
      return this.cache!.peruste;
    }
  }

  get total() {
    return _(this.oppiaineRakenne)
      .map('stats')
      .reduce((acc, next) => {
        return {
          opintojaksot: acc.opintojaksot + next.opintojaksot,
          kaytetytModuulit: acc.kaytetytModuulit + next.kaytetytModuulit,
          kaikkiModuulit : acc.kaikkiModuulit + next.kaikkiModuulit,
        };
      }, {
        opintojaksot: 0,
        kaytetytModuulit: 0,
        kaikkiModuulit: 0,
      });
  }

  get oppiaineetJaOppimaarat() {
    return _(this.peruste.oppiaineet)
      .map(oa => [oa, ...oa.oppimaarat])
      .flatten()
      .value();
  }

  get moduulit() {
    return _(this.oppiaineetJaOppimaarat)
      .map('moduulit')
      .flatten()
      .value();
  }

  get moduulitByKoodi() {
    return _(this.moduulit)
      .keyBy('koodi.uri')
      .value();
  }

  get suodatettuOppiaineRakenne() {
    return _(this.oppiaineRakenne)
      .map(oa => {
        return {
          ...oa,
          moduulit: _.filter(oa.moduulit, (moduuli) => Kielet.search(this.query, moduuli.nimi)),
          opintojaksot: _.filter(oa.opintojaksot, (oj) => Kielet.search(this.query, oj.nimi)),
        };
      })
      .filter(oa => Kielet.search(this.query, oa.nimi)
          || !_.isEmpty(oa.moduulit)
          || !_.isEmpty(oa.opintojaksot))
      .value();
  }

  private moduuliPresentation(moduuli: any, opintojaksojenModuulit: any) {
    const active = this.valitutModuuliUrit !== null
      && !!this.valitutModuuliUrit[moduuli.koodi.uri];
    const used = !!opintojaksojenModuulit[moduuli.koodi.uri];
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

  get oppiaineRakenne() {
    if (!this.peruste) {
      return [];
    }

    return _(this.peruste.oppiaineet)
      .map(oa => [oa, ...oa.oppimaarat])
      .flatten()
      .map(oa => {
        const opintojaksot = _(Opetussuunnitelma.opintojaksot)
          .filter(oj => _.includes(
            _.map(oj.oppiaineet, 'koodi'),
            oa.koodi.uri))
          .sortBy('koodi')
          .value();
        const opintojaksojenModuulit = _(opintojaksot)
          .map('moduulit')
          .flatten()
          .keyBy('koodiUri')
          .value();
        const vieraatModuulit = _(opintojaksot)
          .map('moduulit')
          .flatten()
          .sortBy('koodiUri')
          .map(moduuli => {
            return this.moduulitByKoodi[moduuli.koodiUri]
          })
          .reject(moduuli => _.startsWith(moduuli.koodi.arvo, oa.koodi.arvo))
          .map(moduuli => this.moduuliPresentation(moduuli, opintojaksojenModuulit))
          .value();
        return {
          ...oa,
          isOpen: this.opened[oa.id] || !_.isEmpty(this.query),
          moduulit: _.map(oa.moduulit, (moduuli) => this.moduuliPresentation(moduuli, opintojaksojenModuulit)),
          vieraatModuulit,
          opintojaksot,
          stats: {
            opintojaksot: _.size(opintojaksot),
            kaytetytModuulit: _.size(opintojaksojenModuulit),
            kaikkiModuulit: _.size(oa.moduulit),
            valid: _.size(opintojaksojenModuulit) === _.size(oa.moduulit),
          },
        };
      })
      .value();
  }

  async mounted() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
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

}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

.content {
  padding: 20px;
}

table.oppiaineet {
  border-collapse: collapse;

  th, td {
    border: none;
  }

  thead {
    border: none;
  }

  tr.headerline {
    background: $paletti-background-light-2;
    border-bottom: 1px solid #ddd;

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
      padding: 16px;
    }
  }

  tr.dataline {
    background: $paletti-background-light;
    border: 1px solid $paletti-background-light-2;
    font-size: 80%;

    td.chevron {
      width: 10px;
    }

    td {
      padding: 2px;

      .boxcontainer {
        margin-top: 4px;

        &:hover {
          cursor: pointer;
          color: $color-links;
        }
      }

      tr.item {
        padding: 0px;

        td.op {
          padding: 4px;
        }
        td.nimi {
          padding: 4px;
        }
      }

      .opintojakso {
        padding: 4px;
        padding-left: 0px;
      }

      .moduuli {
        padding: 4px;
        padding-left: 4px;
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
}

.search {
  margin-bottom: 0px;
  max-width: 300px;

  input.search {
    background: #F3F3F3;
    border: none;
    border-radius: 20px;
    padding-left: 34px;
  }

  .inlay {
    .inner-icon {
      color: #888;
      position: relative;
      /* float: right; */
      top: -30px;
      left: 10px;
    }
  }
}

</style>

