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
              v-for="(ryhma, ryhmaIndex) in ryhmat(supportData?.tavoitealueet)"
              :key="'ryhma' + (ryhma.otsikko?.id || ryhmaIndex)"
            >
              <label
                v-if="ryhma.otsikko?.otsikko?.uri"
                class="valinta-rivi"
              >
                <input
                  type="checkbox"
                  :checked="isRyhmaValittu(data, supportData?.tavoitealueet, ryhma)"
                  @change="asetaRyhma(data, supportData?.tavoitealueet, ryhma, ruutuValittu($event))"
                >
                <span>{{ $kaanna(ryhma.otsikko.otsikko.nimi) || $t('tavoitealue') }}</span>
              </label>
              <div
                v-for="alue in ryhmanRivit(ryhma)"
                :key="'alue' + alue.id"
                :class="{ 'ml-6': !!ryhma.otsikko && !onOtsikko(alue) }"
              >
                <label
                  v-if="naytaAlueenOtsikko(ryhma, alue)"
                  class="valinta-rivi"
                >
                  <input
                    type="checkbox"
                    :checked="isAlueValittu(data, supportData?.tavoitealueet, alue)"
                    @change="asetaAlue(data, supportData?.tavoitealueet, alue, ruutuValittu($event))"
                  >
                  <span>{{ $kaanna(alue.otsikko.nimi) || $t('tavoitealue') }}</span>
                </label>
                <div
                  v-for="(tavoite, index) in alue.tavoitteet"
                  :key="'tavoite' + alue.id + '-' + index"
                  :class="{ 'ml-6': naytaAlueenOtsikko(ryhma, alue) }"
                >
                  <label
                    v-if="tavoite?.uri"
                    class="valinta-rivi"
                  >
                    <input
                      type="checkbox"
                      :checked="onTavoiteValittu(data, supportData?.tavoitealueet, alue, index)"
                      @change="asetaTavoite(data, supportData?.tavoitealueet, alue, index, ruutuValittu($event))"
                    >
                    <span>{{ $kaanna(tavoite.nimi) }}</span>
                  </label>
                </div>
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
const valitutAvaimet = ref<string[] | null>(null);
let valintojenData: any = null;
let avaimetAlustettu = false;

watch(() => route.params.opintokokonaisuusId, () => {
  valintojenData = null;
  tallennetutValinnat.value = null;
  valitutAvaimet.value = null;
  avaimetAlustettu = false;
  init();
}, { immediate: true });

const ruutuValittu = (event: Event) => (event.target as HTMLInputElement).checked;

const valinnat = (data: any) => {
  if (valintojenData !== data) {
    valintojenData = data;
    tallennetutValinnat.value = [...(data?.tavoitealueValinnat || [])];
    valitutAvaimet.value = null;
    avaimetAlustettu = false;
  }
  return tallennetutValinnat.value || [];
};

const avainOtsikko = (alue: any) => `otsikko:${alue?.id}`;

const avainTavoite = (alue: any, index: number) => `tavoite:${alue?.id}:${index}`;

const sisaltaaAvaimen = (avaimet: string[], avain: string) => avaimet.includes(avain);

const alueenUrit = (tavoitealue: any) => {
  return new Set(_.filter([
    tavoitealue?.otsikko?.uri,
    ..._.map(tavoitealue?.tavoitteet, 'uri'),
  ]));
};

const luoAvaimet = (tallennetut: any[], alueet: any[]) => {
  const avaimet: string[] = [];
  alueet.forEach(alue => {
    const urit = new Set(tallennetut
      .filter(valinta => samaAlue(valinta.tavoitealueId, alue.id))
      .map(valinta => valinta.koodiUri));
    if (alue.otsikko?.uri && urit.has(alue.otsikko.uri)) {
      avaimet.push(avainOtsikko(alue));
    }
    _.forEach(alue.tavoitteet, (tavoite, index: number) => {
      if (tavoite?.uri && urit.has(tavoite.uri)) {
        avaimet.push(avainTavoite(alue, index));
      }
    });
  });
  return avaimet;
};

const kaytettavatAvaimet = (data: any, alueet: any[] = []) => {
  const tallennetut = valinnat(data);
  if (!avaimetAlustettu) {
    valitutAvaimet.value = luoAvaimet(tallennetut, alueet);
    if (alueet.length > 0 || tallennetut.length === 0) {
      avaimetAlustettu = true;
    }
  }
  return valitutAvaimet.value || [];
};

