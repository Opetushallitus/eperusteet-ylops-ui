<template>
<div>
  <ep-main-view :tutoriaalistore="tutoriaalistore">
    <template slot="icon">
      <ep-icon class="float-right" icon="opetussuunnitelmasi" background-color="#5bca13">
      </ep-icon>
    </template>
    <template slot="header">
      <h1>{{ $t(tyyppi) }}</h1>
      <ep-arkistoidut-ops ref="arkistoidutPopup"
                          :tyyppi="tyyppi"
                          :title="vars.poistetut"
                          class="float-right"
                          @restore="palauta"/>
      <p>{{ $t(vars.kuvaus) }}</p>

      <div class="d-flex">
        <b-form-group :label="$t('nimi')">
          <ep-search v-model="rajain" :placeholder="$t(vars.etsi)"></ep-search>
        </b-form-group>

        <b-form-group :label="$t('koulutustyyppi')" class="w-40">
          <koulutustyyppi-select v-model="koulutustyyppi" :isEditing="true" :koulutustyypit="yleissivistavatKoulutustyypit"/>
        </b-form-group>
      </div>
    </template>

    <b-container fluid class="pl-0">
      <b-row>
        <b-col>
          <div class="opslistaus">
            <h2>{{ $t(vars.keskeneraiset) }} <span v-if="opslista">({{opslista['kokonaismäärä']}})</span></h2>

            <ep-spinner v-if="!opslista"></ep-spinner>

            <div v-else>
              <div class="info" v-if="opetussuunnitelmat.length === 0">
                <div v-if="hasRajain">
                  {{ $t('ei-hakutuloksia') }}
                </div>
              </div>

              <div class="opscontainer" :class="{'disabled-events': opsHaku}">
                <div class="opsbox"
                    v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'opetussuunnitelma' }">
                  <router-link tag="a" :to="{ name: vars.uusiRoute }">
                    <div class="uusi">
                      <div class="plus">
                        <fas icon="plussa"></fas>
                      </div>
                      <div class="text">
                        {{ $t('luo-uusi') }}
                      </div>
                    </div>
                  </router-link>
                </div>

                <div v-for="ops in opetussuunnitelmat" :key="ops.id">
                  <div v-if="ops.tuettu"
                      class="opsbox">
                    <router-link
                      tag="a"
                      :to="{ name: 'yleisnakyma', params: { id: ops.id } }"
                      :key="ops.id">
                      <div class="chart" :style="ops.tileStyle">
                        <div class="progress-clamper">
                          <ep-progress :slices="[0.2, 0.5, 1]" />
                        </div>
                      </div>
                      <div class="info">
                        <div class="nimi">
                          {{ $kaanna(ops.nimi, false, false) }}
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
                        {{ $kaanna(ops.nimi, false, false) }}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div class="paginating">
                <b-pagination
                  v-model="opsSivu"
                  :total-rows="opslista['kokonaismäärä']"
                  :per-page="10"
                  aria-controls="opetussuunnitelmat"
                  align="center">
                </b-pagination>
              </div>
            </div>
          </div>

          <div class="opslistaus">
            <h2 class="mt-4">{{ $t(vars.julkaistut) }} <span v-if="julkaistutLista">({{julkaistutLista['kokonaismäärä']}})</span></h2>

            <ep-spinner v-if="!julkaistutLista"></ep-spinner>

            <div v-else>
              <div class="info" v-if="julkaistut.length === 0">
                <div v-if="hasRajain">
                  {{ $t('ei-hakutuloksia') }}
                </div>
                <ep-alert v-else :ops="true" :text="$t(vars.eivalmiita)" />
              </div>

              <div class="opscontainer" :class="{'disabled-events': julkaistutHaku}">
                <div v-for="ops in julkaistut" :key="ops.id">
                  <div class="opsbox julkaistu" :style="ops.bannerImage">
                    <router-link
                      tag="a"
                      :to="{ name: 'yleisnakyma', params: { id: ops.id } }"
                      :key="ops.id">
                      <div class="julkaistu">
                      </div>
                      <div class="info d-flex flex-column justify-content-between">
                        <div class="nimi">
                          {{ $kaanna(ops.nimi, false, false) }}
                        </div>
                        <div v-if="ops.julkaistu" class="nimi">
                          <hr />
                          <div class="julkaisu">
                            {{ $t('julkaistu') }} {{$sd(ops.julkaistu)}}
                          </div>
                        </div>
                      </div>
                    </router-link>
                  </div>
                </div>

              </div>
              <div class="paginating">
                <b-pagination
                  v-model="julkaistutSivu"
                  :total-rows="julkaistutLista['kokonaismäärä']"
                  :per-page="10"
                  aria-controls="julkaistut-opetussuunnitelmat"
                  align="center">
                </b-pagination>
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </ep-main-view>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Mixins, Watch } from 'vue-property-decorator';

