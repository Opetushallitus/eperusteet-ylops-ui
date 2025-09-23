<template>
<div>
  <ep-button v-b-modal.tekstikappalelisays
             variant="link"
             buttonClass="text-decoration-none"
             icon="add"
             :paddingx="false">
    <span>{{ $t('uusi-tekstikappale') }}</span>
  </ep-button>
  <b-modal ref="tekstikappalelisaysModal"
           id="tekstikappalelisays"
           size="lg"
           centered
           :ok-disabled="okDisabled"
           @hidden="clear">
    <template v-slot:modal-title>
      {{ $t('lisaa-uusi-tekstikappale') }}
    </template>

    <ep-form-content name="tekstikappale-nimi-ohje">
      <ep-field class="mb-5" v-model="otsikko" :is-editing="true" />
    </ep-form-content>

    <ep-form-content name="ylaotsikko" v-if="tekstikappaleet.length > 0">
      <ep-select class="mb-5"
                 v-model="valittuTekstikappale"
                 :items="tekstikappaleet"
                 :is-editing="true"
                 :enable-empty-option="tyhjaValinta">
        <template #default="{ item }">
          {{ item.item.prefix + ' ' + $kaanna(item.item.objref.nimi) }}
        </template>
      </ep-select>
    </ep-form-content>

    <template #modal-footer>
      <EpButton variant="secondary" @click="$refs.tekstikappalelisaysModal.hide()" :disabled="tallentaa">
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton variant="primary" @click="save" :disabled="okDisabled || tallentaa" :showSpinner="tallentaa">
        {{ $t('lisaa-tekstikappale') }}
      </EpButton>
    </template>

  </b-modal>
</div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEpOpsRoute } from '@/mixins/EpOpsRoute';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import { Puu } from '@shared/api/ylops';
import { LokalisoituTekstiDto, SideMenuEntry } from '@shared/tyypit';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

const props = withDefaults(
  defineProps<{
    tekstikappaleet: SideMenuEntry[];
    tyhjaValinta?: boolean;
    opetussuunnitelmaStore: OpetussuunnitelmaStore;
  }>(), {
  tyhjaValinta: false,
});

const { store } = useEpOpsRoute(props.opetussuunnitelmaStore);
const route = useRoute();
const router = useRouter();

const otsikko = ref<LokalisoituTekstiDto>({});
const valittuTekstikappale = ref<any>({});
const tallentaa = ref(false);

const okDisabled = computed(() => {
  return _.isEmpty(otsikko.value);
});

const save = async () => {
  const newTekstikappale = {
    tekstiKappale: {
      nimi: otsikko.value,
    },
  };

  tallentaa.value = true;
  const uusi = await store.value.addTeksti(newTekstikappale as Puu, valittuTekstikappale.value?.route?.params?.osaId);

  router.push({
    name: 'tekstikappale',
    params: {
      ...route.params,
      osaId: '' + uusi.id,
    },
  });
};

const clear = () => {
  otsikko.value = {};
  valittuTekstikappale.value = {};
};

</script>

<style scoped lang="scss">

</style>
