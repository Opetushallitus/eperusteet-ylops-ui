<template>
<div>
  <ep-navigation tyyli="ops" :tutoriaalistore="tutoriaalistore" :koulutustyyppi="koulutustyyppi" :headerClass="headerClass"></ep-navigation>
  <div class="opetussuunnitelma" v-if="ops" :class="headerClass">
    <div class="header" :style="headerStyle">
      <div class="progress-chart">
        <ep-progress-popover :slices="slices" :height="90" :width="90" :popupStyle="progressPopoverStyle">
          <template v-slot:header>
            <div class="pt-3 row justify-content-center ">
              <div v-if="validationStats.ok < validationStats.total">
                {{ validationStats.ok }} / {{ validationStats.total }} {{$t('valmis')}}
              </div>
              <div v-else-if="validation">
                <b-button v-if="!isPohja"
                          variant="primary"
                          :to="{ name: 'opsJulkaisu' }">
                  {{ $t('julkaise') }}
                </b-button>
              </div>
            </div>
          </template>
          <b-button v-if="!isPohja && validationStats.ok < validationStats.total"
                    variant="primary"
                    :to="{ name: 'opsJulkaisu' }"
                    :class="{ 'mb-2': !isEmptyValidation }">{{ $t('siirry-julkaisunakymaan') }}</b-button>
          <div v-if="validation">
            <div class="nimi pb-2 row" v-for="c in validationStats.categories" :key="c.category">
              <div class="col-1">
                <fas class="text-success" icon="check-circle" v-if="c.failcount === 0"/>
                <fas class="text-danger" icon="info-circle" v-if="c.failcount > 0"/>
              </div>
              <div class="col">
                <span v-if="c.failcount === 0">{{ $t(c.category + "-validation-ok") }}</span>
                <span v-if="c.failcount > 0">{{ $t(c.category + "-validation-error") }}</span>
              </div>
            </div>
          </div>
          <ep-spinner v-else />
        </ep-progress-popover>
      </div>
      <div class="info">
        <h1>
          <span>{{ $kaanna(ops.nimi) }}</span><span class="ml-2" v-if="isPohja">({{ $t('pohja') }})</span>
          <b-dropdown size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
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
            <b-dropdown-item v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" :to="{ name: 'opsPoistetut' }">
              <fas class="mr-2" icon="roskalaatikko" fixed-width /><span>{{ $t('poistetut') }}</span>
            </b-dropdown-item>
            <b-dropdown-divider v-if="ops.tila !== 'poistettu'"
              v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" />
            <b-dropdown-item v-if="ops.tila !== 'poistettu'"
              v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" @click="arkistoiOps">
              <fas class="mr-2" icon="arkistoi" fixed-width /><span>{{ $t('arkistoi-' + tyyppi) }}</span>
            </b-dropdown-item>
          </b-dropdown>
        </h1>
        <h4 v-if="koulutustyyppi" class="secondary">{{ $t(koulutustyyppi) }}</h4>
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
import { Lops2019ValidointiDto } from '@shared/api/ylops';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

import EpOpsRoute from '@/mixins/EpOpsRoute';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpSidebar from '@/components/EpSidebar/EpSidebar.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import OpsSidenav from '@/components/OpsSidenav/OpsSidenav.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpProgress from '@/components/EpProgress/EpProgress.vue';
import EpProgressPopover from '@shared/components/EpProgressPopover/EpProgressPopover.vue';
import { themes, tileBackgroundColor, koulutustyyppiBanner } from '@shared/utils/perusteet';

@Component({
  components: {
    EpCommentThreads,
    EpNavigation,
    EpProgress,
    EpSidebar,
    EpSpinner,
    OpsSidenav,
    EpButton,
    EpProgressPopover,
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
      this.breadcrumb('opetussuunnitelma', this.store.opetussuunnitelma.nimi, { name: 'yleisnakyma' });
    }
  }

  get koulutustyyppi() {
    if (this.ops) {
      return this.ops.koulutustyyppi;
    }
  }

  get tyyppi() {
    return this.isPohja ? 'pohja' : 'opetussuunnitelma';
  }

  get slices() {
    if (this.validation) {
      return _.map(this.validationStats.categories, c => c.ok < c.total ? 0.4 : 1);
    }
  }

  get isEmptyValidation() {
    return _.isEmpty(this.validationStats.categories);
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
      const failed = _.size(_.reject(categories, (category) => category.ok === category.total));

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
    if (await this.vahvista('arkistoi-' + this.tyyppi, 'arkistoi-kuvaus-' + this.tyyppi)) {
      await this.store.updateTila('poistettu');
      this.$router.push({
        name: this.tyyppi + 'Listaus',
      });
    }
  }

  get headerStyle() {
    if (this.ops) {
      return koulutustyyppiBanner(themes[this.ops.koulutustyyppi!]);
    }

    return '';
  }

  get headerClass() {
    if (this.ops && themes[this.ops.koulutustyyppi!] !== 'lukio') {
      return 'light';
    }

    return 'dark';
  }

  get progressPopoverStyle() {
    if (this.ops) {
      return tileBackgroundColor(this.ops.koulutustyyppi!);
    }

    return '';
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}

.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}

.opetussuunnitelma {
  background: white;
  &.light {
    .header {
      color: $color-ops-header-black-text;
    }
  }

  .header {
    color: $color-ops-header-text;
    background-position: 100% -50px;
    background-repeat: no-repeat;
    height: 190px;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }

    display: flex;
    align-items: center;

    h1 /deep/ button {
      color: inherit;
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
      padding-left: 15px;

      @media only screen and (max-width: 768px) {
        padding-left: 30px;
      }
    }
  }
}

table.category-table {
  width: 100%;

  .arvot {
    font-size: 70%;
    color: #777;
  }
}
</style>