import { OpetussuunnitelmaInfoDto, Opetussuunnitelmat, OpetussuunnitelmaInfoDtoToteutusEnum } from '@shared/api/ylops';

import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { success, fail } from '@/utils/notifications';
import { Kielet } from '@shared/stores/kieli';
import { isOpsToteutusSupported } from '@/utils/opetussuunnitelmat';

import EpRoute from '@/mixins/EpRoot';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpProgress from '@shared/components/EpProgressPopover/EpProgress.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpArkistoidutOps from '@/components/EpArkistoidutOps/EpArkistoidutOps.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import { yleissivistavatKoulutustyypit, themes } from '@shared/utils/perusteet';
import { tileBackgroundColor, koulutusTyyppiTile } from '@shared/utils/bannerIcons';
import { Debounced } from '@shared/utils/delay';
import { Page } from '@shared/tyypit';

@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpButton,
    EpIcon,
    EpMainView,
    EpNavigation,
    EpProgress,
    EpSpinner,
    EpAlert,
    EpArkistoidutOps,
    EpSearch,
    KoulutustyyppiSelect,
  },
})
export default class RouteOpetussuunnitelmaListaus extends Mixins(EpRoute) {
  @Prop({ default: 'ops' })
  private tyyppi!: 'ops' | 'pohja';

  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

  private opslista: Page<OpetussuunnitelmaInfoDto> | null = null;
  private julkaistutLista: Page<OpetussuunnitelmaInfoDto> | null = null;

  private rajain = '';
  private koulutustyyppi = '';
  private opsSivu = 1;
  private julkaistutSivu = 1;
  private opsHaku = false;
  private julkaistutHaku = false;

  get hasRajain() {
    return !_.isEmpty(this.rajain);
  }

  get valmisTila() {
    return this.tyyppi === 'pohja'
      ? 'valmis'
      : 'julkaistu';
  }

  get opetussuunnitelmat() {
    return _.chain(this.opslista?.data)
      .map(ops => {
        return {
          ...ops,
          tuettu: isOpsToteutusSupported(ops),
          tileStyle: tileBackgroundColor(ops.koulutustyyppi!),
        };
      })
      .value();
  }

  get julkaistut() {
    return _.chain(this.julkaistutLista?.data)
      .map(ops => {
        return {
          ...ops,
          bannerImage: koulutusTyyppiTile(ops.koulutustyyppi),
        };
      })
      .value();
  }

  get vars() {
    if (this.tyyppi === 'pohja') {
      return {
        eiarkistoituja: 'ei-arkistoituja-pohjia',
        eivalmiita: 'ei-valmiita-pohjia',
        etsi: 'etsi-pohjista',
        getTarget: 'POHJA',
        julkaistut: 'valmiit-pohjat',
        keskeneraiset: 'keskeneraiset-pohjat',
        kuvaus: 'pohjat-kuvaus',
        palautaOps: 'palauta-pohja',
        palautaOpsKuvaus: 'palauta-pohja-kuvaus',
        poistetut: 'arkistoidut-pohjat',
        uusiRoute: 'uusiPohja',
      };
    }
    else {
      return {
        eiarkistoituja: 'ei-arkistoituja-opetussuunnitelmia',
        eivalmiita: 'ei-julkaistuja-opetussuunnitelmia',
        etsi: 'etsi-opetussuunnitelmia',
        getTarget: 'OPS',
        julkaistut: 'julkaistut-opetussuunnitelmat',
        keskeneraiset: 'keskeneraiset-opetussuunnitelmat',
        kuvaus: 'opetussuunnitelmat-kuvaus',
        palautaOps: 'palauta-ops',
        palautaOpsKuvaus: 'palauta-ops-kuvaus',
        poistetut: 'arkistoidut-opetussuunnitelmat',
        uusiRoute: 'uusiOpetussuunnitelma',
      };
    }
  }

