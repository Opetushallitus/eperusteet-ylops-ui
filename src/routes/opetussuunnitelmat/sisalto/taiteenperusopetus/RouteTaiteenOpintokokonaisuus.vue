<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.nimi) || $t('nimeton-opintokokonaisuus') }}
        </h2>
      </template>
      <template #default="{ data, supportData, isEditing, validation }">
        <EpAlertError v-if="poistetut(data, supportData).length > 0">
          {{ $t('tavoitealueita-poistettu-perusteelta') }}
        </EpAlertError>

        <div
          v-if="isEditing"
          class="flex flex-wrap gap-4"
        >
          <ep-form-content
            name="opintokokonaisuuden-nimi"
            class="flex-1"
          >
            <ep-field
              v-model="data.nimi"
              :is-editing="isEditing"
              :validation="validation?.nimi"
            />
          </ep-form-content>
          <ep-form-content
            name="laajuus"
            class="ml-auto"
          >
            <EpLaajuusInput
              v-model="data.laajuus"
              :is-editing="isEditing"
              :validation="validation?.laajuus"
            >
              {{ $t('opintopiste') }}
            </EpLaajuusInput>
          </ep-form-content>
        </div>

        <ep-form-content
          v-else
          name="laajuus"
        >
          <EpLaajuusInput
            v-model="data.laajuus"
            :is-editing="false"
          >
            {{ $t('opintopiste') }}
          </EpLaajuusInput>
        </ep-form-content>

        <ep-form-content name="kuvaus">
          <EpContent
            v-model="data.kuvaus"
            layout="normal"
            :is-editable="isEditing"
          />
          <EpAlert
            v-if="!isEditing && !$kaanna(data.kuvaus)"
            :ops="false"
            :text="$t('paikallista-sisaltoa-ei-maaritetty')"
          />
        </ep-form-content>

        <ep-form-content name="tavoitealueet">
          <template v-if="isEditing">
            <div class="mb-2">
              {{ $t('valitse-tavoitealueet') }}
            </div>
            <div
              v-for="(alue, alueIndex) in supportData?.tavoitealueet"
              :key="'alue' + (alue.id || alueIndex)"
            >
              <label
                v-if="alue.otsikko?.uri"
                class="valinta-rivi"
              >
                <input
                  type="checkbox"
                  :checked="onAlueValittu(data, alue)"
                  @change="asetaAlue(data, alue, ruutuValittu($event))"
                >
                <span>{{ $kaanna(alue.otsikko.nimi) || $t('tavoitealue') }}</span>
              </label>
              <div
                v-if="$kaanna(alue.tavoitteidenJohdanto)"
                class="mb-2"
                :class="{ 'ml-6': !!alue.otsikko?.uri }"
              >
                {{ $kaanna(alue.tavoitteidenJohdanto) }}
              </div>
              <div
                v-for="(tavoite, tavoiteIndex) in alue.tavoitteet"
                :key="'tavoite' + (alue.id || alueIndex) + '-' + tavoiteIndex"
                :class="{ 'ml-6': !!alue.otsikko?.uri }"
              >
                <label
                  v-if="tavoite?.uri"
                  class="valinta-rivi"
                >
                  <input
                    type="checkbox"
                    :checked="onTavoiteValittu(data, alue, tavoite.uri)"
                    @change="asetaTavoite(data, alue, tavoite.uri, ruutuValittu($event))"
                  >
                  <span>{{ $kaanna(tavoite.nimi) }}</span>
                </label>
              </div>
            </div>
          </template>
          <template v-else>
            <EpTavoitesisaltoalueTavoitealueet
              v-if="valitut(data, supportData).length > 0"
              :model-value="valitut(data, supportData)"
              :is-editing="false"
            />
            <EpAlert
              v-else
              :ops="false"
              :text="$t('ei-valittuja-tavoitealueita')"
            />
          </template>
        </ep-form-content>

        <ep-form-content name="osaamisen-arviointi">
          <EpContent
            v-model="data.osaamisenArviointi"
            layout="normal"
            :is-editable="isEditing"
          />
          <EpAlert
            v-if="!isEditing && !$kaanna(data.osaamisenArviointi)"
            :ops="false"
            :text="$t('paikallista-sisaltoa-ei-maaritetty')"
          />
        </ep-form-content>
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
import { TaiteenOpintokokonaisuusStore } from '@/stores/taiteenOpintokokonaisuusStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpAlertError from '@shared/components/EpAlert/EpAlertError.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
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
  const taiteenalaId = _.toNumber(route.params.taiteenalaId);
  const vaiheId = _.toNumber(route.params.vaiheId);
  const opintokokonaisuusId = route.params.opintokokonaisuusId === 'uusi' ? 'uusi' : _.toNumber(route.params.opintokokonaisuusId);
  if (!opsId || !taiteenalaId || !vaiheId || !opintokokonaisuusId) {
    return;
  }
  editointiStore.value = new EditointiStore(new TaiteenOpintokokonaisuusStore(
    opsId,
    taiteenalaId,
    vaiheId,
    opintokokonaisuusId,
    props.opetussuunnitelmaStore,
    router,
  ));
};

