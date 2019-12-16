<template>
<div>
  <ep-navigation tyyli="ops" :tutoriaalistore="tutoriaalistore"></ep-navigation>
  <div class="opetussuunnitelma" v-if="ops">
    <div class="header">
      <div class="progress-chart">
        <ep-progress :slices="slices">
          <b-button v-if="!isPohja"
                    variant="primary"
                    :to="{ name: 'opsJulkaisu' }"
                    class="mb-2">{{ $t('siirry-julkaisunakymaan') }}</b-button>
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
          <span>{{ $kaanna(ops.nimi) }}</span>
          <span class="ml-2" v-if="isPohja">({{ $t('pohja') }})</span>
          <b-dropdown size="lg" variant="link" toggle-class="text-decoration-none" no-caret class="ratas">
            <template slot="button-content">
              <fas class="hallinta" icon="ratas"><span class="sr-only">{{ $t('hallinta') }}</span></fas>
            </template>
            <!-- https://bootstrap-vue.js.org/docs/reference/router-links/ -->
            <b-dropdown-item :to="{ name: 'opsTiedot' }">
              <fas class="mr-2" icon="info" fixed-width /><span>{{ isPohja ? $t('pohja-tiedot') : $t('tiedot') }}</span>
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'opsDokumentti' }">
              <fas class="mr-2" icon="luo-pdf" fixed-width /><span>{{ $t('luo-pdf') }}</span>
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'opsKasitteet' }">
              <fas class="mr-2" icon="kasitteet" fixed-width /><span>{{ $t('kasitteet') }}</span>
            </b-dropdown-item>
            <b-dropdown-item v-oikeustarkastelu="'hallinta'" :to="{ name: 'opsPoistetut' }">
              <fas class="mr-2" icon="roskalaatikko" fixed-width /><span>{{ $t('poistetut') }}</span>
            </b-dropdown-item>
            <b-dropdown-divider v-oikeustarkastelu="'hallinta'" v-if="!isPohja" />
            <b-dropdown-item v-oikeustarkastelu="'hallinta'" @click="arkistoiOps" v-if="!isPohja">
              <fas class="mr-2" icon="arkistoi" fixed-width /><span>{{ $t('arkistoi-ops') }}</span>
            </b-dropdown-item>
          </b-dropdown>
        </h1>
        <h4 v-if="ops.koulutustyyppi" class="secondary">{{ $t(ops.koulutustyyppi) }}</h4>
        <h6 class="secondary">{{ ops.perusteenDiaarinumero }}</h6>
      </div>
    </div>
    <div class="lower">
      <ep-sidebar>
        <template slot="bar">
          <ops-sidenav
            :opetussuunnitelma-store="store"
            :key="$route.fullPath" />
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
import { Prop, Mixins, Component } from 'vue-property-decorator';
import { Lops2019ValidointiDto } from '@/tyypit';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

import EpOpsRoute from '@/mixins/EpOpsRoute';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpSidebar from '@/components/EpSidebar/EpSidebar.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import OpsSidenav from '@/components/OpsSidenav/OpsSidenav.vue';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpProgress from '@/components/EpProgress.vue';


@Component({
  components: {
    EpCommentThreads,
    EpNavigation,
    EpProgress,
    EpSidebar,
    EpSpinner,
    OpsSidenav,
    EpButton,
  },
})
export default class RouteOpetussuunnitelma extends Mixins(EpOpsRoute) {

  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

  private validation: Lops2019ValidointiDto | null = null;

  protected async init() {
    await this.store.init();
    this.validation = await this.store.validate();

    if (this.store.opetussuunnitelma) {
      this.breadcrumb('opetussuunnitelma', this.store.opetussuunnitelma.nimi, { name: 'opsTiedot' });
    }
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

  async arkistoiOps() {
    if (await this.vahvista('arkistoi-ops', 'arkistoi-kuvaus')) {
      await this.store.updateTila('poistettu');
      this.$router.push({
        name: 'opetussuunnitelmaListaus',
      });
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
    background-position: 100% -50px;
    background-repeat: no-repeat;
    height: 190px;

    display: flex;
    align-items: center;
    color: $color-ops-header-text;

    h1 /deep/ button {
      color: $color-ops-header-text;
    }

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
