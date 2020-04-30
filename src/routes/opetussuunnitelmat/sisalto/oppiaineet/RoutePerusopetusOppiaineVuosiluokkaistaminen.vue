<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.oppiaine.nimi) }}: {{ $t('vuosiluokkaista-tavoitteet') }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing }">

        <div class="m-3">{{$t('lisaa-tavoitteet-vuosiluokille')}}</div>

        <b-container class="vuosiluokkaistaminen">
          <b-row>
            <b-col cols="6" class="pl-0 tavoitesisallot">
              <div class="d-flex justify-content-between align-items-center">
                <h3>{{$t('tavoitteet-ja-sisallot')}}</h3>
                <ep-button variant="link" @click="suljeAvaaKaikki()">{{$t('avaa-sulje-kaikki')}}</ep-button>
              </div>

              <draggable
                class="sisalto"
                v-bind="tavoitteetOptions"
                tag="div"
                v-model="data.perusteenOppiaineenVlk.tavoitteet">
                  <div class="tavoite d-flex" :class="{'valittu': tavoite.valittu}"
                    v-for="(tavoite, index) in tavoitteet" :key="'tavoite'+index">
                    <fas icon="raahaus" class="raahaus"/>
                    <ep-collapse class="flex-grow-1" ref="sisaltocollapse" :border-bottom="false" :border-top="false" >
                      <template v-slot:header><h4 v-html="$kaanna(tavoite.tavoite)"></h4></template>
                      <div class="row">
                        <div class="col-7">
                          <div class="sisaltoalue" v-for="(sisaltoalue, index) in tavoite.sisaltoalueet" :key="'sisaltoalue'+index">
                            {{$kaanna(data.sisaltoalueetMap[sisaltoalue].nimi)}}
                          </div>
                        </div>

                        <div class="col-5 align-self-end text-right kohdealueet">
                          <div class="kohdealue" v-for="(kohdealue, index) in tavoite.kohdealueet" :key="'kohdealue'+index">
                            <span :style="kohdealue.vari"><fas icon="circle"/></span>
                            {{$kaanna(kohdealue.nimi)}}
                          </div>
                        </div>
                      </div>
                    </ep-collapse>
                  </div>
              </draggable>

            </b-col>

            <b-col cols="6">
              <h3> {{$t('vuosiluokat')}}</h3>

              <div class="vuosiluokka" v-for="(vuosiluokka, index) in data.vuosiluokat" :key="'vuosiluokka'+index">

                <div class="d-flex justify-content-between align-items-center otsikko">
                  <h4 class="flex-grow">{{$t('vuosiluokka')}} {{$t(vuosiluokka.vuosiluokka)}}</h4>
                  <div class="text-right">
                    <ep-button class="tuokaikki" variant="link" icon="plus-circle" @click="lisaaKaikkiTavoitteet(vuosiluokka)">{{$t('tuo-kaikki')}}</ep-button>
                    <ep-button :disabled="vuosiluokka.tavoitteet.length === 0"
                      variant="link" icon="roskalaatikko" @click="poistaKaikkiTavoitteet(vuosiluokka)">{{$t('tyhjenna')}}</ep-button>
                  </div>
                </div>

                <draggable
                  class="d-flex flex-wrap sisalto"
                  :class="{'tyhja': vuosiluokka.tavoitteet.length === 0}"
                  v-bind="defaultOptions"
                  tag="div"
                  v-model="vuosiluokka.tavoitteet">
                    <div v-if="vuosiluokka.tavoitteet.length === 0" class="tyhja">
                      {{$t('lisaa-tavoitteet-tahan')}}
                    </div>
                    <div class="tavoite" v-for="(tavoite, index) in vuosiluokka.tavoitteet" :key="'vlktavoite'+index" @click="poistaTavoite(vuosiluokka, tavoite)">
                      <div class="roskalaatikko">
                        <fas icon="roskalaatikko" />
                      </div>
                      <v-clamp class="teksti" autoresize :max-lines="4">{{$kaanna(tavoite.tavoite).replace(/<\/?[^>]+(>|$)/g, '')}}" /></v-clamp>
                    </div>
                </draggable>
              </div>

            </b-col>

          </b-row>
        </b-container>

      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { VuosiluokkakokonaisuusStore } from '@/stores/vuosiluokkakokonaisuusStore';
import VuosiluokkakokonaisuusSisaltoTeksti from '../VuosiluokkakokonaisuusSisaltoTeksti.vue';
import { VuosiluokkaistaminenStore } from '@/stores/vuosiluokkaistaminenStore';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import draggable from 'vuedraggable';
import VClamp from 'vue-clamp';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';

