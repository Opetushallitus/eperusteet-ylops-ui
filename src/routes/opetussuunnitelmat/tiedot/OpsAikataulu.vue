<template>
  <div class="content">

    <div class="row">
      <div class="col">
        <h3>{{$t('aikataulu')}}</h3>
      </div>
      <div class="col text-right">
        <ep-button
          v-b-modal.aikataulutavoitelisays
          variant="outline-primary"
          icon="plussa">
          {{ $t('lisaa-tavoite') }}
        </ep-button>
      </div>
    </div>

    <ep-spinner v-if="!aikataulut"></ep-spinner>

    <div v-else>

      <div v-if="aikataulut.length === 0" class="text-center">
        <ep-button v-b-modal.aikataulukayttoonotto variant="link" buttonClass="text-decoration-none">
          <span>{{ $t('opetussuunnitelma-aikataulu-kayttoonotto') }}</span>
        </ep-button>

      </div>

      <div v-else class="pohja">
        <div class="kulunut-aika" style="width: 50%">&nbsp;</div>

        <div class="aikataulu d-inline-block">&nbsp;</div>
        <div class="aikataulu d-inline-block" style="left: 50%;">&nbsp;</div>

      </div>

      <div>
        {{(luomisAikataulu)}}
      </div>

    </div>


    <b-modal ref="aikataulukayttoonottoModal" id="aikataulukayttoonotto" size="lg" @hidden="clear" @ok="aikataulunLisays">
      <ep-form-content name="opetussuunnitelma-aikataulu-kayttoonotto-julkaisupaiva">
          <ep-datepicker v-model="tavoitepaiva" :is-editing="true" :hide-header="true" :validation="$v.paiva">
          </ep-datepicker>
      </ep-form-content>

      <template v-slot:modal-cancel>
        {{ $t('peruuta')}}
      </template>
      <template v-slot:modal-ok>
        {{ $t('opetussuunnitelma-aikataulu-kayttoonotto')}}
      </template>

    </b-modal>

    <b-modal ref="aikataulutavoitelisaysModal" id="aikataulutavoitelisays" size="lg" @hidden="clear" @ok="aikataulunLisays">

      <ep-form-content name="tavoitteen-selite">
        <ep-field v-model="tavoiteteksti" :is-editing="true">
        </ep-field>
      </ep-form-content>

      <ep-form-content name="tavoitteen-paivamaara">
        <ep-datepicker v-model="tavoitepaiva" :is-editing="true" :hide-header="true" :validation="$v.paiva">
        </ep-datepicker>
      </ep-form-content>

      <template v-slot:modal-cancel>
        {{ $t('peruuta')}}
      </template>
      <template v-slot:modal-ok>
        {{ $t('lisaa-tavoite')}}
      </template>

    </b-modal>

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
import EpField from'@shared/components/forms/EpField.vue';
import { validationMixin } from 'vuelidate';

@Component({
  components:{
    EpSpinner,
    EpButton,
    EpDatepicker,
    EpFormContent,
    EpField,
  },
  validations() {
    return {
      paiva: {
        ...(this as any).validator,
      },
    };
  }
})
export default class OpsAikataulu extends Mixins(validationMixin) {
  @Prop({required: true})
  private ops!: OpetussuunnitelmaKevytDto;

  private aikataulut: OpetussuunnitelmanAikatauluDto[] | null = null;
  private tavoitepaiva: Date | null = null;
  private tavoiteteksti: LokalisoituTekstiDto = {};

  private aikataulutapahtuma = {
    luominen: 'luominen',
    julkaisu: 'julkaisu',
    tavoite: 'tavoite',
  }

  async mounted() {
    this.aikataulut = (await Aikataulu.getAikataulu(this.ops.id!) as any).data;
  }

  get validator() {
    return true;
  }

  get luomisAikataulu() {
    return _.filter(this.aikataulut, (aikataulu) => aikataulu.tapahtuma === this.aikataulutapahtuma.luominen);
  }

  get julkaisuAikataulu() {
    return _.filter(this.aikataulut, (aikataulu) => aikataulu.tapahtuma === this.aikataulutapahtuma.julkaisu);
  }

  async aikataulunLisays() {

    if (_.isEmpty(this.aikataulut)) {
      this.lisaaTapahtumaPaiva(this.aikataulutapahtuma.luominen, this.ops.luotu, this.tavoiteteksti);
      this.lisaaTapahtumaPaiva(this.aikataulutapahtuma.julkaisu, this.tavoitepaiva, this.tavoiteteksti);
    }
    else {
      this.lisaaTapahtumaPaiva(this.aikataulutapahtuma.tavoite, this.tavoitepaiva, this.tavoiteteksti);
    }

  }

  private async lisaaTapahtumaPaiva(tapahtuma, tapahtumapaiva, tavoiteteksti) {

    const luomisAikataulu = {
      tapahtuma: tapahtuma,
      opetussuunnitelmaId: this.ops.id!,
      tapahtumapaiva: tapahtumapaiva,
      tavoite: tavoiteteksti,
    };

    const lisatty = (await Aikataulu.save(this.ops.id!, (luomisAikataulu as any)) as any).data;

    if (this.aikataulut) {
      this.aikataulut = [
        ...this.aikataulut,
        lisatty,
      ];
    }

  }

  clear() {
    this.tavoitepaiva = null;
    this.tavoiteteksti = {};
  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .pohja {
    margin: 20px;
    background-color: $gray-lighten-3;
    border-radius: 15px;
    height: 15px;

    .kulunut-aika {
      background-color: $green-lighten-2;
      border-radius: 15px;
      height: 15px;
      position: absolute;
    }

    .aikataulu {
      height: 15px;
      width: 15px;
      border-radius: 30px;
      background-color: $blue;
      position: relative;
    }

  }

</style>
