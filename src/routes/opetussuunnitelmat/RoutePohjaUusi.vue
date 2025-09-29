<template>
  <ep-main-view>
    <template #header>
      <h1>{{ $t('uusi-pohja') }}</h1>
    </template>
    <div>
      <ep-form-content name="pohja-nimi">
        <ep-field
          v-model="uusi.nimi"
          help="pohja-nimi-ohje"
          :validation="$v.uusi.nimi"
          :is-editing="true"
        />
      </ep-form-content>
    </div>
    <div v-if="valittavat.length > 0">
      <ep-form-content name="peruste">
        <ep-select
          v-model="uusi.valittuPeruste"
          help="ops-peruste-ohje"
          :items="valittavat"
          :is-editing="true"
        >
          <template #default="{ item }">
            {{ $kaanna(item.nimi) }} ({{ item.diaarinumero }})
          </template>
        </ep-select>
      </ep-form-content>
    </div>
    <ep-spinner v-else />
    <ep-button
      :disabled="$v.uusi.$invalid"
      :show-spinner="isSaving"
      @click="luoUusiPeruste"
    >
      {{ $t('luo-pohja') }}
    </ep-button>
  </ep-main-view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Ulkopuoliset, Opetussuunnitelmat, PerusteInfoDto, OpetussuunnitelmaLuontiDto } from '@shared/api/ylops';
import { pohjaLuontiValidator } from '@/validators/ops';
import { isPerusteSupported } from '@/utils/perusteet';
import { createLogger } from '@shared/utils/logger';
import { success } from '@/utils/notifications';
import { Kieli } from '@shared/tyypit';
import { $t, $kaanna, $success } from '@shared/utils/globals';

const logger = createLogger('RoutePohjaUusi');
const router = useRouter();

const isSaving = ref(false);
const perusteet = ref<PerusteInfoDto[]>([]);
const uusi = ref({
  valittuPeruste: null as (PerusteInfoDto | null),
  nimi: {},
});

const validationConfig = computed(() => {
  return {
    uusi: pohjaLuontiValidator([]),
  };
});

const $v = useVuelidate(validationConfig, { uusi });

const steps = computed(() => {
  return [{
    name: 'wizard-peruste',
  }, {
    name: 'wizard-nimi',
  }];
});

const valittavat = computed(() => {
  return _(perusteet.value)
    .filter((peruste) => isPerusteSupported(peruste))
    .sortBy((peruste) => _.toLower($kaanna(peruste.nimi)))
    .value();
});

const valitsePeruste = (peruste: PerusteInfoDto) => {
  uusi.value.valittuPeruste = peruste;
};

const luoUusiPeruste = async () => {
  isSaving.value = true;

  try {
    const pohja: OpetussuunnitelmaLuontiDto = {
      nimi: uusi.value.nimi,
      perusteenDiaarinumero: uusi.value.valittuPeruste!.diaarinumero,
      julkaisukielet: [Kieli.fi, Kieli.sv] as any,
      tyyppi: 'pohja' as any,
    };

    const data = (await Opetussuunnitelmat.addOpetussuunnitelma(pohja)).data;
    $success('lisays-pohja-onnistui');
    if (_.isNumber(data.id)) {
      router.replace({
        name: 'yleisnakyma',
        params: {
          id: '' + data.id,
        },
      });
    }
  }
  catch (err) {
    logger.log(err);
    isSaving.value = false;
  }
};

onMounted(async () => {
  perusteet.value = (await Ulkopuoliset.getPerusteet()).data;
});

</script>

<style scoped lang="scss">

@import '@shared/styles/_variables.scss';

</style>
