<template>
<div>
  <ep-navigation tyyli="ops"></ep-navigation>
  <div class="opetussuunnitelma" v-if="ops">
    <div class="header">
      <div class="progress-chart">
        <ep-progress :slices="slices">
          <div v-if="validation">
            <table class="category-table">
              <tr v-for="c in validationStats.categories" :key="c.category">
                <td>
                  <div class="nimi">
                    {{ $t(c.category) }}
                  </div>
                  <div class="arvot">
                    {{ c.ok }} / {{ c.total }}
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <ep-spinner v-else />
        </ep-progress>
      </div>
      <div class="info">
        <h1>
          <span>{{ $kaanna(ops.nimi) }}</span><span class="ml-2" v-if="isPohja">({{ $t('pohja') }})</span>
          <b-dropdown class="text-decoration-none" variant="link" no-caret="no-caret"><template slot="button-content">
              <fas class="hallinta" icon="cog"><span class="sr-only">{{ $t('hallinta') }}</span></fas>
            </template>
            <b-dropdown-item>
              <router-link class="btn btn-link" :to="{ name: 'opsTiedot' }">
                <fas class="mr-2" icon="info-circle"></fas><span>{{ $t('tiedot') }}</span>
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item v-if="isOps">
              <router-link class="btn btn-link" :to="{ name: 'opsDokumentti' }">
                <fas class="mr-2" icon="file-pdf"></fas><span>{{ $t('luo-pdf') }}</span>
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item>
              <router-link class="btn btn-link" :to="{ name: 'opsPoistetut' }">
                <fas class="mr-2" icon="recycle"></fas><span>{{ $t('poistetut') }}</span>
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item>
              <router-link class="btn btn-link" :to="{ name: 'opsKasitteet' }">
                <fas class="mr-2" icon="bookmark"></fas><span>{{ $t('kasitteet') }}</span>
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item>
              <router-link class="btn btn-link" :to="{ name: 'jarjesta' }">
                <fas class="mr-2" icon="cog"></fas><span>{{ $t('rakenne') }}</span>
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item v-if="isOps">
              <router-link class="btn btn-link" :to="{ name: 'opsJulkaisu' }">
                <fas class="mr-2" icon="upload"></fas><span>{{ $t('julkaise') }}</span>
              </router-link>
            </b-dropdown-item>
          </b-dropdown>
          <!-- b-badgeOpetushallitus.ml-2(style="font-size: 14px", variant="success", v-if="isValmisPohja")| {{ $t('julkinen') }}
        -->
        </h1>
        <h4 v-if="ops.koulutustyyppi" class="secondary">{{ $t(ops.koulutustyyppi) }}</h4>
        <h6 class="secondary">{{ ops.perusteenDiaarinumero }}</h6>
      </div>
    </div>
    <div class="lower">
      <ep-sidebar>
        <template slot="bar">
          <ops-sidenav />
        </template>
        <template slot="view">
          <transition name="fade" mode="out-in">
            <!-- ep-comment-threads-->
            <router-view :key="$route.fullPath" />
          </transition>
        </template>
      </ep-sidebar>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import {
  EpNavigation,
  EpSidebar,
  EpSpinner,
  EpCommentThreads,
  OpsSidenav,
} from '@/components';
import EpProgress from '@/components/EpProgress.vue';
import { Lops2019ValidointiDto } from '@/tyypit';


@Component({
  components: {
    EpCommentThreads,
    EpNavigation,
    EpProgress,
    EpSidebar,
    EpSpinner,
    OpsSidenav,
  },
})
export default class RouteOpetussuunnitelma extends Mixins(EpOpsRoute) {
  private validation: Lops2019ValidointiDto | null = null;

  protected async init() {
    const id = this.$route.params.id;
    await Opetussuunnitelma.init(_.parseInt(id));
    this.validation = await Opetussuunnitelma.validate();
  }

  get slices() {
    return _.map(this.validationStats.categories, c => c.ok / c.total);
  }

  get validationStats() {
    if (this.validation) {
      const categories = _(this.validation.validoinnit)
        .map((validations, category) => {
          const failcount = _.size(_.filter(validations, v => v.failed && v.fatal));
          const total = _.size(validations);
          return {
            category,
            ok: total - failcount,
            failcount,
            total,
          };
        })
        .sortBy('category')
        .value();
      const failed = _.size(_.reject(categories, 'ok'));

      return {
        categories,
        failed,
        total: _.size(categories),
        ok: _.size(categories) - failed,
      };
    }
    else {
      return {
        categories: [],
        failed: 0,
        ok: 0,
      };
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}

.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}

.opetussuunnitelma {
  background: white;

  .header {
    background-image: url('../../../public/img/banners/header.svg');
    background-position: 100% -51px;
    background-repeat: no-repeat;
    height: 190px;

    display: flex;
    align-items: center;
    color: $color-ops-header-text;

    .progress-chart {
      width: $sidebar-width;
      height: 150px;

      @media only screen and (max-width: 1024px) {
        display: none;
      }
    }

    .progress-chart > div {
      width: 130px;
      margin: 0 auto;
    }

    .info {
      @media only screen and (max-width: 768px) {
        padding-left: 30px;
      }

    }

  }

}

table.category-table {
  width: 100%;

  .nimi {
    font-weight: 600;
  }
  .arvot {
    font-size: 70%;
    color: #777;
  }
}
</style>
