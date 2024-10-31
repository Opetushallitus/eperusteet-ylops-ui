<template>
<div>
  <ep-navigation
    tyyli="ops"
    :koulutustyyppi="koulutustyyppi"
    :headerClass="headerClass"
    :sticky="true">
  </ep-navigation>
  <ep-spinner class="center-loading" v-if="!ops"/>
  <div class="opetussuunnitelma" :class="headerClass" v-else>
    <div class="header" :style="headerStyle">
      <div class="progress-chart">
        <EpValidPopover
            :validoitava="ops"
            :validoinnit="validoinnit"
            :julkaisemattomiaMuutoksia="onkoJulkaisemattomiaMuutoksia"
            :julkaistava="!isPohja"
            :is-validating="isValidating"
            @asetaValmiiksi="valmistaPohja"
            @palauta="palauta"
            @validoi="validoi"
            tyyppi="opetussuunnitelma"
          />
      </div>
      <div class="info">
        <h1>
          <span>{{ $kaanna(ops.nimi) }}</span>
          <span class="ml-2" v-if="isPohja">({{ $t('pohja') }})</span>
        </h1>
        <div>
          <span v-if="koulutustyyppi">{{ $t(koulutustyyppi) }}</span>
          <span v-if="koulutustyyppi" class="ml-2 mr-2">|</span>
          <span>{{ ops.perusteenDiaarinumero }}</span>
          <span class="ml-2 mr-2">|</span>

          <b-dropdown class="asetukset" size="sm" no-caret variant="transparent">
            <template v-slot:button-content>
              <span>{{$t('lisatoiminnot')}}</span>
              <EpMaterialIcon icon-shape="outlined" class="hallinta" size="22px">expand_more</EpMaterialIcon>
            </template>

            <b-dropdown-item :to="{ name: 'opsTiedot' }">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">info</EpMaterialIcon>
              <span class="dropdown-text">{{ isPohja ? $t('pohja-tiedot') : $t('tiedot') }}</span>
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'opsDokumentti' }">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">picture_as_pdf</EpMaterialIcon>
              <span class="dropdown-text">{{ $t('luo-pdf') }}</span>
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'opsKasitteet' }">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">book</EpMaterialIcon>
              <span class="dropdown-text">{{ $t('kasitteet') }}</span>
            </b-dropdown-item>
            <b-dropdown-item v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" :to="{ name: 'opsPoistetut' }">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">delete</EpMaterialIcon>
              <span class="dropdown-text">{{ $t('poistetut') }}</span>
            </b-dropdown-item>
            <b-dropdown-divider v-if="ops.tila !== 'poistettu'"
                                v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" />
            <b-dropdown-item v-if="ops.tila !== 'poistettu'"
                             v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" @click="arkistoiOps">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">archive</EpMaterialIcon>
              <span class="dropdown-text">{{ $t('arkistoi-' + tyyppi) }}</span>
            </b-dropdown-item>
          </b-dropdown>
        </div>
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
import { OpetussuunnitelmaKevytDtoTilaEnum } from '@shared/api/ylops';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpSidebar from '@/components/EpSidebar/EpSidebar.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import OpsSidenav from '@/components/OpsSidenav/OpsSidenav.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { koulutustyyppiBanner } from '@shared/utils/bannerIcons';
import { themes } from '@shared/utils/perusteet';
import { LinkkiHandler, routeToNode } from '@/utils/routing';
import { Kielet } from '@shared/stores/kieli';
import EpValidPopover from '@shared/components/EpValidPopover/EpValidPopover.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpCommentThreads,
    EpNavigation,
    EpSidebar,
    EpSpinner,
    OpsSidenav,
    EpButton,
    EpValidPopover,
    EpMaterialIcon,
  },
  inject: [],
})
export default class RouteOpetussuunnitelma extends Mixins(EpOpsRoute) {
  private valikkoData: any | null = null;
  private isValidating: boolean = false;

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
    if (this.ops && themes[this.ops.koulutustyyppi!] !== 'lukiokoulutus') {
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
    if (this.store.validointi) {
      return {
        virheet: _.chain(this.store.validointi)
          .map('virheet')
          .flatMap()
          .map('kuvaus')
          .value(),
        huomautukset: _.chain(this.store.validointi)
          .map('huomautukset')
          .flatMap()
          .map('kuvaus')
          .value(),
      };
    }
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

  async validoi() {
    this.isValidating = true;
    await this.store.updateValidation();
    this.isValidating = false;
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

::v-deep .btn-sm {
  padding: 0 0 3px 0 !important;
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
}

::v-deep .btn:focus {
  box-shadow: unset;
}

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

.dropdown-text {
  vertical-align: text-top;
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
    background-position: 100% -56px;
    background-repeat: no-repeat;
    height: 190px;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }

    display: flex;
    align-items: center;

    h1 ::v-deep button {
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
