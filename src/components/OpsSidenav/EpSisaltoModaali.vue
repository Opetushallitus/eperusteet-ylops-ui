<template lang="pug">
div
  ep-button(v-b-modal.epsisaltomodal)
    fas.mr-2(icon="plus")
    span {{ $t('lisaa-sisalto') }}

  b-modal(
    ref="modal",
    id="epsisaltomodal",
    size="lg"
    title="testi",
    @show="reset()")
    template(slot="modal-header")
      h2 {{ $t('lisaa-sisalto') }}

    template(slot="modal-footer")
      div(v-if="step === 0")
        ep-button.mr-2(@click="next()") {{ $t('seuraava') }}
        ep-button(@click="hide()") {{ $t('peruuta') }}
      div(v-if="step >= 1")
        ep-button.mr-2(:disabled="$v.$invalid", @click="tallenna()") {{ $t('tallenna') }}
        ep-button(@click="hide()") {{ $t('peruuta') }}

    .steps
      ep-steps(:value="steps", :step="step")

    .vaihe(v-if="step === 0")
      ep-form-content(name="valitse-sisallon-tyyppi")
        ep-select(
          help="valitse-sisallon-tyyppi",
          v-model="sisallonTyyppi",
          :is-editing="true",
          :items="sisallonTyypit")
          template(slot-scope="{ item }")
            span {{ $t('sisalto-' + item) }}

    .vaihe(v-if="step === 1")
      ep-form-content(name="sisalto-nimi")
        ep-input(
          id="sisalto-nimi",
          v-model="uusi.nimi",
          type="text",
          help="sisalto-nimi-ohje",
          :validation="$v.uusi.nimi",
          :is-editing="true")

      ep-form-content(name="oppiaineet", v-if="sisallonTyyppi === 'opintojakso'")
        ep-oppiaine-selector(
          v-model="uusi.oppiaineet",
          :ops-id="$route.params.id")

</template>

<script lang="ts">
import { Watch, Prop, Component, Mixins } from 'vue-property-decorator';
import {
  EpButton,
  EpFormContent,
  EpInput,
  EpSelect,
  EpSpinner,
  EpOppiaineSelector,
  EpSteps,
} from '@/components';

import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import EpValidation from '@/mixins/EpValidation';
import EpParams from '@/mixins/EpParams';
import { opintojaksoLuontiValidator } from '@/validators/opintojakso';
import { tekstikappaleLuontiValidator } from '@/validators/tekstikappaleet';
import { PerusteCache } from '@/stores/peruste';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpInput,
    EpSelect,
    EpOppiaineSelector,
    EpSteps,
  },
})
export default class EpSisaltoModaali extends Mixins(EpValidation, EpParams) {
  @Prop({ default: null })
  private cache!: PerusteCache;

  private step = 0;
  private uusi: any = {
    nimi: {},
  };
  private sisallonTyyppi: string | null = null;

  get validationConfig() {
    if (this.step === 1) {
      switch (this.sisallonTyyppi) {
      case 'tekstikappale': return { uusi: tekstikappaleLuontiValidator() };
      case 'opintojakso': return { uusi: opintojaksoLuontiValidator() };
      }
    }
    return {};
  }

  async reset() {
    this.step = 0;
    this.sisallonTyyppi = null;
    this.uusi = {
      nimi: {},
    };

    if (this.params.oppiaineId) {
      const oppiaine = await this.cache.getOppiaine(this.params.oppiaineId);
      if (oppiaine && oppiaine.koodi) {
        this.uusi.oppiaineet = [oppiaine.koodi.uri];
      }
    }
  }

  get sisallonTyypit() {
    return [
      'tekstikappale',
      'opintojakso',
    ];
  }

  get steps() {
    return [{
      name: 'wizard-valitse-sisalto-tyyppi',
    }, {
      name: 'wizard-valitse-sisallot',
    }];
  }

  async tallenna() {
    switch (this.sisallonTyyppi) {
    case 'tekstikappale':
      this.navigateTo('tekstikappale', {
        osaId: (await this.addTekstikappale()).id,
      });
      break;
    case 'opintojakso':
      this.navigateTo('opintojakso', {
        opintojaksoId: (await this.addOpintojakso()).id,
      });
      break;
    }
    this.hide();
  }

  next() {
    if (this.step < this.steps.length - 1) {
      this.step += 1;
    }
  }

  hide() {
    (this.$refs.modal as any).hide();
  }

  private async addTekstikappale() {
    return Opetussuunnitelma.addTeksti({
      tekstiKappale: {
        ...this.uusi,
      },
    });
  }

  private async addOpintojakso() {
    return Opetussuunnitelma.addOpintojakso({
      ...this.uusi,
    });
  }
}

</script>

<style scoped lang="scss">

.vaihe {
  margin-top: 30px;
}
</style>
