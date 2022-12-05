<template>
<div>
  <ep-navigation tyyli="ops" :tutoriaalistore="tutoriaalistore" :koulutustyyppi="koulutustyyppi" :headerClass="headerClass"></ep-navigation>
  <ep-spinner class="center-loading" v-if="!ops"/>
  <div class="opetussuunnitelma" :class="headerClass" v-else>
    <div class="header" :style="headerStyle">
      <div class="progress-chart">
        <EpValidPopover
            :validoitava="ops"
            :validoinnit="validoinnit"
            :julkaisemattomiaMuutoksia="onkoJulkaisemattomiaMuutoksia"
            :julkaistava="!isPohja"
            @asetaValmiiksi="valmistaPohja"
            @palauta="palauta"
            tyyppi="opetussuunnitelma"
          />
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
            :key="$route.fullPath"
            v-model="valikkoData"/>
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
import { Prop, Mixins, Component, ProvideReactive } from 'vue-property-decorator';
import { Lops2019ValidointiDto, OpetussuunnitelmaKevytDtoTilaEnum } from '@shared/api/ylops';
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
import { tileBackgroundColor, koulutustyyppiBanner } from '@shared/utils/bannerIcons';
import { themes } from '@shared/utils/perusteet';
import { LinkkiHandler, routeToNode } from '@/utils/routing';
import { Kielet } from '@shared/stores/kieli';
import EpValidPopover from '@shared/components/EpValidPopover/EpValidPopover.vue';

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
    EpValidPopover,
  },
  inject: [],
})
export default class RouteOpetussuunnitelma extends Mixins(EpOpsRoute) {
  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

  private valikkoData: any | null = null;

  protected async init() {
    await this.store.init();

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

  async arkistoiOps() {
    if (await this.vahvista('arkistoi-' + this.tyyppi, 'arkistoi-kuvaus-' + this.tyyppi)) {
      await this.store.updateTila('poistettu');
      this.$success(this.$t('tilan-vaihto-poistettu-onnistui') as string);
      this.$router.push({
        name: this.tyyppi + 'Listaus',
      });
    }
  }

  get headerStyle() {
    if (this.ops) {
      return koulutustyyppiBanner(this.ops.koulutustyyppi!);
    }

    return '';
  }

  get headerClass() {
    if (this.ops && themes[this.ops.koulutustyyppi!] !== 'lukio') {
      return 'light';
    }

    return 'dark';
  }

  get tila() {
    if (this.julkaisut) {
      if (this.isJulkaistu) {
        return _.toLower(OpetussuunnitelmaKevytDtoTilaEnum.JULKAISTU);
      }

      return _.toLower(this.ops?.tila);
    }
  }

  get isLuonnos() {
    return this.tila === _.toLower(OpetussuunnitelmaKevytDtoTilaEnum.LUONNOS);
  }

  get isJulkaistu() {
    return (_.size(this.julkaisut) > 0 || this.ops?.tila === _.toLower(OpetussuunnitelmaKevytDtoTilaEnum.JULKAISTU)) && !this.isArkistoitu;
  }

  get isArkistoitu() {
    return this.ops?.tila === _.toLower(OpetussuunnitelmaKevytDtoTilaEnum.POISTETTU);
  }

  get julkaisut() {
    return this.store.julkaisut;
  }

  get validoinnit() {
    if ((this.ops!.toteutus as any) === 'lops2019' && this.store.lops2019Validation?.validoinnit) {
      return this.lops2019Validation;
    }

    if (this.store.validointi) {
      return this.validation;
    }
  }

  get validation() {
    return {
      virheet: _.chain(this.store.validointi)
        .map('virheet')
        .flatMap()
        .map('syy')
        .value(),
    };
  }

  get lops2019Validation() {
    return {
      virheet: _.chain(this.store.lops2019Validation?.validoinnit)
        .keys()
        .filter(key => _.some(this.store.lops2019Validation?.validoinnit![key], info => info.failed && info.fatal))
        .value(),
      huomautukset: _.chain(this.store.lops2019Validation?.validoinnit)
        .keys()
        .filter(key => _.some(this.store.lops2019Validation?.validoinnit![key], info => info.failed && !info.fatal))
        .value(),
      ok: _.chain(this.store.lops2019Validation?.validoinnit)
        .keys()
        .filter(key => !_.some(this.store.lops2019Validation?.validoinnit![key], info => info.failed && info.fatal))
        .value(),
    };
  }

  get onkoJulkaisemattomiaMuutoksia() {
    return this.store.julkaisemattomiaMuutoksia;
  }

  async palauta() {
    if (await this.vahvista('palauta-' + this.tyyppi, 'palauta-' + this.tyyppi + '-vahvistus')) {
      await this.store.updateTila('luonnos');
      this.$success(this.$t('tilan-vaihto-luonnos-onnistui') as string);
    }
  }

  get arkistoituTyyppiTeksti() {
    if (this.tyyppi === 'pohja') {
      return 'voit-palauttaa-arkistoidun-pohjan-luonnostilaan';
    }

    return 'voit-palauttaa-arkistoidun-opetussuunnitelman-luonnostilaan';
  }

  public async valmistaPohja() {
    const valmista = await this.$bvModal.msgBoxConfirm(this.$t('pohja-valmis-varmistus') as any, {
      title: this.$t('aseta-pohja-valmiiksi') as any,
      okVariant: 'primary',
      okTitle: this.$t('aseta-valmiiksi') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
    });

    if (valmista) {
      try {
        await this.store.updateTila('valmis');
        this.$success(this.$t('tilan-vaihto-valmis-onnistui') as any);
      }
      catch (err) {
        this.$fail(this.$t('tilan-vaihto-valmis-epaonnistui') as any);
      }
    }
  }

  @ProvideReactive('navigation')
  get navigation(): any {
    return {
      type: 'root',
      children: this.navigationToNode(this.valikkoData),
    };
  }

  navigationToNode(items: any[]): any[] {
    return _.chain(items)
      .filter(item => !!item.item.objref?.nimi || !!item.item.i18key)
      .map(item => {
        return {
          label: item.item.objref?.nimi || { [Kielet.getUiKieli.value]: _.isArray(item.item.i18key) ? _.join(_.map(item.item.i18key, key => this.$t(key)), ', ') : this.$t(item.item.i18key) },
          children: this.navigationToNode(item.children),
          ...routeToNode(item.route),
        };
      })
      .value();
  }

  @ProvideReactive('linkkiHandler')
  get linkkiHandler() {
    return new LinkkiHandler();
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.center-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -50px;
}

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
    .header, .progress-chart {
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
      width: 100%;
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
