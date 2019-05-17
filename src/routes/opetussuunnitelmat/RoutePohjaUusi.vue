<template lang="pug">
ep-main-view
  template(slot="icon")
    ep-icon.float-right(icon="luo-uusi")

  template(slot="header")
    h1 {{ $t('uusi-pohja') }}

  div
    ep-form-content(name="pohja-nimi")
      ep-field(
        help="pohja-nimi-ohje",
        v-model="uusi.nimi",
        :validation="$v.uusi.nimi",
        :is-editing="true")

  div(v-if="valittavat.length > 0")
    ep-form-content(name="peruste")
      ep-select(
        help="ops-peruste-ohje",
        v-model="uusi.valittuPeruste",
        :items="valittavat",
        :validation="$v.uusi.valittuPeruste",
        :is-editing="true")
        template(slot-scope="{ item }")
          span {{ $kaanna(item.nimi) }} ({{ item.diaarinumero }})
  ep-spinner(v-else)

  ep-button(
    :disabled="$v.uusi.$invalid",
    @click="luoUusiPeruste",
    :show-spinner="isSaving") {{ $t('luo-pohja') }}

</template>

<script lang="ts">
import {
  EpButton,
  EpContent,
  EpField,
  EpFormContent,
  EpIcon,
  EpInput,
  EpMainView,
  EpNavigation,
  EpSelect,
  EpSpinner,
  EpSteps,
} from '@/components';

import _ from 'lodash';
import { Component, Prop, Mixins } from 'vue-property-decorator';
import { Kielet } from '@/stores/kieli';
import { Ulkopuoliset, Opetussuunnitelmat } from '@/api';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { pohjaLuontiValidator } from '@/validators/ops';
import { YlopsKoulutustyypit } from '@/utils/perusteet';
import {
  PerusteInfoDto,
  OpetussuunnitelmaLuontiDto,
  LokalisoituTekstiDto,
  Kieli,
} from '@/tyypit';
import { createLogger } from '@/stores/logger';
import EpRoute from '@/mixins/EpRoute';
import EpValidation from '@/mixins/EpValidation';
import { success } from '@/utils/notifications';

const logger = createLogger('RoutePohjaUusi');

@Component({
  components: {
    EpButton,
    EpContent,
    EpField,
    EpFormContent,
    EpIcon,
    EpMainView,
    EpNavigation,
    EpSelect,
    EpSpinner,
    EpSteps,
  },
})
export default class RoutePohjaUusi extends Mixins(EpRoute, EpValidation) {
  private isSaving = false;
  private perusteet: PerusteInfoDto[] = [];
  private uusi = {
    valittuPeruste: null as (PerusteInfoDto | null),
    nimi: {},
  };

  get validationConfig() {
    return {
      uusi: pohjaLuontiValidator([]),
    };
  }

  get steps() {
    return [{
      name: 'wizard-peruste',
    }, {
      name: 'wizard-nimi',
    }];
  }

  public async mounted() {
    this.perusteet = (await Ulkopuoliset.getPerusteet()).data;
  }

  private get valittavat() {
    return _(this.perusteet)
      .filter((peruste) => _.includes(YlopsKoulutustyypit, peruste.koulutustyyppi))
      .sortBy((peruste) => (this as any).$kaanna(peruste.nimi))
      .value();
  }

  private valitsePeruste(peruste: PerusteInfoDto) {
    this.uusi.valittuPeruste = peruste;
  }

  private async luoUusiPeruste() {
    this.isSaving = true;

    try {
      const pohja: OpetussuunnitelmaLuontiDto = {
        nimi: this.uusi.nimi,
        perusteenDiaarinumero: this.uusi.valittuPeruste!.diaarinumero,
        julkaisukielet: [Kieli.fi, Kieli.sv] as any,
        tyyppi: 'pohja' as any,
      };

      const data = (await Opetussuunnitelmat.addOpetussuunnitelma(pohja)).data;
      success('lisays-pohja-onnistui');
      if (_.isNumber(data.id)) {
        this.$router.replace({
          name: 'opsTiedot',
          params: {
            id: '' + data.id,
          },
        });
      }
    }
    catch (err) {
      logger.log(err);
      this.isSaving = false;
    }
  }
}

</script>

<style scoped lang="scss">

@import '@/styles/_variables.scss';

</style>
