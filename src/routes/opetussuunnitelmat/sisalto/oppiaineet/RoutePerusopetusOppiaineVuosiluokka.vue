<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :preModify="aloitaMuokkaus" :postSave="tallennettu">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.oppiaine.nimi) }}, {{ $t('vuosiluokka') }} {{ $t(data.vuosiluokka.vuosiluokka) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing }">

        <b-tabs v-model="tabIndex">
          <b-tab :title="$t('tavoitteet')">

            <ep-collapse ref="tavoitecollapse" class="tavoite" v-for="(tavoite, index) in data.perusteenTavoitteet" :key="'tavoite'+index" :border-bottom="false" tyyppi="perusopetus-vuosiluokka-tavoite">
              <template v-slot:header>
                <h3 v-html="$kaanna(tavoite.tavoite)"></h3>
              </template>

              <div v-if="tavoite.tavoitteistaJohdetutOppimisenTavoitteet">
                <h4>{{ $t('tavoitteista-johdetut-oppimisen-tavoitteet') }}</h4>
                <span v-html="$kaanna(tavoite.tavoitteistaJohdetutOppimisenTavoitteet)"></span>
              </div>

              <div class="inner-collapse mb-4" v-if="tavoite.sisaltoalueet.length > 0">
                <h4>{{ $t('sisaltoalueet') }}</h4>
                <ep-collapse ref="sisaltoaluecollapse" class="sisaltoalue" v-for="(sisaltoalue, index) in tavoite.sisaltoalueet" :key="'sisaltoalue'+index"
                  :borderBottom="false" :expanded-by-default="false" chevronLocation="left" tyyppi="perusopetus-vuosiluokka-sisaltoalue">
                  <template v-slot:header>
                    <h5 v-html="$kaanna(sisaltoalue.nimi)"></h5>
                  </template>

                  <div class="pl-4 mb-4 sisaltoaluekuvaus">
                    <div v-if="!isEditing">
                      <div v-if="!sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta && !sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus"
                        v-html="$kaanna(sisaltoalue.kuvaus)"></div>
                      <div v-else-if="sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta"
                        v-html="$kaanna(sisaltoalue.vuosiluokanSisaltoalue.omaKuvaus)"></div>
                      <div v-else-if="sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus"
                        v-html="$kaanna(sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus)"></div>
                    </div>

                    <div v-else>
                      <div v-if="!sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus"
                        :class="{'disabled': sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta}"
                        v-html="$kaanna(sisaltoalue.kuvaus)"></div>
                      <div v-else
                        :class="{'disabled': sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta}"
                        v-html="$kaanna(sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus)"></div>

                      <ep-toggle v-model="sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta">
                        {{ $t('kayta-tavoitekohtaista-kuvausta') }}
                      </ep-toggle>
                      <ep-content v-if="sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta"
                                  v-model="sisaltoalue.vuosiluokanSisaltoalue.omaKuvaus"
                                  layout="normal"
                                  :is-editable="isEditing"></ep-content>
                    </div>
                  </div>

                </ep-collapse>
              </div>

              <b-row class="mb-2">
                <b-col class="inner-list" v-if="tavoite.laajaalaisetosaamiset.length > 0">
                  <h4>{{ $t('laaja-alaisen-osaamisen-alueet') }}</h4>
                <ul>
                  <li v-for="(lao, index) in tavoite.laajaalaisetosaamiset" :key="'lao'+index">
                    <router-link :to="{ name:'vuosiluokkakokonaisuus', params: {vlId: $route.params.vlkId}, hash: '#'+lao.tunniste }">
                      <span v-html="$kaanna(lao.nimi)"></span>
                    </router-link>
                  </li>
                </ul>
                </b-col>
                <b-col v-if="tavoite.kohdealueet.length > 0 && tavoite.kohdealueet[0].nimi">
                  <div v-for="(kohdealue, index) in tavoite.kohdealueet" :key="'kohdealue'+index">
                    <ep-order-color-ball class="pr-2" :index="kohdealue.index" v-if="kohdealue.nimi" />
                    <span>{{ $kaanna(kohdealue.nimi) }}</span>
                  </div>
                </b-col>
              </b-row>

              <div class="mb-4" v-if="tavoite.hyvanOsaamisenKuvaus || tavoite.arvioinninKuvaus">
                <h4>{{ $t('arvioinnin-kohde') }}</h4>
                <span v-if="tavoite.hyvanOsaamisenKuvaus" v-html="$kaanna(tavoite.hyvanOsaamisenKuvaus.arvioinninKohde)"></span>
                <span v-else-if="tavoite.arvioinninKuvaus" v-html="$kaanna(tavoite.arvioinninKuvaus)"></span>
              </div>

              <div class="mb-4" v-if="tavoite.arvioinninkohteet && tavoite.arvioinninkohteet.length > 0">
                <h4 class="mb-0 pb-0">{{ $t('arviointi-vuosiluokan-paatteeksi') }}</h4>
                <b-table :items="tavoite.arvioinninkohteet" :fields="arvioinninSarakkeet"/>
              </div>

              <div class="mb-4" v-if="tavoite.vuosiluokanTavoite ">
                <h4>{{ $t('paikallinen-teksti') }}</h4>
                <ep-content v-if="isEditing || tavoite.vuosiluokanTavoite.tavoite" v-model="tavoite.vuosiluokanTavoite.tavoite"
                              layout="normal"
                              :is-editable="isEditing"></ep-content>
                <ep-alert v-if="!isEditing && !tavoite.vuosiluokanTavoite.tavoite" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />
              </div>

            </ep-collapse>

          </b-tab>

          <b-tab :title="$t('keskeiset-sisallot')">

            <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.sisaltoalueinfo" :perusteTekstiAvattu="true" :isEditing="false" />
            <hr/>

            <div v-for="(sisaltoalue, index) in data.perusteenVlk.sisaltoalueet" :key="'keskeinensisalto'+index">
              <vuosiluokka-sisalto-teksti
                :perusteObject="sisaltoalue"
                :perusteTekstiAvattu="true"
                :isEditing="isEditing"
                otsikko="nimi"
                teksti="kuvaus"
                :vlkObject="sisaltoalue.vuosiluokanSisaltoalue">

                <template v-slot:header>
                  <h3>{{ $kaanna(sisaltoalue.nimi) }}
                    <span v-if="sisaltoalue.vuosiluokanSisaltoalue.piilotettu">({{ $t('piilotettu-tavoitteista') }})</span>
                  </h3>
                  <ep-toggle v-model="sisaltoalue.vuosiluokanSisaltoalue.piilotettu" v-if="isEditing">
                    {{ $t('piilota-sisaltoalue') }}
                  </ep-toggle>
                </template>
              </vuosiluokka-sisalto-teksti>
              <hr/>
            </div>

          </b-tab>
        </b-tabs>

      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component, Vue } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import VuosiluokkaSisaltoTeksti from '../VuosiluokkaSisaltoTeksti.vue';
