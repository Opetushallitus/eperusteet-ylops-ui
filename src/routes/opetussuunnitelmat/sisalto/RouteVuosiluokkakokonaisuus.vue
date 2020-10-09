<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" label-copy-confirm="vuosiluokkakokonaisuus-kopiointi-varmistus">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.vlk.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing }">
        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.tehtava"
                                    :vlkObject="data.vlk.tehtava"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />

        <hr/>
        <h2>{{$t('siirtymavaiheet')}}</h2>

        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.siirtymaEdellisesta"
                                    :vlkObject="data.vlk.siirtymaEdellisesta"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />
        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.siirtymaSeuraavaan"
                                    :vlkObject="data.vlk.siirtymaSeuraavaan"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />

        <hr/>
        <h2>{{$t('laaja-alainen-osaaminen')}}</h2>

        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.laajaalainenOsaaminen" :isEditing="false" />

        <hr/>
        <h2>{{$t('laaja-alaisen-osaamisen-alueet')}}</h2>

        <vuosiluokka-sisalto-teksti v-for="(laajaalainen, index) in data.laajaalaiset"
                                    :key="index"
                                    :perusteObject="laajaalainen"
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

@Component({
  components: {
    EpEditointi,
    VuosiluokkaSisaltoTeksti,
  },
})
export default class RouteVuosiluokkakokonaisuus extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;

  async init() {
    const scrollId = this.$route.hash ? 'laajaalainen' + this.$route.hash.replace('#', '') : null;
    this.editointiStore = new EditointiStore(new VuosiluokkakokonaisuusStore(this.opsId, _.toNumber(this.$route.params.vlkId), scrollId, this));
  }

  async resetOps() {
    await this.store.init();
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
