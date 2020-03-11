<template>
  <div class="content">

    <div class="row">
      <div class="col">
        <h2>{{$t('aikataulu')}}</h2>
      </div>
      <div class="col text-right">
        <ep-aikataulu-modal ref="aikataulumodal" :rootModel="ops" :aikataulut="aikataulut" @tallenna="tallenna"
        v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'opetussuunnitelma' }">
          <template v-slot:selite>
            <p>{{ $t('aikataulu-modal-selite')}}</p>
          </template>
        </ep-aikataulu-modal>
      </div>
    </div>

    <ep-spinner v-if="!aikataulut"></ep-spinner>

    <div v-else>

      <div v-if="aikataulut.length === 0" class="text-center">
        <ep-button @click="otaAikatauluKayttoon" buttonClass="pl-5 pr-5">
          <span>{{ $t('ota-kayttoon') }}</span>
        </ep-button>
      </div>

      <div v-else>
        <ep-aikataulu :aikataulut ="aikataulut" />
      </div>

    </div>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { OpetussuunnitelmaKevytDto } from '@shared/api/ylops';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import { AikatauluStore } from '@/stores/aikataulu';
import { success } from '@/utils/notifications';

@Component({
  components:{
    EpSpinner,
    EpButton,
    EpAikataulu,
    EpAikatauluModal,
  },
})
export default class OpsAikataulu extends Vue {

  @Prop({required: true})
  private ops!: OpetussuunnitelmaKevytDto;

  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  async mounted() {
    await this.aikatauluStore.update();
  }

  get aikataulut() {
    return this.aikatauluStore.aikataulut;
  }

  otaAikatauluKayttoon() {
    (this as any).$refs.aikataulumodal.openModal();
  }

  async tallenna(aikataulut) {
    await this.aikatauluStore.saveAikataulut(aikataulut);
    success('aikataulu-tallennettu');
  }

}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .pohja {
    margin: 10px 0px;
    background-color: $gray-lighten-8;
    border-radius: 15px;
    height: 15px;
    position: relative;

    .kulunut-aika {
      background-color: $green-lighten-3;
      border-radius: 15px;
      height: 15px;
      position: absolute;
    }

    .aikataulu {
      height: 15px;
      width: 15px;
      border-radius: 30px;
      position: absolute;

      &.tavoite {
        background-color: $blue;
      }

      &.julkaisu {
        background-color: $blue-lighten-2;
      }
    }

  }

  .alainfo {
    position: relative;

    .julkaisu {
      position: absolute;
    }
  }

  .luomispaiva {
    border-left: 1px solid $gray-lighten-3;
    padding-left: 5px;
  }

  .julkaisupaiva {
    border-right: 1px solid $gray-lighten-3;
    padding-right: 5px;
  }

  .paiva-alatieto {
    color: $gray-lighten-1;
  }

</style>
