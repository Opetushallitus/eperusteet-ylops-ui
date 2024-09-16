<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi
      :store="editointiStore"
      :confirmCopy="false">
      <template v-slot:kopioi-teksti>{{ $t('muokkaa') }}</template>
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.vlk.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, supportData }">
        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.tehtava"
                                    :pohjaObject="supportData.pohjanVlk.tehtava"
                                    :vlkObject="data.vlk.tehtava"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />

        <template v-if="data.perusteenVlk.vapaatTekstit">
          <ep-collapse class="mt-4"
                       tyyppi="perusteteksti"
                       :border-bottom="false"
                       :border-top="true"
                       :expanded-by-default="true"
                       v-for="(vapaateksti, index) in perusteenVlkVapaatTekstit"
                       :key="'perustevapaateksti' + index">

            <template v-slot:header><h4>{{$kaanna(vapaateksti.nimi)}}</h4></template>
            <span v-html="$kaanna(vapaateksti.teksti)"></span>

            <h4 class="mt-4">{{ $t('paikallinen-teksti') }}</h4>
            <EpButton v-if="isEditing && !vapaateksti.hasPaikallinenTarkennus"
                      icon="add"
                      @click="lisaaPaikallinenTarkennus(data.vlk, vapaateksti.id)"
                      variant="link"
                      class="mb-1">
              {{ $t('lisaa-paikallinen-tarkennus') }}
            </EpButton>
            <EpAlert v-if="!isEditing && !vapaateksti.hasPaikallinenTarkennus" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />

            <div v-for="(teksti, index) in data.vlk.vapaatTekstit" :key="'teksti'+index">
              <div v-if="vapaateksti.id === teksti.perusteenVapaaTekstiId">
                <EpContent v-model="teksti.paikallinenTarkennus"
                           layout="normal"
                           :is-editable="isEditing"></EpContent>

                <EpButton v-if="isEditing"
                          @click="poistaPaikallinenTarkennus(data.vlk, vapaateksti.id)"
                          variant="link"
                          icon="delete">
                  {{ $t('poista-paikallinen-tarkennus') }}
                </EpButton>
              </div>

            </div>
          </ep-collapse>
        </template>

        <hr/>
        <h2>{{$t('siirtymavaiheet')}}</h2>

        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.siirtymaEdellisesta"
                                    :pohjaObject="supportData.pohjanVlk.siirtymaEdellisesta"
                                    :vlkObject="data.vlk.siirtymaEdellisesta"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />
        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.siirtymaSeuraavaan"
                                    :pohjaObject="supportData.pohjanVlk.siirtymaSeuraavaan"
                                    :vlkObject="data.vlk.siirtymaSeuraavaan"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />

        <hr/>
        <h2>{{$t('laaja-alainen-osaaminen')}}</h2>

        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.laajaalainenOsaaminen" :isEditing="false" />

        <hr/>
        <h2>{{$t('laaja-alaisen-osaamisen-alueet')}}</h2>

        <div v-for="(laajaalainen, index) in data.laajaalaiset" :key="index" class="mb-5">
          <h3>{{ $kaanna(laajaalainen.nimi) }}</h3>

          <ep-collapse tyyppi="perusteteksti" :border-bottom="false" :border-top="false" chevronLocation="left" :usePadding="false" v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao" class="mb-4">
            <template #header>
              <div class="link-style">{{ $t('laaja-alaisen-osaamisen-alueen-yleiskuvaus')}}</div>
            </template>

            <EpToggle class="mb-2" v-if="isEditing" v-model="data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao">{{$t('nayta-laaja-alaisen-osaamisen-alueen-yleiskuvaus')}}</EpToggle>
            <ep-content v-model="laajaalainen.kuvaus" layout="normal" v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao" />

          </ep-collapse>

          <ep-collapse tyyppi="perusteteksti" :border-bottom="false" :border-top="false" chevronLocation="left" :usePadding="false" v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao" class="mb-4">
            <template #header>
              <div class="link-style">{{ $t('laaja-alaisen-osaamisen-alueen-vuosiluokkakokonaisuuden-kuvaus')}}</div>
            </template>

            <EpToggle class="mb-2" v-if="isEditing" v-model="data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao">{{$t('nayta-laaja-alaisen-osaamisen-alueen-vuosiluokkakokonaisuuden-kuvaus')}}</EpToggle>
            <ep-content v-if="perusteenVlkByLaoTunniste[laajaalainen.tunniste] && (isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao)"
              v-model="perusteenVlkByLaoTunniste[laajaalainen.tunniste].kuvaus" layout="normal"/>
          </ep-collapse>

          <h4>{{ $t('paikallinen-teksti') }}</h4>
          <ep-content v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].kuvaus" v-model="data.vlk.laajaalaisetosaamiset[index].kuvaus" layout="normal" :is-editable="isEditing"/>
          <ep-alert v-if="!isEditing && !data.vlk.laajaalaisetosaamiset[index].kuvaus" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />

        </div>

        <vuosiluokka-sisalto-teksti v-for="(laajaalainen, index) in data.laajaalaiset"
                                    :key="index"
                                    :perusteObject="laajaalainen"
                                    :pohjaObject="supportData.pohjanLaajaAlaisetOsaamiset[data.vlk.laajaalaisetosaamiset[index]['_laajaalainenosaaminen']]"
                                    :vlkObject="data.vlk.laajaalaisetosaamiset[index]"
                                    :isEditing="isEditing"
                                    :id="'laajaalainen'+laajaalainen.tunniste"
                                    :peruste-teksti-avattu="true"
                                    otsikko="nimi"
                                    teksti="kuvaus" />
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
import VuosiluokkaSisaltoTeksti from './VuosiluokkaSisaltoTeksti.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpCollapse,
    EpContent,
    EpButton,
    EpAlert,
    EpEditointi,
    VuosiluokkaSisaltoTeksti,
  },
})
export default class RouteVuosiluokkakokonaisuus extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;

  async init() {
    const scrollId = this.$route.hash ? 'laajaalainen' + this.$route.hash.replace('#', '') : null;
    this.editointiStore = new EditointiStore(new VuosiluokkakokonaisuusStore(this.opsId, _.toNumber(this.$route.params.vlkId), scrollId, this, this.muokkaa));
  }

  async resetOps() {
    await this.store.init();
  }

  get vlk() {
    return this.editointiStore?.data.value.vlk;
  }

  get perusteenVlkVapaatTekstit() {
    return _.map(this.editointiStore?.data.value.perusteenVlk.vapaatTekstit || {}, vlkVt => {
      return {
        ...vlkVt,
        hasPaikallinenTarkennus: _.some(this.vlk.vapaatTekstit, vt => vlkVt.id === vt.perusteenVapaaTekstiId),
      };
    });
  }

  lisaaPaikallinenTarkennus(vlk, id) {
    if (!vlk.vapaatTekstit) {
      vlk.vapaatTekstit = [];
    }
    vlk.vapaatTekstit.push(
      { perusteenVapaaTekstiId: id,
        paikallinenTarkennus: Kielet.haeLokalisoituOlio(''),
      });
  }

  poistaPaikallinenTarkennus(vlk, vapaatekstiId) {
    vlk.vapaatTekstit = _.filter(vlk.vapaatTekstit, teksti => teksti.perusteenVapaaTekstiId !== vapaatekstiId);
  }

  get perusteenVlkByLaoTunniste() {
    return _.keyBy(this.editointiStore?.data.value.perusteenVlk.laajaalaisetosaamiset, '_laajaalainenosaaminen');
  }

  get muokkaa() {
    return _.has(this.$route.query, 'muokkaa');
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