const samaAlue = (id: any, toinen: any) => String(id) === String(toinen);

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
  const alueet = supportData?.tavoitealueet || [];
  const avaimet = kaytettavatAvaimet(data, alueet);
  return _.chain(alueet)
    .map(alue => {
      const tavoitteet = _.filter(alue.tavoitteet, (tavoite, index: number) => sisaltaaAvaimen(avaimet, avainTavoite(alue, index)));
      const otsikko = sisaltaaAvaimen(avaimet, avainOtsikko(alue));
      const tuntematon = _.some(valinnat(data), valinta => samaAlue(valinta.tavoitealueId, alue.id) && !alueenUrit(alue).has(valinta.koodiUri));
      if (!otsikko && tavoitteet.length === 0 && !tuntematon) {
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

const tavoiteUrit = (tavoitealue: any) => {
  return _.filter(_.map(tavoitealue.tavoitteet, 'uri'));
};

const onOtsikko = (tavoitealue: any) => tavoitealue?.tavoiteAlueTyyppi === 'OTSIKKO';

const ryhmat = (alueet: any[] = []) => {
  const tulos: Array<{ otsikko: any, sisalto: any[] }> = [];
  let ryhma: { otsikko: any, sisalto: any[] } | null = null;
  alueet.forEach(alue => {
    if (onOtsikko(alue)) {
      ryhma = { otsikko: alue, sisalto: [] };
      tulos.push(ryhma);
    }
    else if (ryhma) {
      ryhma.sisalto.push(alue);
    }
    else {
      tulos.push({ otsikko: null, sisalto: [alue] });
    }
  });
  return tulos;
};

const ryhmanRivit = (ryhma: { sisalto: any[] }) => ryhma.sisalto;

const ryhmaAlueelle = (alueet: any[], alue: any) => {
  return _.find(ryhmat(alueet), ryhma => {
    return (ryhma.otsikko && samaAlue(ryhma.otsikko.id, alue.id))
      || _.some(ryhma.sisalto, sisalto => samaAlue(sisalto.id, alue.id));
  });
};

const naytaAlueenOtsikko = (ryhma: { otsikko: any }, alue: any) => {
  if (onOtsikko(alue) || !alue.otsikko?.uri) {
    return false;
  }
  return !ryhma.otsikko || tavoiteUrit(alue).length === 0;
};

const onTavoiteValittu = (data: any, alueet: any[], alue: any, index: number) => {
  return sisaltaaAvaimen(kaytettavatAvaimet(data, alueet), avainTavoite(alue, index));
};

const alueenAvaimet = (alue: any) => {
  const avaimet = alue.otsikko?.uri ? [avainOtsikko(alue)] : [];
  _.forEach(alue.tavoitteet, (tavoite, index: number) => {
    if (tavoite?.uri) {
      avaimet.push(avainTavoite(alue, index));
    }
  });
  return avaimet;
};

const ilmanAluetta = (avaimet: string[], alue: any) => {
  const poistettavat = new Set(alueenAvaimet(alue));
  return avaimet.filter(avain => !poistettavat.has(avain));
};

const alueValituksi = (avaimet: string[], alue: any, valittu: boolean) => {
  const jaljella = ilmanAluetta(avaimet, alue);
  if (!valittu) {
    return jaljella;
  }
  return [...jaljella, ...alueenAvaimet(alue)];
};

const alueessaOnSisaltoa = (avaimet: string[], alue: any) => {
  const tavoitteita = _.some(alue.tavoitteet, (tavoite, index: number) => tavoite?.uri && sisaltaaAvaimen(avaimet, avainTavoite(alue, index)));
  if (tavoitteita) {
    return true;
  }
  return !onOtsikko(alue) && !!alue.otsikko?.uri && sisaltaaAvaimen(avaimet, avainOtsikko(alue));
};

const isAlueValittu = (data: any, alueet: any[], alue: any) => {
  const avaimet = kaytettavatAvaimet(data, alueet);
  if (alue.otsikko?.uri && sisaltaaAvaimen(avaimet, avainOtsikko(alue))) {
    return true;
  }
  return _.some(alue.tavoitteet, (tavoite, index: number) => sisaltaaAvaimen(avaimet, avainTavoite(alue, index)));
};

const isRyhmaValittu = (data: any, alueet: any[], ryhma: { otsikko: any, sisalto: any[] }) => {
  const avaimet = kaytettavatAvaimet(data, alueet);
  if (ryhma.otsikko?.otsikko?.uri && sisaltaaAvaimen(avaimet, avainOtsikko(ryhma.otsikko))) {
    return true;
  }
  return _.some(ryhma.sisalto, alue => alueessaOnSisaltoa(avaimet, alue))
    || _.some(ryhma.otsikko?.tavoitteet, (tavoite, index: number) => sisaltaaAvaimen(avaimet, avainTavoite(ryhma.otsikko, index)));
};

const kirjoitaAvaimet = (data: any, alueet: any[], avaimet: string[]) => {
  avaimetAlustettu = true;
  valitutAvaimet.value = avaimet;
  const seuraavat: any[] = [];
  alueet.forEach(alue => {
    const urit = new Set<string>();
    if (sisaltaaAvaimen(avaimet, avainOtsikko(alue)) && alue.otsikko?.uri) {
      urit.add(alue.otsikko.uri);
    }
    _.forEach(alue.tavoitteet, (tavoite, index: number) => {
      if (tavoite?.uri && sisaltaaAvaimen(avaimet, avainTavoite(alue, index))) {
        urit.add(tavoite.uri);
      }
    });
    if (!onOtsikko(alue) && alue.otsikko?.uri && alueessaOnSisaltoa(avaimet, alue)) {
      urit.add(alue.otsikko.uri);
    }
    urit.forEach(koodiUri => seuraavat.push({ tavoitealueId: alue.id, koodiUri }));
  });
  valinnat(data).forEach(valinta => {
    const alue = _.find(alueet, kohde => samaAlue(kohde.id, valinta.tavoitealueId));
    const tuntematon = !alue || !alueenUrit(alue).has(valinta.koodiUri);
    const joMukana = seuraavat.some(oleva => samaAlue(oleva.tavoitealueId, valinta.tavoitealueId) && oleva.koodiUri === valinta.koodiUri);
    if (tuntematon && !joMukana) {
      seuraavat.push({ tavoitealueId: valinta.tavoitealueId, koodiUri: valinta.koodiUri });
    }
  });
  tallennetutValinnat.value = seuraavat;
  data.tavoitealueValinnat = seuraavat;
};

const paivitaRyhmanOtsikko = (avaimet: string[], ryhma?: { otsikko: any, sisalto: any[] }) => {
  if (!ryhma?.otsikko?.otsikko?.uri) {
    return avaimet;
  }
  const jaljella = _.some(ryhma.sisalto, alue => alueessaOnSisaltoa(avaimet, alue))
    || _.some(ryhma.otsikko.tavoitteet, (tavoite, index: number) => sisaltaaAvaimen(avaimet, avainTavoite(ryhma.otsikko, index)));
  const ilman = avaimet.filter(avain => avain !== avainOtsikko(ryhma.otsikko));
  return jaljella ? [...ilman, avainOtsikko(ryhma.otsikko)] : ilman;
};

const asetaRyhma = (data: any, alueet: any[] = [], ryhma: { otsikko: any, sisalto: any[] }, valittu: boolean) => {
  let avaimet = kaytettavatAvaimet(data, alueet);
  if (ryhma.otsikko) {
    avaimet = alueValituksi(avaimet, ryhma.otsikko, valittu);
  }
  ryhma.sisalto.forEach(alue => {
    avaimet = alueValituksi(avaimet, alue, valittu);
  });
  kirjoitaAvaimet(data, alueet, avaimet);
};

const asetaAlue = (data: any, alueet: any[], alue: any, valittu: boolean) => {
  let avaimet = alueValituksi(kaytettavatAvaimet(data, alueet), alue, valittu);
  avaimet = paivitaRyhmanOtsikko(avaimet, ryhmaAlueelle(alueet, alue));
  kirjoitaAvaimet(data, alueet, avaimet);
};

const asetaTavoite = (data: any, alueet: any[], tavoitealue: any, index: number, valittu: boolean) => {
  const avain = avainTavoite(tavoitealue, index);
  let avaimet = kaytettavatAvaimet(data, alueet).filter(oleva => oleva !== avain);
  if (valittu) {
    avaimet.push(avain);
  }
  if (!onOtsikko(tavoitealue)) {
    const tavoitteita = _.some(tavoitealue.tavoitteet, (tavoite, tavoiteIndex: number) => {
      return tavoite?.uri && sisaltaaAvaimen(avaimet, avainTavoite(tavoitealue, tavoiteIndex));
    });
    avaimet = avaimet.filter(oleva => oleva !== avainOtsikko(tavoitealue));
    if (tavoitteita && tavoitealue.otsikko?.uri) {
      avaimet.push(avainOtsikko(tavoitealue));
    }
  }
  avaimet = paivitaRyhmanOtsikko(avaimet, ryhmaAlueelle(alueet, tavoitealue));
  kirjoitaAvaimet(data, alueet, avaimet);
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