const tallennetutValinnat = ref<any[] | null>(null);
let valintojenData: any = null;

watch(() => route.params.opintokokonaisuusId, () => {
  valintojenData = null;
  tallennetutValinnat.value = null;
  init();
}, { immediate: true });

const ruutuValittu = (event: Event) => (event.target as HTMLInputElement).checked;

const valinnat = (data: any) => {
  if (valintojenData !== data) {
    valintojenData = data;
    tallennetutValinnat.value = [...(data?.tavoitealueValinnat || [])];
  }
  return tallennetutValinnat.value || [];
};

const samaAlue = (id: any, toinen: any) => String(id) === String(toinen);

const alueenUrit = (alue: any) => {
  return new Set([alue?.otsikko?.uri, ..._.map(alue?.tavoitteet, 'uri')].filter(Boolean));
};

const tavoiteUrit = (alue: any) => _.filter(_.map(alue?.tavoitteet, 'uri'));

const onValittu = (data: any, alueId: any, uri?: string) => {
  return !!uri && valinnat(data).some(valinta => samaAlue(valinta.tavoitealueId, alueId) && valinta.koodiUri === uri);
};

const onTavoiteValittu = (data: any, alue: any, uri: string) => onValittu(data, alue?.id, uri);

const onAlueValittu = (data: any, alue: any) => {
  return onValittu(data, alue?.id, alue?.otsikko?.uri)
    || tavoiteUrit(alue).some((uri: string) => onValittu(data, alue.id, uri));
};

const kirjoitaValinnat = (data: any, seuraavat: any[]) => {
  tallennetutValinnat.value = seuraavat;
  data.tavoitealueValinnat = seuraavat;
};

const poistetut = (data: any, supportData: any) => {
  if (!supportData) {
    return [];
  }
  return _.filter(valinnat(data), valinta => {
    const alue = _.find(supportData.tavoitealueet, kohde => samaAlue(kohde.id, valinta.tavoitealueId));
    return !alue || !alueenUrit(alue).has(valinta.koodiUri);
  });
};

const valitut = (data: any, supportData: any) => {
  return _.chain(supportData?.tavoitealueet || [])
    .map(alue => {
      const tavoitteet = _.filter(alue.tavoitteet, (tavoite: any) => onValittu(data, alue.id, tavoite?.uri));
      const otsikkoValittu = onValittu(data, alue.id, alue.otsikko?.uri);
      const tuntematon = _.some(valinnat(data), valinta => samaAlue(valinta.tavoitealueId, alue.id) && !alueenUrit(alue).has(valinta.koodiUri));
      if (!otsikkoValittu && tavoitteet.length === 0 && !tuntematon) {
        return null;
      }
      return {
        ...alue,
        tavoitteet,
      };
    })
    .filter()
    .value();
};

const ilmanUreja = (data: any, alue: any, urit: Set<string>) => {
  return valinnat(data).filter(valinta => !samaAlue(valinta.tavoitealueId, alue.id) || !urit.has(valinta.koodiUri));
};

const lisaaValinnat = (valinnatLista: any[], alue: any, urit: string[]) => {
  const seuraavat = [...valinnatLista];
  urit.filter(Boolean).forEach(koodiUri => {
    if (!seuraavat.some(valinta => samaAlue(valinta.tavoitealueId, alue.id) && valinta.koodiUri === koodiUri)) {
      seuraavat.push({ tavoitealueId: alue.id, koodiUri });
    }
  });
  return seuraavat;
};

const asetaAlue = (data: any, alue: any, valittu: boolean) => {
  const tunnetut = alueenUrit(alue);
  const jaljella = ilmanUreja(data, alue, tunnetut);
  kirjoitaValinnat(data, valittu ? lisaaValinnat(jaljella, alue, [...tunnetut]) : jaljella);
};

const asetaTavoite = (data: any, alue: any, uri: string, valittu: boolean) => {
  let seuraavat = valinnat(data).filter(valinta => !(samaAlue(valinta.tavoitealueId, alue.id) && valinta.koodiUri === uri));
  if (valittu && uri) {
    seuraavat = [...seuraavat, { tavoitealueId: alue.id, koodiUri: uri }];
  }
  const tavoitteita = tavoiteUrit(alue).some((tavoiteUri: string) => seuraavat.some(valinta => samaAlue(valinta.tavoitealueId, alue.id) && valinta.koodiUri === tavoiteUri));
  seuraavat = seuraavat.filter(valinta => !(samaAlue(valinta.tavoitealueId, alue.id) && valinta.koodiUri === alue.otsikko?.uri));
  if (tavoitteita && alue.otsikko?.uri) {
    seuraavat.push({ tavoitealueId: alue.id, koodiUri: alue.otsikko.uri });
  }
  kirjoitaValinnat(data, seuraavat);
};
</script>

<style scoped lang="scss">
.valinta-rivi {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  cursor: pointer;

  input {
    flex: none;
    width: 1.05rem;
    height: 1.05rem;
    margin-top: 0.15rem;
    accent-color: var(--p-primary-color);
  }
}
</style>
