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

        <EpAlertError v-if="!data.perusteSisalto">
          {{ $t('perusteen-sisaltoa-ei-maaritetty') }}
        </EpAlertError>

        <EpFormContent
          v-if="data.perusteSisalto?.koodi"
          name="koodi"
        >
          {{ data.perusteSisalto.koodi.arvo }}
        </EpFormContent>

        <EpAIPEPerusteKentta
          :teksti="data.perusteSisalto?.kuvaus"
          otsikko-key="tavoitteisiin-liittyvat-keskeiset-sisaltoalueet"
        />

        <EpFormContent
          v-if="naytettavatTavoitteet.length"
          class="mt-4"
          name="liitetyt-tavoitteet"
        >
          <div
            v-for="tavoite in naytettavatTavoitteet"
            :key="tavoite.id"
            class="listaus p-3 flex justify-between items-center gap-4"
          >
            <div>
              <div>{{ $kaanna(tavoite.tavoite) }}</div>
              <div
                v-if="tavoite.piilotettu"
                class="disabled-text"
              >
                {{ $t('piilotettu-julkisesta-opetussuunnitelmasta') }}
              </div>
            </div>
            <EpButton
              v-if="isEditing"
              class="shrink-0"
              variant="link"
              @click="toggleTavoite(tavoite.id)"
            >
              {{ tavoite.piilotettu ? $t('nayta-tavoite') : $t('piilota-tavoite') }}
            </EpButton>
          </div>
        </EpFormContent>

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
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { AipeKurssiStore } from '@/stores/aipeKurssiStore';
import EpAIPEPerusteKentta from '@/components/EpAIPEPerusteKentta/EpAIPEPerusteKentta.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpAlertError from '@shared/components/EpAlert/EpAlertError.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { getTavoiteNumero } from '@shared/utils/perusteet';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const editointiStore = ref<EditointiStore | null>(null);

const data = computed(() => editointiStore.value?.data);
const isEditing = computed(() => !!editointiStore.value?.isEditing);

const piilotetutTavoitteet = computed<number[]>(() => _.map(data.value?.piilotetutTavoitteet || [], Number));

const naytettavatTavoitteet = computed(() => {
  const tavoitteet = _.chain(data.value?.perusteSisalto?.tavoitteet || [])
    .sortBy(t => getTavoiteNumero(t.tavoite))
    .map(t => ({
      ...t,
      piilotettu: _.includes(piilotetutTavoitteet.value, Number(t.id)),
    }))
    .value();
  if (isEditing.value) {
    return tavoitteet;
  }
  return _.reject(tavoitteet, 'piilotettu');
});

const toggleTavoite = (tavoiteId: number) => {
  const id = Number(tavoiteId);
  data.value.piilotetutTavoitteet = _.includes(piilotetutTavoitteet.value, id)
    ? _.without(piilotetutTavoitteet.value, id)
    : [...piilotetutTavoitteet.value, id];
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
