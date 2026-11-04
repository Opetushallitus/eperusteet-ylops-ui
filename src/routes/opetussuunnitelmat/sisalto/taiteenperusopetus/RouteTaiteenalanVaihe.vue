<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.nimi) || $t('nimeton-vaihe') }}
        </h2>
      </template>
      <template #default="{ data, isEditing }">
        <EpAlertError v-if="!data.perusteenVaihe">
          {{ $t('perusteen-sisaltoa-ei-maaritetty') }}
        </EpAlertError>

        <template v-if="data.perusteenVaihe">
          <div
            v-if="data.perusteenVaihe.laajuus"
            class="mt-4"
          >
            <h3>{{ $t('laajuus') }}</h3>
            <div>{{ data.perusteenVaihe.laajuus }} {{ $t('opintopiste') }}</div>
          </div>

          <EpPerusteKentta
            :teksti="data.perusteenVaihe.kuvaus"
            otsikko-key="kuvaus"
          />

          <div
            v-if="data.perusteenVaihe.tavoitealueet?.length"
            class="mt-4"
          >
            <h3>{{ $t('tavoitealueet') }}</h3>
            <EpTavoitesisaltoalueTavoitealueet
              :model-value="data.perusteenVaihe.tavoitealueet"
              :is-editing="false"
            />
          </div>
        </template>

        <div
          v-for="vapaa in data.vapaatTekstit"
          :key="'vapaa' + vapaa.perusteenVapaaTekstiId"
          class="mt-4"
        >
          <template v-if="perusteenVapaaTeksti(data, vapaa.perusteenVapaaTekstiId)">
            <h3>{{ $kaanna(perusteenVapaaTeksti(data, vapaa.perusteenVapaaTekstiId).nimi) }}</h3>
            <div v-html="$kaanna(perusteenVapaaTeksti(data, vapaa.perusteenVapaaTekstiId).teksti)" />
            <h4 class="mt-3">
              {{ $t('paikallinen-tarkennus') }}
            </h4>
            <EpContent
              v-model="vapaa.paikallinenTarkennus"
              layout="normal"
              :is-editable="isEditing"
            />
            <EpAlert
              v-if="!isEditing && !$kaanna(vapaa.paikallinenTarkennus)"
              :ops="false"
              :text="$t('paikallista-sisaltoa-ei-maaritetty')"
            />
          </template>
        </div>

        <div class="mt-5">
          <h3 class="mb-3">
            {{ $t('opintokokonaisuudet') }}
          </h3>
          <div
            v-if="data.opintokokonaisuudet?.length"
            class="overflow-x-auto"
          >
            <EpTable
              responsive
              striped
              hover
              :show-headers="false"
              data-key="id"
              class="w-full border-collapse text-left text-sm"
              :items="data.opintokokonaisuudet"
              :fields="listaFields"
              row-class="border-b border-surface-100"
            >
              <template #cell(nimi)="{ item }">
                <router-link :to="opintokokonaisuusRoute(data, item)">
                  {{ $kaanna(item.nimi) || $t('nimeton-opintokokonaisuus') }}
                </router-link>
              </template>
              <template #cell(laajuus)="{ item }">
                <span v-if="item.laajuus">{{ item.laajuus }} {{ $t('opintopiste') }}</span>
              </template>
            </EpTable>
          </div>
          <EpButton
            v-if="!isEditing"
            v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'opetussuunnitelma' }"
            class="mt-3"
            icon="add"
            @click="router.push(opintokokonaisuusRoute(data, { id: 'uusi' }))"
          >
            {{ $t('lisaa-opintokokonaisuus') }}
          </EpButton>
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
import { TaiteenalanVaiheStore } from '@/stores/taiteenalanVaiheStore';
import EpPerusteKentta from '@/components/EpPerusteKentta/EpPerusteKentta.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpAlertError from '@shared/components/EpAlert/EpAlertError.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';
import EpTavoitesisaltoalueTavoitealueet from '@shared/components/EpTavoitesisaltoalue/EpTavoitesisaltoalueTavoitealueet.vue';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const router = useRouter();
const editointiStore = ref<EditointiStore | null>(null);

const init = async () => {
  const opsId = props.opetussuunnitelmaStore.opetussuunnitelma.value?.id;
  const vaiheId = _.toNumber(route.params.vaiheId);
  if (!opsId || !vaiheId) {
    return;
  }
  editointiStore.value = new EditointiStore(new TaiteenalanVaiheStore(
    opsId,
    vaiheId,
    props.opetussuunnitelmaStore,
  ));
};

watch(() => route.params.vaiheId, init, { immediate: true });

const listaFields = [
  { key: 'nimi', label: '', tdClass: 'p-2' },
  { key: 'laajuus', label: '', tdClass: 'p-2 text-right' },
];

const perusteenVapaaTeksti = (data: any, id: number) => {
  return _.find(data.perusteenVaihe?.vapaatTekstit, { id });
};

const opintokokonaisuusRoute = (data: any, ok: any) => ({
  name: 'taiteenopintokokonaisuus',
  params: {
    taiteenalaId: String(route.params.taiteenalaId),
    vaiheId: String(data.id),
    opintokokonaisuusId: String(ok.id),
  },
});
</script>