  async palauta(ops: OpetussuunnitelmaInfoDto) {
    if (await this.vahvista(this.vars.palautaOps, this.vars.palautaOpsKuvaus)) {
      try {
        await OpetussuunnitelmaStore.updateOpsTila(ops.id!, 'luonnos');
        success('palautus-onnistui');
        (this.$refs['arkistoidutPopup'] as any).close();
      }
      catch (err) {
        fail('palautus-epaonnistui');
      }
    }
  }

  @Watch('koulutustyyppi')
  async koulutustyyppiChange() {
    this.opsSivu = 1;
    this.julkaistutSivu = 1;
    this.opslista = null;
    this.julkaistutLista = null;
    await this.init();
  }

  @Watch('rajain')
  @Debounced()
  async rajainChange() {
    this.opsSivu = 1;
    this.julkaistutSivu = 1;
    this.opslista = null;
    this.julkaistutLista = null;
    await this.init();
  }

  @Watch('opsSivu')
  async opsSivuChange() {
    await this.fetchOps();
  }

  @Watch('julkaistutSivu')
  async julkaistutSivuChange() {
    await this.fetchJulkaisut();
  }

  protected async init() {
    await this.fetchOps();
    await this.fetchJulkaisut();
  }

  protected async fetchOps() {
    this.opsHaku = true;
    this.opslista = (await Opetussuunnitelmat.getSivutettu(this.tyyppi as any, 'luonnos', this.koulutustyyppi, this.rajain, this.opsSivu - 1, 14)).data as Page<OpetussuunnitelmaInfoDto>;
    this.opsHaku = false;
  }

  protected async fetchJulkaisut() {
    this.julkaistutHaku = true;
    this.julkaistutLista = (await Opetussuunnitelmat.getSivutettu(this.tyyppi as any, this.valmisTila, this.koulutustyyppi, this.rajain, this.julkaistutSivu - 1, 10)).data as Page<OpetussuunnitelmaInfoDto>;
    this.julkaistutHaku = false;
  }

  get yleissivistavatKoulutustyypit() {
    return yleissivistavatKoulutustyypit;
  }
}
</script>

<style lang="scss" scoped>
@import '@shared/styles/_mixins.scss';

$box-size: 350px;

$box-radius: 10px;

h1 {
  color: #001A58;
  font-size: 0.5555555555555556rem;
  font-weight: 400;
}

h2 {
  font-size: 1.1111111111111112rem;
  font-weight: 400;
}

.opslistaus {

  .info {
    padding: 10px 0;
  }

  .paginating {
    margin-right: 15%;
  }

  .opscontainer {
    display: flex;
    flex-wrap: wrap;

    .opsbox {
      user-select: none;
      margin: 10px;
      border-radius: $box-radius;
      @include tile-background-shadow;

      .poistettu {
        background-size: contain;
        background: linear-gradient(180deg, #e7eefe 0%, #f3f6fe 100%);
        border-radius: $box-radius;
        height: 230px;
        margin: 0 auto;
        padding-top: 0;
        text-align: center;
        width: 192px;

        .ikoni {
          color: #e44e4e;
          font-size: 50px;
          margin: 0 auto;
          text-align: center;
          width: 80px;
        }

        .text {
          color: black;
          font-weight: 400;
          margin: 0 auto;
          text-align: center;
          overflow-y: auto;
          height: 80px;
        }

        .palauta {
          margin-top: 20px;
        }
      }

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

      &.julkaistu {
        height: 230px;
        background-repeat: no-repeat;

        .info {
          height: 150px;
        }
      }

      .julkaistu, .chart {
        width: 192px;
        border-radius: $box-radius $box-radius 0 0;
        background-size: contain;
        margin: 0 auto;
        text-align: center;
      }

      .julkaistu {
        height: 80px;
        border: 1px solid #E7E7E7;
        border-bottom-width: 0;
      }

      .chart {
        height: 138px;
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
}

</style>