import { PerusopetusoppiaineVuosiluokkaStore } from '@/stores/perusopetusoppiainevuosiluokkaStore';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpOrderColorBall from '@shared/components/EpColorIndicator/EpOrderColorBall.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';

@Component({
  components: {
    EpEditointi,
    VuosiluokkaSisaltoTeksti,
    EpButton,
    EpCollapse,
    EpOrderColorBall,
    EpAlert,
    EpContent,
    EpToggle,
  },
})
export default class RoutePerusopetusOppiaineVuosiluokka extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;
  private tabIndex: number = 0;

  async init() {
    const vuosiluokkakokonaisuus = _.head(_.filter(this.ops.vuosiluokkakokonaisuudet, vlk =>
      vlk.vuosiluokkakokonaisuus?.id === _.toNumber(this.$route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;

    this.editointiStore = new EditointiStore(new PerusopetusoppiaineVuosiluokkaStore(
      this.opsId, _.toNumber(this.$route.params.oppiaineId), vuosiluokkakokonaisuus, _.toNumber(this.$route.params.vlId)));
  }

  get arvioinninSarakkeet() {
    return [{
      key: 'arvosana',
      label: this.$t('osaamistaso'),
      thStyle: { width: '20%' },
      formatter: (value, key, item) => {
        return (this as any).$t('arvosana') + ' ' + value;
      },
    }, {
      key: 'osaamisenKuvaus',
      label: this.$t('kuvaus'),
      formatter: (value, key, item) => {
        return (this as any).$kaanna(value);
      },
    },
    ];
  }

  async aloitaMuokkaus() {
    _.forEach(this.$refs.tavoitecollapse, (collapse: any) => {
      collapse.toggle(true);
    });
    const self = this;
    Vue.nextTick(function() {
      _.forEach(self.$refs.sisaltoaluecollapse, (collapse: any) => {
        collapse.toggle(true);
      });
    });
  }

  async tallennettu() {
    _.forEach(this.$refs.tavoitecollapse, (collapse: any) => {
      collapse.toggle(true);
    });
    const self = this;
    Vue.nextTick(function() {
      _.forEach(self.$refs.sisaltoaluecollapse, (collapse: any) => {
        collapse.toggle(false);
      });
    });
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .tavoite {
    box-shadow: 5px 5px 20px rgba(0, 45, 153, 0.08);
    margin-bottom: 20px;
    padding: 0px 10px;

    .sisaltoalue {

      .sisaltoaluekuvaus{

        .disabled {
          color: $gray-lighten-3;
        }
      }
    }
  }

  .inner-collapse {
    ::v-deep .ep-collapse {
      margin: 0;
      padding: 0;

      .header, h5 {
        margin: 0;
        margin-top: 2px;
      }
    }

    margin-bottom: 1rem;
  }

  .inner-list {
    ul {
      padding-inline-start: 20px;
    }
  }

</style>
