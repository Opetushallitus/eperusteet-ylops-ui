<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.perusteSisalto?.nimi) || $t('nimeton') }}
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

        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.siirtymaEdellisesta"
          otsikko-key="siirtyma-edellisesta"
        />
        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.tehtava"
          otsikko-key="tehtava"
        />
        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.siirtymaSeuraavaan"
          otsikko-key="siirtyma-seuraavaan"
        />
        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.laajaalainenOsaaminen"
          otsikko-key="laaja-alainen-osaaminen"
        />
        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.paikallisestiPaatettavatAsiat"
          otsikko-key="paikallisesti-paatettavat-asiat"
        />

        <div
          v-if="data.perusteSisalto?.vapaatTekstit?.length"
          class="mt-4"
        >
          <div
            v-for="(vapaa, index) in data.perusteSisalto.vapaatTekstit"
            :key="'vapaa' + index"
            class="mt-3"
          >
            <h3>{{ $kaanna(vapaa.nimi) }}</h3>
            <div v-html="$kaanna(vapaa.teksti)" />
          </div>
        </div>

        <b-form-group
          v-if="data.perusteSisalto?.opetuksenKohdealueet?.length"
          class="mt-4"
          :label="$t('opetuksen-tavoitealueet')"
        >
          <ul>
            <li
              v-for="(kohdealue, index) in data.perusteSisalto.opetuksenKohdealueet"
              :key="'kohdealue' + index"
            >
              {{ $kaanna(kohdealue.nimi) }}
            </li>
          </ul>
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

        <div
          v-if="data.oppiaineet?.length"
          class="mt-5"
        >
          <h3 class="mb-3">
            {{ $t('oppiaineet') }}
          </h3>
          <b-table
            striped
            :items="data.oppiaineet"
            :fields="listaFields"
          >
            <template #cell(nimi)="{ item }">
              <router-link :to="{ name: 'aipeoppiaine', params: { vaiheId: String(data.id), oppiaineId: String(item.id) } }">
                {{ $kaanna(item.nimi) }}
              </router-link>
              <span
                v-if="item.piilotettu"
                class="additional-info-text"
              >({{ $t('piilotettu') }})</span>
            </template>
          </b-table>
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
import { AipeVaiheStore } from '@/stores/aipeVaiheStore';
import EpAIPEPerusteKentta from '@/components/EpAIPEPerusteKentta/EpAIPEPerusteKentta.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
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
  editointiStore.value = new EditointiStore(new AipeVaiheStore(
    opsId,
    vaiheId,
    props.opetussuunnitelmaStore,
    router,
  ));
};

watch(() => route.params.vaiheId, init, { immediate: true });

const listaFields = [{
  key: 'nimi',
  thStyle: {
    display: 'none',
  },
}];
</script>
