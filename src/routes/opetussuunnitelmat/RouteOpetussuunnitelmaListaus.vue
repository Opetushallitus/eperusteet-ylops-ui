<template>
<div>
  <ep-main-view :tutoriaalistore="tutoriaalistore">
    <template slot="icon">
      <ep-icon class="float-right" icon="opetussuunnitelmasi" background-color="#5bca13">
      </ep-icon>
    </template>
    <template slot="header">
      <h2>{{ $t(tyyppi) }}</h2>
      <p>{{ $t(vars.kuvaus) }}</p>
    </template>

    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <div>
        <h2>{{ $t(vars.keskeneraiset) }}</h2>

        <div class="opscontainer">
          <div class="opsbox" v-oikeustarkastelu="'luonti'">
            <router-link tag="a" :to="{ name: vars.uusiRoute }">
              <div class="uusi">
                <div class="plus">
                  <fas icon="plus"></fas>
                </div>
                <div class="text">
                  {{ $t('luo-uusi') }}
                </div>
              </div>
            </router-link>
          </div>

          <div v-for="ops in keskeneraiset" :key="ops.id">
            <div v-if="ops.toteutus === 'lops2019' || ops.toteutus === 'yksinkertainen'"
                 class="opsbox">
              <router-link
                tag="a"
                :to="{ name: 'opsTiedot', params: { id: ops.id } }"
                :key="ops.id">
                <div class="chart">
                  <div class="progress-clamper">
                    <ep-progress :slices="[0.2, 0.5, 1]" />
                  </div>
                </div>
                <div class="info">
                  <div class="nimi">
                    {{ $kaanna(ops.nimi) }}
                  </div>
                </div>
              </router-link>
            </div>
            <div v-else
                 ref="disabled"
                 class="opsbox disabled">
              <div class="info-top">
                <p>{{ $t('koulutustyyppi-ei-ole-toteutettu') }}</p>
              </div>
              <div class="info">
                <div class="nimi">
                  {{ $kaanna(ops.nimi) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2>{{ $t(vars.julkaistut) }}</h2>

        <div class="info" v-if="julkaistut.length === 0">
          <div class="alert alert-info">{{ $t(vars.eivalmiita) }}</div>
        </div>

        <div class="opscontainer">
          <div v-for="ops in julkaistut" :key="ops.id">
            <div class="opsbox" v-if="ops.toteutus === 'lops2019' || ops.toteutus === 'yksinkertainen'">
              <router-link
                tag="a"
                :to="{ name: 'opsTiedot', params: { id: ops.id } }"
                :key="ops.id">
                <div class="chart">
                  <div class="progress-clamper">
                    <ep-progress :slices="[0.2, 0.5, 1]" />
                  </div>
                </div>
                <div class="info">
                  <div class="nimi">
                    {{ $kaanna(ops.nimi) }}
                  </div>
                </div>
              </router-link>
            </div>
            <div v-else
                 ref="disabled"
                 class="opsbox disabled">
              <div class="info-top">
                <p>{{ $t('koulutustyyppi-ei-ole-toteutettu') }}</p>
              </div>
              <div class="info">
                <div class="nimi">
                  {{ $kaanna(ops.nimi) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ep-main-view>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Mixins } from 'vue-property-decorator';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';
import EpRoute from '@/mixins/EpRoot';
import { Opetussuunnitelmat } from '@/api';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpProgress from '@/components/EpProgress.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';


@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpContent,
    EpIcon,
    EpMainView,
    EpNavigation,
    EpProgress,
    EpSpinner,
  },
})
export default class RouteOpetussuunnitelmaListaus extends Mixins(EpRoute) {
  @Prop({ default: 'opetussuunnitelmat' })
  private tyyppi!: 'opetussuunnitelmat' | 'pohjat';

  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

  private opslista: OpetussuunnitelmaInfoDto[] = [];

  get jarjestetyt() {
    return _.chain(this.opslista)
      .sortBy('luotu')
      .reverse()
      .value();
  }

  get arkistoimattomat() {
    return _.reject(this.jarjestetyt, ops => (ops.tila as any) === 'poistettu');
  }

  get valmisTila() {
    return this.tyyppi === 'pohjat'
      ? 'valmis'
      : 'julkaistu';
  }

  get keskeneraiset() {
    return _.reject(this.arkistoimattomat, ops => (ops.tila as any) === this.valmisTila);
  }

  get julkaistut() {
    return _.filter(this.arkistoimattomat, ops => (ops.tila as any) === this.valmisTila);
  }

  get vars() {
    if (this.tyyppi === 'pohjat') {
      return {
        getTarget: 'POHJA',
        julkaistut: 'valmiit-pohjat',
        keskeneraiset: 'keskeneraiset-pohjat',
        kuvaus: 'pohjat-kuvaus',
        uusiRoute: 'uusiPohja',
        eivalmiita: 'ei-valmiita-pohjia',
      };
    }
    else {
      return {
        getTarget: 'OPS',
        julkaistut: 'julkaistut-opetussuunnitelmat',
        keskeneraiset: 'keskeneraiset-opetussuunnitelmat',
        kuvaus: 'opetussuunnitelmat-kuvaus',
        uusiRoute: 'uusiOpetussuunnitelma',
        eivalmiita: 'ei-julkaistuja-opetussuunnitelmia',
      };
    }
  }

  protected async init() {
    const res = await Opetussuunnitelmat.getAll(this.tyyppi === 'pohjat' ? 'POHJA' : 'OPS');
    this.opslista = res.data;
  }
}
</script>

<style lang="scss" scoped>

@import '@/styles/_mixins.scss';

$box-size: 350px;

$box-radius: 10px;

.opscontainer {
  display: flex;
  flex-wrap: wrap;

  .opsbox {
    user-select: none;
    margin: 10px;
    border-radius: $box-radius;
    @include tile-background-shadow;

    .uusi {
      background-size: contain;
      background: linear-gradient(180deg, #1E49CF 0%, #0f3284 100%);
      border-radius: $box-radius;
      height: 230px;
      margin: 0 auto;
      padding-top: 48px;
      text-align: center;
      width: 192px;

      .plus {
        color: white;
        font-size: 50px;
        margin: 0 auto;
        text-align: center;
        width: 80px;
      }

      .text {
        color: white;
        font-weight: 600;
        margin: 0 auto;
        text-align: center;
        width: 80px;
      }
    }

    .chart {
      width: 192px;
      border-radius: $box-radius $box-radius 0 0;
      height: 138px;
      background: linear-gradient(180deg, #1E49CF 0%, #0f3284 100%);
      background-size: contain;
      margin: 0 auto;
      text-align: center;
      padding-top: 28px;

      .progress-clamper {
        width: 80px;
        text-align: center;
        margin: 0 auto;
      }
    }

    .info {
      border-radius: 0 0 $box-radius $box-radius;
      text-align: center;
      height: 92px;
      width: 192px;
      padding: 10px 10px;
      margin: 0 auto;
      border: 1px solid #E7E7E7;
      border-top-width: 0;
      overflow-y: auto;

      .nimi {
        color: #2B2B2B;
        text-align: center;
        hyphens: none;
        font-size: 12px;
        font-weight: 600;
      }
    }

    &:hover:not(.disabled) {
      @include tile-background-shadow-selected;
    }
  }

  .disabled {
    cursor: not-allowed;

    .info-top {
      width: 192px;
      height: 138px;
      border-radius: $box-radius $box-radius 0 0;
      background-color: lightgray;
      margin: 0 auto;
      text-align: center;
      padding-top: 28px;
      padding-left: 10px;
      padding-right: 10px;
    }
  }
}

</style>
