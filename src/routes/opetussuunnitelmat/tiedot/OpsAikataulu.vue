<template>
  <div class="content">

    <div class="row">
      <div class="col">
        <h3>{{$t('aikataulu')}}</h3>
      </div>
      <div class="col text-right">
        <ep-aikataulu-modal ref="aikataulumodal" :aikataulut="aikataulut" />
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

import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import _ from 'lodash';
import { OpetussuunnitelmaKevytDto, OpetussuunnitelmanAikatauluDto, OpetussuunnitelmanAikatauluTapahtuma, LokalisoituTekstiDto } from '@/tyypit';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Aikataulu } from '@/api';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpFormContent from'@shared/components/forms/EpFormContent.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import EpField from'@shared/components/forms/EpField.vue';
import { Kielet } from '@shared/stores/kieli';
import { minLength, required } from 'vuelidate/lib/validators';
import EpValidation from '@/mixins/EpValidation';
import { aikataulutapahtuma } from '@shared/utils/aikataulu';


@Component({
  components:{
    EpSpinner,
    EpButton,
    EpDatepicker,
    EpFormContent,
    EpField,
    EpAikataulu,
    EpAikatauluModal,
  },
})
export default class OpsAikataulu extends Mixins(EpValidation) {
  @Prop({required: true})
  private ops!: OpetussuunnitelmaKevytDto;

  private aikataulut: OpetussuunnitelmanAikatauluDto[] | null = null;
  private aikataulu: OpetussuunnitelmanAikatauluDto = {};

  async mounted() {
    this.aikataulut = (await Aikataulu.getAikataulu(this.ops.id!) as any).data;
  }

  otaAikatauluKayttoon() {
    this.aikataulut = [({
      tapahtuma: aikataulutapahtuma.luominen,
      opetussuunnitelmaId: this.ops.id!,
      tapahtumapaiva: this.ops.luotu,
      tavoite: {},
    }) as any];

    (this as any).$refs['aikataulumodal'].openModal();
  }

  get modalTopic() {
    // if (!this.luomisPaiva) {
    //   return this.$t('opetussuunnitelma-aikataulu-kayttoonotto');
    // }

    // if(!this.aikataulu.id) {
    //   return this.$t('lisaa-tavoite');
    // }

    return this.$t('muokkaa-tavoitetta');
  }

  get modalSaveText() {
    // if (!this.luomisPaiva) {
    //   return this.$t('opetussuunnitelma-aikataulu-kayttoonotto');
    // }

    // if(!this.aikataulu.id) {
    //   return this.$t('lisaa-tavoite');
    // }

    return this.$t('tallenna');
  }

  get luomisAikataulu() {
    return _.filter(this.aikataulut, (aikataulu) => aikataulu.tapahtuma === aikataulutapahtuma.luominen)[0];
  }

  get julkaisuAikataulu() {
    return _.filter(this.aikataulut, (aikataulu) => aikataulu.tapahtuma === aikataulutapahtuma.julkaisu)[0];
  }

  get luomisPaiva() {
    if (this.luomisAikataulu) {
      return this.luomisAikataulu.tapahtumapaiva;
    }
  }

  get julkaisuPaiva() {
    if (this.julkaisuAikataulu) {
      return this.julkaisuAikataulu.tapahtumapaiva;
    }
  }

  get validationConfig() {
    return {
      aikataulu: {
        tapahtumapaiva: {
          required,
        }
      },
    };
  }

  async tallennaAikataulu() {

    if (_.isEmpty(this.aikataulut)) {
      this.lisaaAikataulu(aikataulutapahtuma.luominen, this.ops.luotu, {});
      this.lisaaAikataulu(aikataulutapahtuma.julkaisu, (this.aikataulu as any).tapahtumapaiva, {
        [Kielet.getSisaltoKieli]: this.$t('projektin-suunniteltu-julkaisupaiva')
      });
    }
    else {
      if  (this.aikataulu.id) {
        this.paivitaAikataulu();
      }
      else {
        this.lisaaAikataulu(aikataulutapahtuma.tavoite,  (this.aikataulu as any).tapahtumapaiva,  (this.aikataulu as any).tavoite);
      }
    }

    this.hideModal();
  }

  private async lisaaAikataulu(tapahtuma, tapahtumapaiva, tavoite) {

    const luomisAikataulu = {
      tapahtuma: tapahtuma,
      opetussuunnitelmaId: this.ops.id!,
      tapahtumapaiva: tapahtumapaiva,
      tavoite: tavoite,
    };

    const lisatty = (await Aikataulu.save(this.ops.id!, (luomisAikataulu as any)) as any).data;

    if (this.aikataulut) {
      this.aikataulut = [
        ...this.aikataulut,
        lisatty,
      ];
    }

  }

  private async paivitaAikataulu() {
    const paivitetty = (await Aikataulu.update(this.ops.id!, (this.aikataulu as any)) as any).data;
    this.aikataulut = _.map(this.aikataulut, (aikataulu) => aikataulu.id === paivitetty.id ? paivitetty : aikataulu);
  }

  async poistaAikataulu() {
    (await Aikataulu._delete(this.ops.id!, (this.aikataulu as any)) as any).data;
    this.aikataulut = _.filter(this.aikataulut, (aikataulu) => aikataulu.id !== this.aikataulu.id);
    this.hideModal();
  }

  muokkaaAikataulua(aikataulu) {
    this.aikataulu = aikataulu;
    (this as any).$refs['aikataulutavoitelisaysModal'].show();
  }

  hideModal() {
    (this as any).$refs['aikataulutavoitelisaysModal'].hide();
    this.aikataulu = {};
  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

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
