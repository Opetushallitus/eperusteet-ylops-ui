<template>
<div>
  <ep-button v-b-modal.epsisaltomodal>
    <fas class="mr-2" icon="plussa">
    </fas>
    <span>{{ $t('lisaa-sisalto') }}</span>
  </ep-button>
  <b-modal ref="modal" id="epsisaltomodal" size="lg" title="testi" @show="reset()">
    <template slot="modal-title">
      {{ $t('lisaa-sisalto') }}
    </template>
    <template slot="modal-footer">
      <div v-if="step === 0">
        <ep-button class="mr-2" @click="next()">{{ $t('seuraava') }}</ep-button>
        <ep-button @click="hide()">{{ $t('peruuta') }}</ep-button>
      </div>
      <div v-if="step >= 1">
        <ep-button class="mr-2" :disabled="$v.$invalid" @click="tallenna()" :show-spinner="isSaving">{{ $t('tallenna') }}</ep-button>
        <ep-button @click="hide()">{{ $t('peruuta') }}</ep-button>
      </div>
    </template>
    <div class="steps">
      <ep-steps :value="steps" :step="step" />
    </div>
    <div class="vaihe" v-if="step === 0">
      <ep-form-content name="valitse-sisallon-tyyppi">
        <ep-select help="valitse-sisallon-tyyppi" v-model="sisallonTyyppi" :is-editing="true" :items="sisallonTyypit">
          <template #default="{ item }">
            <span>{{ $t('sisalto-' + item) }}</span>
          </template>
        </ep-select>
      </ep-form-content>
    </div>
    <div class="vaihe" v-if="step === 1">
      <ep-form-content name="sisalto-nimi">
        <ep-input id="sisalto-nimi" v-model="uusi.nimi" help="sisalto-nimi-ohje" :validation="$v.uusi.nimi" :is-editing="true" />
      </ep-form-content>
      <ep-form-content name="oppiaineet" v-if="sisallonTyyppi === 'opintojakso'">
        <ep-oppiaine-selector v-model="oppiainekoodit" :ops-id="$route.params.id" />
      </ep-form-content>
    </div>
  </b-modal>
</div>
</template>

<script lang="ts">
import { Prop, Component, Mixins } from 'vue-property-decorator';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpSteps from '@/components/EpSteps/EpSteps.vue';

import EpValidation from '@/mixins/EpValidation';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import _ from 'lodash';
import EpParams from '@/mixins/EpParams';
import { opintojaksoLuontiValidator } from '@/validators/opintojakso';
import { oppiaineLuontiValidator } from '@/validators/oppiaineet';
import { tekstikappaleLuontiValidator } from '@/validators/tekstikappaleet';
import { PerusteCache } from '@/stores/peruste';
import { createLogger } from '@shared/utils/logger';

const logger = createLogger('SisaltoModaali');

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
export default class EpSisaltoModaali extends Mixins(EpValidation, EpParams, EpOpsComponent) {
  @Prop({
    default: null,
  })
  private cache!: PerusteCache;

  private isSaving = false;

  private step = 0;

  private uusi: any = {
    nimi: {},
  };

  private sisallonTyyppi: string | null = null;

  private oppiainekoodit: string[] = [];

  get validationConfig() {
    if (this.step === 1) {
      switch (this.sisallonTyyppi) {
      case 'tekstikappale': return { uusi: tekstikappaleLuontiValidator() };
      case 'opintojakso': return { uusi: opintojaksoLuontiValidator() };
      case 'oppiaine': return { uusi: oppiaineLuontiValidator() };
      }
    }
    return {};
  }

  async reset() {
    this.step = 0;
    this.sisallonTyyppi = null;
    this.oppiainekoodit = [];
    this.uusi = {
      nimi: {},
    };

    if (this.params.oppiaineId) {
      const oppiaine = await this.cache.getOppiaine(this.params.oppiaineId);
      if (oppiaine && oppiaine.koodi) {
        this.uusi.oppiaineet = [{
          koodi: oppiaine.koodi.uri,
        }];
      }
    }
  }

  get sisallonTyypit() {
    return [
      'tekstikappale',
      'opintojakso',
      'oppiaine',
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
    try {
      this.isSaving = true;
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
      case 'oppiaine':
        this.navigateTo('paikallinenOppiaine', {
          paikallinenOppiaineId: (await this.addOppiaine()).id,
        });
        break;
      }
      this.hide();
    }
    catch (err) {
      logger.log(err);
    }
    finally {
      this.isSaving = false;
    }
  }

  next() {
    if (this.step < this.steps.length - 1) {
      this.step += 1;
    }
  }

  hide() {
    (this.$refs.modal as any).hide();
  }

  async addTekstikappale() {
    return this.store.addTeksti({
      tekstiKappale: {
        ...this.uusi,
      },
    });
  }

  get mappedOppiaineet() {
    return _.map(this.oppiainekoodit, koodi => ({ koodi }));
  }

  async addOpintojakso() {
    return this.store.addOpintojakso({
      ...this.uusi,
      oppiaineet: this.mappedOppiaineet,
    });
  }

  async addOppiaine() {
    return this.store.addOppiaine({
      ...this.uusi,
      oppiaineet: this.mappedOppiaineet,
    });
  }
}

</script>

<style scoped lang="scss">

.vaihe {
  margin-top: 30px;
}
</style>