@Component({
  components: {
    EpEditointi,
    VuosiluokkakokonaisuusSisaltoTeksti,
    EpButton,
    draggable,
    VClamp,
    EpCollapse,
  },
})
export default class RoutePerusopetusOppiaineVuosiluokkaistaminen extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;
  private avaaSulje: boolean = true;
  private kohdealueVarit = ['#99B3F1', '#9BDCFF', '#B2B2B2', '#002D99', '#FFD900', '#E60895', '#C126B8', '#575757', '#575757', '#575757',
    '#2e3192', '#8283be', '#663300', '#a38566', '#666600', '#a3a366'];

  async init() {
    this.editointiStore = new EditointiStore(new VuosiluokkaistaminenStore(
      this.opsId, _.toNumber(this.$route.params.vlkId), _.toNumber(this.$route.params.oppiaineId), this));
  }

  get tavoitteetOptions() {
    return {
      ...this.defaultOptions,
      group: {
        ...this.defaultOptions.group,
        pull: 'clone',
        put: false,
        revertClone: true,
      },
    };
  }

  get defaultOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      group: {
        name: 'tavoitteet',
      },
      disabled: false,
      forceFallback: true,
    };
  }

  lisaaKaikkiTavoitteet(vuosiluokka) {
    vuosiluokka.tavoitteet = this.editointiStore?.data.value.perusteenOppiaineenVlk.tavoitteet;
  }

  poistaKaikkiTavoitteet(vuosiluokka) {
    vuosiluokka.tavoitteet = [];
  }

  poistaTavoite(vuosiluokka, poistettavaTavoite) {
    vuosiluokka.tavoitteet = _.filter(vuosiluokka.tavoitteet, tavoite => tavoite.tunniste !== poistettavaTavoite.tunniste);
  }

  suljeAvaaKaikki() {
    this.avaaSulje = !this.avaaSulje;
    _.forEach(this.$refs.sisaltocollapse, (collapse: any) => {
      collapse.toggle(this.avaaSulje);
    });
  }

  get valitutTavoitteet() {
    return _.chain(this.editointiStore?.data.value.vuosiluokat)
      .map('tavoitteet')
      .flatten()
      .map('tunniste')
      .value();
  }

  get tavoitteet() {
    return _.map(this.editointiStore?.data.value.perusteenOppiaineenVlk.tavoitteet, tavoite => {
      return {
        ...tavoite,
        valittu: _.includes(this.valitutTavoitteet, tavoite.tunniste),
        kohdealueet: _.map(tavoite.kohdealueet, kohdealue => {
          return {
            ...kohdealue,
            vari: 'color: ' + this.seuraavaKohdealueVari(),
          };
        }),
      };
    });
  }

  seuraavaKohdealueVari() {
    const kohdealueVari = _.head(this.kohdealueVarit);
    _.pull(this.kohdealueVarit, kohdealueVari);

    return kohdealueVari;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .vuosiluokkaistaminen {
    padding-top: 15px;
    background-color: $gray-lighten-5;
    padding-left: 30px;

    .tavoitesisallot {

      ::v-deep .btn {
          font-size: 0.8rem;
        }

      .sisalto {
        background-color: $white;
        padding: 10px;

        .tavoite {
          border: 1px solid $gray-lighten-3;
          width: 100%;
          margin: 0px 0px 20px 0px;
          padding: 10px;
          font-size: 0.8rem;

          &.valittu {
            background-color: $blue-lighten-7;
          }

          .raahaus {
            margin-top:3px;
            color: $gray-lighten-1;
          }

        }

        .kohdealueet {
          font-size: 0.7rem;
        }

        ::v-deep .ep-collapse, ::v-deep .ep-collapse .header {
          margin: 0;
          padding: 0;
        }
      }
    }

    .vuosiluokka {
      width: 100%;
      background-color: $white;
      margin: 15px 0px;

      .otsikko {
        border-color: $gray-lighten-3;
        border-width: 1px;
        border-bottom-width: 0px;
        border-style: solid;
        margin: 0px;
        padding: 5px 10px 5px 10px;

        h4 {
          margin: 0px;
        }

        .tuokaikki {
          ::v-deep .btn-link .teksti {
            color: $black;
          }
        }
      }

      .sisalto {
        border-style: solid;
        border-width: 1px;
        border-color: $gray-lighten-3;

        &.tyhja {
          border-style: dashed;
          color: $gray-lighten-2;
          height: 112px;
          text-align: center;
          width: 100%;
        }

        .tyhja {
          position: absolute;
          padding-top: 40px;
          padding-left: 30%;
        }

        .tavoite {
          border-color: $gray-lighten-3;
          border-style: solid;
          border-width: 1px;
          font-size: 0.8rem;
          margin: 5px;
          padding: 10px;
          height: 100px;
          width: 100px;
          overflow: hidden;

          .roskalaatikko {
            display: inline-block;
            position: relative;
            height: 20x;
            left: 70px;
            color: $blue-lighten-5;

            svg {
              display:none;
            }
          }

          .teksti {
            position: relative;
            top: -20px;
          }
        }
      }

      .tavoite:hover {
        cursor: pointer;

        .teksti {
          opacity: 0.3;
        }

        .roskalaatikko svg {
          display: inline-block;
        }
      }
    }

  }

  ::v-deep .editointikontrolli .sisalto {
    padding: 0;
    margin: 0;
  }

  ::v-deep .container {
    margin-left: 0;
    margin-right: 0;
    max-width: 100%;
  }

</style>
