<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.nimi) || $t('nimeton-taiteenala') }}
        </h2>
      </template>
      <template #default="{ data, isEditing }">
        <EpAlertError v-if="!data.perusteenTaiteenala">
          {{ $t('perusteen-sisaltoa-ei-maaritetty') }}
        </EpAlertError>

        <div
          v-if="data.perusteenTaiteenala?.teksti"
          class="mt-4"
          v-html="$kaanna(data.perusteenTaiteenala.teksti)"
        />

        <EpPerusteKentta
          v-for="osa in osat"
          :key="osa.key"
          :teksti="data.perusteenTaiteenala?.[osa.key]?.teksti"
          :otsikko-key="osa.otsikkoKey"
        />

        <EpPerusteKentta
          v-for="(vapaa, index) in data.perusteenTaiteenala?.vapaatTekstit"
          :key="'vapaa' + index"
          :teksti-osa="{ otsikko: vapaa.nimi, teksti: vapaa.teksti }"
        />

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

        <div
          v-if="data.vaiheet?.length"
          class="mt-5"
        >
          <h3 class="mb-3">
            {{ $t('vaiheet') }}
          </h3>
          <div class="overflow-x-auto">
            <EpTable
              responsive
              striped
              hover
              :show-headers="false"
              data-key="id"
              class="w-full border-collapse text-left text-sm"
              :items="data.vaiheet"
              :fields="listaFields"
              row-class="border-b border-surface-100"
            >
              <template #cell(nimi)="{ item }">
                <router-link :to="{ name: 'taiteenalanvaihe', params: { taiteenalaId: String(data.id), vaiheId: String(item.id) } }">
                  {{ $kaanna(item.nimi) || $t('nimeton-vaihe') }}
                </router-link>
              </template>
            </EpTable>
          </div>
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { TaiteenalaStore } from '@/stores/taiteenalaStore';
import EpPerusteKentta from '@/components/EpPerusteKentta/EpPerusteKentta.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpAlertError from '@shared/components/EpAlert/EpAlertError.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const router = useRouter();
const editointiStore = ref<EditointiStore | null>(null);

const osat = [
  { key: 'aikuistenOpetus', otsikkoKey: 'taiteenala-aikuisten-opetus' },
  { key: 'kasvatus', otsikkoKey: 'taiteenala-kasvatus' },
  { key: 'oppimisenArviointiOpetuksessa', otsikkoKey: 'taiteenala-oppimisen-arvionti' },
  { key: 'teemaopinnot', otsikkoKey: 'taiteenala-teemaopinnot' },
  { key: 'tyotavatOpetuksessa', otsikkoKey: 'taiteenala-tyotavat' },
  { key: 'yhteisetOpinnot', otsikkoKey: 'taiteenala-yhteisetOpinnot' },
];

const listaFields = [
  { key: 'nimi', label: '', tdClass: 'p-2' },
];

const init = async () => {
  const opsId = props.opetussuunnitelmaStore.opetussuunnitelma.value?.id;
  const taiteenalaId = _.toNumber(route.params.taiteenalaId);
  if (!opsId || !taiteenalaId) {
    return;
  }
  editointiStore.value = new EditointiStore(new TaiteenalaStore(
    opsId,
    taiteenalaId,
    props.opetussuunnitelmaStore,
    router,
  ));
};

watch(() => route.params.taiteenalaId, init, { immediate: true });
</script>
