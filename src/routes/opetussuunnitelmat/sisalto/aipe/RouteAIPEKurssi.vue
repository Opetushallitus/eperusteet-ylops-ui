<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header="{ data }">
        <h2 class="m-0">
          <span v-if="data.perusteSisalto?.koodi">{{ $kaanna(data.perusteSisalto.koodi.nimi) }}</span>
          <span v-else>{{ $kaanna(data.perusteSisalto?.nimi) || $t('nimeton-kurssi') }}</span>
        </h2>
      </template>
      <template #postHeader="{ data }">
        <span
          v-if="data.piilotettu"
          class="additional-info-text"
        >({{ $t('piilotettu') }})</span>
      </template>
      <template #default="{ data, isEditing }">
        <div
          v-if="data.piilotettu && !isEditing"
          class="disabled-text mb-4"
        >
          {{ $t('piilotettu-julkisesta-opetussuunnitelmasta') }}
        </div>

        <b-form-group
          v-if="data.perusteSisalto?.koodi"
          :label="$t('koodi')"
        >
          {{ data.perusteSisalto.koodi.arvo }}
        </b-form-group>

        <EpAIPEPerusteKentta
          :teksti="data.perusteSisalto?.kuvaus"
          otsikko-key="tavoitteisiin-liittyvat-keskeiset-sisaltoalueet"
        />

        <b-form-group
          v-if="data.perusteSisalto?.tavoitteet?.length"
          class="mt-4"
          :label="$t('liitetyt-tavoitteet')"
        >
          <div
            v-for="tavoite in sortedTavoitteet(data.perusteSisalto.tavoitteet)"
            :key="tavoite.id"
            class="listaus p-3"
          >
            {{ $kaanna(tavoite.tavoite) }}
          </div>
        </b-form-group>

        <div class="mt-4">
          <h3>{{ $t('paikallinen-tarkennus') }}</h3>
          <EpContent
            v-model="data.paikallinenTarkennus"
            layout="normal"
            :is-editable="isEditing"
          />
          <EpAlert
            v-if="!isEditing && !$kaanna(data.paikallinenTarkennus)"
            :ops="false"
            :text="$t('paikallista-sisaltoa-ei-maaritetty')"
          />
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { AipeKurssiStore } from '@/stores/aipeKurssiStore';
import EpAIPEPerusteKentta from '@/components/EpAIPEPerusteKentta/EpAIPEPerusteKentta.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { getTavoiteNumero } from '@shared/utils/perusteet';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const editointiStore = ref<EditointiStore | null>(null);

const sortedTavoitteet = (tavoitteet: any[]) => {
  return _.sortBy(tavoitteet, t => getTavoiteNumero(t.tavoite));
};

const init = async () => {
  const opsId = props.opetussuunnitelmaStore.opetussuunnitelma.value?.id;
  const kurssiId = _.toNumber(route.params.kurssiId);
  if (!opsId || !kurssiId) {
    return;
  }
  editointiStore.value = new EditointiStore(new AipeKurssiStore(
    opsId,
    kurssiId,
    props.opetussuunnitelmaStore,
  ));
};

watch(() => route.params.kurssiId, init, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.listaus:nth-of-type(even) {
  background-color: $table-even-row-bg-color;
}
.listaus:nth-of-type(odd) {
  background-color: $table-odd-row-bg-color;
}
</style>
