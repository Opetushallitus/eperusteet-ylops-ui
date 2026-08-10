<template>
  <div class="content">
    <ep-spinner v-if="!editointiStore" />
    <ep-editointi
      v-else
      :store="editointiStore"
      type="taiteenala"
    >
      <template #header="{ data }">
        <h2>{{ $kaanna(data.nimi) }}</h2>
      </template>

      <template #default="{ data, isEditing }">
        <div
          v-if="perusteenTaiteenala"
          class="taiteenala"
        >
          <b-form-group
             v-if="perusteenTaiteenala.laajuus"
          >
            <template #label>
              {{ $t('laajuus') }}
            </template>
            <div>{{ perusteenTaiteenala.laajuus }} {{ $t('opintopiste-partitiivi') }}</div>
          </b-form-group>

          <div v-html="$kaanna(perusteenTaiteenala.teksti)" />

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
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { UiKielet } from '@shared/stores/kieli';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { TpoPerusteenTaiteenalaDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { TaiteenalaStore } from '@/stores/TaiteenalaStore';
import { $kaanna, $t } from '@shared/utils/globals';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
  taiteenalaId: number;
}>();

const router = useRouter();

const editointiStore = ref<EditointiStore | null>(null);

const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id as number);

const perusteenTaiteenala = computed<TpoPerusteenTaiteenalaDto | null>(() => {
  return editointiStore.value?.supportData?.perusteenTaiteenala || null;
});

const fetch = async () => {
  editointiStore.value = new EditointiStore(new TaiteenalaStore(
    opsId.value,
    props.taiteenalaId,
    props.opetussuunnitelmaStore,
    router,
  ));
};

const contentEmpty = computed(() => {
  const paikallinenTarkennus = editointiStore.value?.data?.paikallinenTarkennus;
  return !_.some(UiKielet, kieli => !_.isEmpty(_.trim(_.get(paikallinenTarkennus, kieli))));
});

watch(() => props.taiteenalaId, fetch);

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
  margin-top: 2cqh;
}
</style>
