<template>
  <div class="ep-taiteenala-lisays">
    <ep-button
      variant="link"
      button-class="text-decoration-none font-size-1-125"
      no-padding
      @click="showModal"
    >
      <EpMaterialIcon
        :color="'inherit'"
        :background="'inherit'"
        size="18px"
      >
        add
      </EpMaterialIcon>
      <span>{{ $t('lisaa-taiteenala') }}</span>
    </ep-button>
    <b-modal
      id="taiteenalalisays"
      ref="taiteenalalisaysModal"
      size="lg"
      centered
      lazy
      @show="haeTaiteenalat"
      @hidden="clear"
    >
      <template #modal-title>
        {{ $t('lisaa-taiteenala') }}
      </template>

      <div>{{ $t('taiteenala-lisays-ohje') }}</div>

      <ep-spinner v-if="haetaan" />
      <div
        v-else-if="valittavatTaiteenalat.length === 0"
        class="alert alert-info mt-4"
      >
        {{ $t('kaikki-perusteen-taiteenalat-lisatty') }}
      </div>
      <ep-form-content
        v-else
        class="mt-4"
        name="valitse-taiteenala"
      >
        <ep-select
          v-model="valittuTaiteenala"
          :items="valittavatTaiteenalat"
          :is-editing="true"
          :enable-empty-option="true"
        >
          <template #default="{ item }">
            {{ $kaanna(item.koodi.nimi) || $kaanna(item.nimi) }}
          </template>
        </ep-select>
      </ep-form-content>

      <template #modal-footer>
        <EpButton
          variant="secondary"
          :disabled="tallentaa"
          @click="hideModal"
        >
          {{ $t('peruuta') }}
        </EpButton>
        <EpButton
          variant="primary"
          :disabled="!valittuTaiteenala || tallentaa"
          :show-spinner="tallentaa"
          @click="save"
        >
          {{ $t('lisaa-taiteenala') }}
        </EpButton>
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Taiteenperusopetus, TpoPerusteenTaiteenalaDto, TpoSisaltoViiteDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $fail, $kaanna, $t } from '@shared/utils/globals';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const router = useRouter();

const taiteenalalisaysModal = useTemplateRef('taiteenalalisaysModal');

const perusteenTaiteenalat = ref<TpoPerusteenTaiteenalaDto[]>([]);
const lisatytKoodit = ref<string[]>([]);
const valittuTaiteenala = ref<TpoPerusteenTaiteenalaDto | null>(null);
const haetaan = ref(false);
const tallentaa = ref(false);

const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id as number);

const valittavatTaiteenalat = computed(() => {
  return _.chain(perusteenTaiteenalat.value)
    .reject(taiteenala => _.includes(lisatytKoodit.value, taiteenala.koodi?.uri))
    .sortBy(taiteenala => $kaanna(taiteenala.koodi?.nimi) || $kaanna(taiteenala.nimi))
    .value();
});

const litista = (viite?: TpoSisaltoViiteDto): TpoSisaltoViiteDto[] => {
  return viite ? [viite, ..._.flatMap(viite.lapset, litista)] : [];
};

const haeTaiteenalat = async () => {
  haetaan.value = true;
  try {
    const [sisalto, taiteenalat] = await Promise.all([
      Taiteenperusopetus.getPerusteSisalto(opsId.value),
      Taiteenperusopetus.getTaiteenalat(opsId.value),
    ]);

    perusteenTaiteenalat.value = _.chain(litista(sisalto.data.sisalto))
      .map('perusteenOsa')
      .filter(perusteenOsa => _.get(perusteenOsa, 'osanTyyppi') === 'taiteenala')
      .filter(perusteenOsa => !!_.get(perusteenOsa, 'koodi.uri'))
      .value() as TpoPerusteenTaiteenalaDto[];
    lisatytKoodit.value = _.map(taiteenalat.data, 'koodi') as string[];
  }
  catch (err) {
    $fail($t('perusteen-taiteenalojen-haku-epaonnistui'));
  }
  finally {
    haetaan.value = false;
  }
};

const save = async () => {
  tallentaa.value = true;
  try {
    const uusi = (await Taiteenperusopetus.addTaiteenala(opsId.value, { koodi: valittuTaiteenala.value?.koodi?.uri })).data;
    await props.opetussuunnitelmaStore.initNavigation();
    hideModal();

    router.push({
      name: 'taiteenala',
      params: {
        ...route.params,
        taiteenalaId: _.toString(uusi.id),
      },
    });
  }
  catch (err: any) {
    $fail($t('tallennus-epaonnistui'));
  }
  finally {
    tallentaa.value = false;
  }
};

const showModal = () => {
  taiteenalalisaysModal.value?.show();
};

const hideModal = () => {
  taiteenalalisaysModal.value?.hide();
};

const clear = () => {
  valittuTaiteenala.value = null;
};

</script>

<style scoped lang="scss">

.ep-taiteenala-lisays, .ep-taiteenala-lisays :deep(button) {
  margin: 0;
  padding: 0;
}
</style>
