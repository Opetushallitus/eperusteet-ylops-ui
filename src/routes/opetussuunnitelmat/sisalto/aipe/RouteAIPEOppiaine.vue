<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header="{ data }">
        <h2 class="m-0">
          <span v-if="data.perusteSisalto?.koodi">{{ $kaanna(data.perusteSisalto.koodi.nimi) }}</span>
          <span v-else>{{ $kaanna(data.perusteSisalto?.nimi) || $t('nimetön-oppiaine') }}</span>
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

        <b-form-group
          v-if="data.perusteSisalto?.koodi"
          :label="$t('koodi')"
        >
          {{ data.perusteSisalto.koodi.arvo }}
        </b-form-group>

        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.tehtava"
          otsikko-key="tehtava"
        />
        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.tyotavat"
          otsikko-key="oppiaine-osio-tyotavat"
        />
        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.ohjaus"
          otsikko-key="oppiaine-osio-ohjaus"
        />
        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.arviointi"
          otsikko-key="arviointi"
        />
        <EpAIPEPerusteKentta
          :teksti-osa="data.perusteSisalto?.sisaltoalueinfo"
          otsikko-key="sisaltoalueet"
        />

        <EpAIPEPerusteKentta
          :teksti="data.perusteSisalto?.pakollinenKurssiKuvaus"
          otsikko-key="pakollinen-kurssi-kuvaus-header"
        />
        <EpAIPEPerusteKentta
          :teksti="data.perusteSisalto?.syventavaKurssiKuvaus"
          otsikko-key="syventava-kurssi-kuvaus-header"
        />
        <EpAIPEPerusteKentta
          :teksti="data.perusteSisalto?.soveltavaKurssiKuvaus"
          otsikko-key="soveltava-kurssi-kuvaus-header"
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
          v-if="data.perusteSisalto?.sisaltoalueet?.length"
          class="mt-4"
          :label="$t('keskeiset-sisaltoalueet')"
        >
          <div
            v-for="(alue, index) in data.perusteSisalto.sisaltoalueet"
            :key="'alue' + index"
            class="mb-3"
          >
            <h4>{{ $kaanna(alue.nimi) }}</h4>
            <div v-html="$kaanna(alue.kuvaus)" />
          </div>
        </b-form-group>

        <b-form-group
          v-if="tavoitteet.length"
          class="mt-4"
          :label="$t('opetuksen-tavoitteet')"
        >
          <EpCollapse
            v-for="tavoite in tavoitteet"
            :key="'tavoite' + tavoite.id"
            class="tavoite p-3 mb-4"
            :border-bottom="false"
            :use-padding="false"
          >
            <template #header>
              <div class="d-flex justify-content-between w-100 align-items-center">
                <h4 class="mb-0">
                  {{ $kaanna(tavoite.tavoite) }}
                </h4>
                <div
                  v-if="isEditing"
                  @click.stop
                >
                  <EpButton
                    variant="link"
                    @click="toggleTavoite(data, tavoite.id)"
                  >
                    {{ onkoTavoitePiilotettu(data, tavoite.id) ? $t('nayta-tavoite') : $t('piilota-tavoite') }}
                  </EpButton>
                </div>
              </div>
            </template>
            <div
              v-if="onkoTavoitePiilotettu(data, tavoite.id)"
              class="disabled-text mb-2"
            >
              {{ $t('piilotettu-julkisesta-opetussuunnitelmasta') }}
            </div>
            <EpAIPEOppiaineenTavoite :tavoite="tavoite" />
          </EpCollapse>
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
          v-if="data.oppimaarat?.length"
          class="mt-5"
        >
          <h3 class="mb-3">
            {{ $t('oppimaarat') }}
          </h3>
          <b-table
            striped
            :items="data.oppimaarat"
            :fields="listaFields"
          >
            <template #cell(nimi)="{ item }">
              <router-link :to="{ name: 'aipeoppiaine', params: { vaiheId: String(route.params.vaiheId), oppiaineId: String(item.id) } }">
                {{ $kaanna(item.nimi) }}
              </router-link>
              <span
                v-if="item.piilotettu"
                class="additional-info-text"
              >({{ $t('piilotettu') }})</span>
            </template>
          </b-table>
        </div>

        <div
          v-if="data.kurssit?.length"
          class="mt-5"
        >
          <h3 class="mb-3">
            {{ $t('kurssit') }}
          </h3>
          <b-table
            striped
            :items="data.kurssit"
            :fields="listaFields"
          >
            <template #cell(nimi)="{ item }">
              <router-link :to="{ name: 'aipekurssi', params: { vaiheId: String(route.params.vaiheId), oppiaineId: String(data.id), kurssiId: String(item.id) } }">
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
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { AipeOppiaineStore } from '@/stores/aipeOppiaineStore';
import EpAIPEPerusteKentta from '@/components/EpAIPEPerusteKentta/EpAIPEPerusteKentta.vue';
import EpAIPEOppiaineenTavoite from '@/components/EpAIPEOppiaineenTavoite/EpAIPEOppiaineenTavoite.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpAlertError from '@shared/components/EpAlert/EpAlertError.vue';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const editointiStore = ref<EditointiStore | null>(null);

const onkoTavoitePiilotettu = (data: any, tavoiteId: number) => {
  return _.includes(_.map(data.piilotetutTavoitteet || [], Number), Number(tavoiteId));
};

const tavoitteet = computed(() => {
  const data = editointiStore.value?.data;
  const isEditing = editointiStore.value?.isEditing;
  const all = data.perusteSisalto?.tavoitteet || [];
  if (isEditing) {
    return all;
  }
  return _.filter(all, t => !onkoTavoitePiilotettu(data, t.id));
});

const toggleTavoite = (data: any, tavoiteId: number) => {
  const current = _.map(data.piilotetutTavoitteet || [], Number);
  if (_.includes(current, Number(tavoiteId))) {
    data.piilotetutTavoitteet = _.filter(current, id => id !== Number(tavoiteId));
  }
  else {
    data.piilotetutTavoitteet = [...current, Number(tavoiteId)];
  }
};

const init = async () => {
  const opsId = props.opetussuunnitelmaStore.opetussuunnitelma.value?.id;
  const oppiaineId = _.toNumber(route.params.oppiaineId);
  if (!opsId || !oppiaineId) {
    return;
  }
  editointiStore.value = new EditointiStore(new AipeOppiaineStore(
    opsId,
    oppiaineId,
    props.opetussuunnitelmaStore,
  ));
};

watch(() => route.params.oppiaineId, init, { immediate: true });

const listaFields = [{
  key: 'nimi',
  thStyle: {
    display: 'none',
  },
}];
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

.tavoite {
  @include tile-background-shadow;
  border-radius: 10px;
}
</style>
