<template>
  <div>
    <EpButton
      variant="link"
      icon="folder"
      @click="open"
    >
      <span>{{ $t(title) }} </span>
    </EpButton>
    <EpModal
      ref="arkistoidutOpsModal"
      size="lg"
      :header="modalTitle"
    >
      <div class="search">
        <ep-search v-model="query" />
      </div>
      <EpSpinner v-if="!opetussuunnitelmat" />

      <template v-else-if="opetussuunnitelmat.data.length > 0">
        <div class="overflow-x-auto">
          <EpTable
            data-key="id"
            responsive
            :items="opetussuunnitelmat.data"
            :fields="fields"
            :per-page="10"
          >
            <template #cell(siirtyminen)="{ item }">
              <EpPalautusModal
                :opetussuunnitelma="item"
                @palauta="palauta"
              />
            </template>
          </EpTable>
        </div>
      </template>

      <template #modal-footer>
        <EpButton
          variant="link"
          @click="arkistoidutOpsModal.hide()"
        >
          {{ $t('sulje') }}
        </EpButton>
      </template>
    </EpModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef } from 'vue';
import _ from 'lodash';

import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpPalautusModal from '@/components/EpArkistoidutOps/EpPalautusModal.vue';

import { OpetussuunnitelmaInfoDto, Opetussuunnitelmat } from '@shared/api/ylops';
import { debounced } from '@shared/utils/delay';
import { Page } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';

import { $t, $kaanna, $sdt } from '@shared/utils/globals';

const props = withDefaults(
  defineProps<{
    tyyppi?: 'ops' | 'pohja';
    title: string;
  }>(), {
    tyyppi: 'ops',
  },
);

const emit = defineEmits<{
  palauta: [ops: any, tila: any, callback: () => Promise<void>];
}>();

const arkistoidutOpsModal = useTemplateRef('arkistoidutOpsModal');

const opetussuunnitelmat = ref<Page<OpetussuunnitelmaInfoDto> | null>(null);
const query = ref('');
const opsSivu = ref(1);

const fetch = async () => {
  opetussuunnitelmat.value = null;
  opetussuunnitelmat.value = (await Opetussuunnitelmat.getSivutettu(
    props.tyyppi as any,
    'poistettu',
    undefined,
    query.value,
    undefined, undefined,
    opsSivu.value - 1,
    10,
    Kielet.getSisaltoKieli.value,
  )).data as Page<OpetussuunnitelmaInfoDto>;
};

const modalTitle = computed(() => {
  return $t(props.title) + (opetussuunnitelmat.value ? '(' + opetussuunnitelmat.value['kokonaismäärä'] + ')' : '');
});

const palauta = async (ops: any, tila: any, palautusModalCallBack: () => Promise<void>) => {
  await emit('palauta', ops, tila, async () => {
    opetussuunnitelmat.value!.data = _.reject(opetussuunnitelmat.value?.data, (o) => o.id === ops.id);
    opetussuunnitelmat.value!['kokonaismäärä'] = opetussuunnitelmat.value!['kokonaismäärä'] - 1;
    await palautusModalCallBack();
  });
};

const fields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('ops-nimi'),
    sortable: false,
    formatter: (_value: unknown, _key: string, item: OpetussuunnitelmaInfoDto) => $kaanna(item.nimi),
  }, {
    key: 'muokattu',
    label: $t('poistettu'),
    sortable: false,
    formatter: (value: unknown) => $sdt(value),
  }, {
    key: 'arkistoija',
    label: $t('arkistoija'),
    sortable: false,
  }, {
    key: 'siirtyminen',
    label: '',
    sortable: false,
  }];
});

const open = async () => {
  arkistoidutOpsModal.value?.show();
  await fetch();
};

const close = () => {
  arkistoidutOpsModal.value?.hide();
};

watch(query, debounced(async () => {
  opsSivu.value = 1;
  opetussuunnitelmat.value = null;
  await fetch();
}));

watch(opsSivu, async () => {
  await fetch();
});
</script>

<style scoped lang="scss">

:deep(.ep-button) {
  .btn {
    padding: 0;
  }
}

</style>
