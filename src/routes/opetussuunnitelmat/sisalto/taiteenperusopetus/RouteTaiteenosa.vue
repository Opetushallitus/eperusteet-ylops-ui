<template>
  <div class="content">
    <ep-spinner v-if="!editointiStore" />
    <ep-editointi
      v-else
      :store="editointiStore"
    >
      <template #header="{ supportData }">
        <h2>{{ $kaanna(supportData.perusteenTaiteenosa.nimi) }}</h2>
      </template>

      <template #default="{ data, isEditing }">
        <div
          v-if="perusteenTaiteenosa"
          class="taiteenosa"
        >
          <div
            v-if="perusteenTaiteenosa.laajuus"
            class="laajuus"
          >
            <span class="otsikko">{{ $t('laajuus') }}</span>
            <span>{{ perusteenTaiteenosa.laajuus }} {{ $t('opintopiste-partitiivi') }}</span>
          </div>

          <ep-content
            v-if="perusteenTaiteenosa.kuvaus"
            :model-value="perusteenTaiteenosa.kuvaus"
            :is-editable="false"
            layout="normal"
          />

          <div v-if="tavoitteet.length > 0">
            <h3>{{ $t('tavoitteet') }}</h3>
            <ul>
              <li
                v-for="(tavoite, index) in tavoitteet"
                :key="index"
              >
                {{ $kaanna(tavoite) }}
              </li>
            </ul>
          </div>

          <hr class="my-4"/>
        </div>

        <div class="paikallinen-tarkennus">
          <h3 class="mb-3">{{ $t('paikallinen-teksti') }}</h3>
          <ep-content
            v-if="isEditing || !contentEmpty"
            v-model="data.paikallinenTarkennus"
            :is-editable="isEditing"
            layout="normal"
          />
          <ep-alert
            v-if="!isEditing && contentEmpty"
            :text="$t('paikallista-sisaltoa-ei-maaritetty')"
          />
        </div>
      </template>
    </ep-editointi>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteTaiteenosaDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { TaiteenosaStore } from '@/stores/TaiteenosaStore';
import { $kaanna, $t } from '@shared/utils/globals';
import _ from 'lodash';
import { UiKielet } from '@shared/stores/kieli';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
  taiteenosaId: number;
}>();

const editointiStore = ref<EditointiStore | null>(null);

const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id as number);

const perusteenTaiteenosa = computed<PerusteTaiteenosaDto | null>(() => {
  return editointiStore.value?.supportData?.perusteenTaiteenosa || null;
});

const tavoitteet = computed(() => {
  return perusteenTaiteenosa.value?.tavoitteet || [];
});

const fetch = async () => {
  editointiStore.value = new EditointiStore(new TaiteenosaStore(
    opsId.value,
    props.taiteenosaId,
    props.opetussuunnitelmaStore,
  ));
};

const contentEmpty = computed(() => {
  const paikallinenTarkennus = editointiStore.value?.data?.paikallinenTarkennus;
  return !_.some(UiKielet, kieli => !_.isEmpty(_.trim(_.get(paikallinenTarkennus, kieli))));
});

watch(() => props.taiteenosaId, fetch);

onMounted(fetch);
</script>

<style scoped lang="scss">
.content {
  padding: 10px;
}

.laajuus {
  margin-bottom: 20px;

  .otsikko {
    font-weight: 600;
    margin-right: 10px;
  }
}

.paikallinen-tarkennus {
  margin-top: 30px;
}
</style>
