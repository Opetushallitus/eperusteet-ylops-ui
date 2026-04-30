<template>
  <ep-main-view container>
    <!-- Rajaimet-->
    <template #header>
      <h1>{{ $t('ukk') }}</h1>
      <p>{{ $t('ukk-kuvaus-nakyma') }}</p>
      <ep-spinner v-if="isLoading" />
      <div v-else>
        <ep-search
          v-model="rajain"
          class="mb-3"
        />
        <p>{{ $t('ukk-luoja-rajaus') }}:</p>
        <div class="flex flex-wrap gap-1">
          <div
            v-for="(org, idx) in organisaatiot"
            :key="idx"
          >
            <ep-toggle
              :id="org.oid"
              v-model="org.$checked"
            >
              {{ $kaanna(org.nimi) }}
            </ep-toggle>
          </div>
        </div>
        <p>
          <EpButton
            v-oikeustarkastelu="{ oikeus: 'tilanvaihto', kohde: 'pohja' }"
            class="float-right"
            variant="outline-primary"
            icon="add"
            @click="startKysymysModal(null)"
          >
            {{ $t('lisaa-uusi-kysymys') }}
          </EpButton>
        </p>
      </div>
    </template>

    <!-- Kysymykset-->
    <template #custom-content>
      <div
        v-if="!isLoading"
        class="mt-12"
      >
        <div
          v-for="kysymys in kysymyksetFormatted"
          :key="kysymys.id"
          class="w-full"
        >
          <div class="w-full min-w-0">
            <div
              v-oikeustarkastelu="{ oikeus: 'tilanvaihto', kohde: 'pohja' }"
              class="float-right"
            >
              <button
                class="btn btn-link"
                @click="startKysymysModal(kysymys)"
              >
                <EpMaterialIcon>edit</EpMaterialIcon>
              </button>
              <button
                class="btn btn-link"
                @click="startRemoveKysymys(kysymys)"
              >
                <EpMaterialIcon>close</EpMaterialIcon>
              </button>
            </div>
            <div>
              <p class="text-secondary">
                {{ $ago(kysymys.luotu) }}
              </p>
              <h5 v-html="$kaanna(kysymys.kysymys)" />
              <p class="text-secondary">
                <ep-content
                  layout="normal"
                  :model-value="kysymys.vastaus"
                />
              </p>
              <hr>
            </div>
          </div>
        </div>
      </div>
    </template>

    <EpModal
      id="removeKysymys"
      ref="removeKysymys"
      class="backdrop"
      size="lg"
      :ok-text="$t('poista')"
      :cancel-text="$t('peruuta')"
      @ok="deleteKysymys"
    >
      <template #modal-title>
        {{ $t('haluatko-poistaa-kysymyksen') }}
      </template>
    </EpModal>

    <!-- Kysymyksen luomisen ja muokkaamisen modaali-->
    <template #after>
      <EpModal
        id="createUpdateKysymys"
        ref="createUpdateKysymys"
        class="backdrop"
        size="lg"
        :ok-disabled="$v.kysymys.$invalid"
        :ok-text="kysymys.$uusi ? $t('lisaa-kysymys') : $t('tallenna')"
        :cancel-text="$t('peruuta')"
        @ok="createUpdateKysymysHandler"
      >
        <template #modal-title>
          <div class="flex flex-wrap items-center justify-between gap-2 w-full">
            <span>{{ kysymys.$uusi ? $t('lisaa-uusi-kysymys') : $t('muokkaa-kysymys') }}</span>
            <EpDropdown class="shrink-0">
              <template #button-content>
                <span>{{ $t('kieli-sisalto') }}: {{ sisaltoKieli }}</span>
              </template>
              <EpDropdownItem
                v-for="kieli in sovelluksenKielet"
                :key="kieli"
                :disabled="kieli === sisaltoKieli"
                @click="valitseSisaltoKieli(kieli as Kieli)"
              >
                {{ $t(kieli) }}
              </EpDropdownItem>
            </EpDropdown>
          </div>
        </template>
        <ep-form-content name="kysymys-nimi">
          <ep-content
            v-model="kysymys.kysymys"
            help="kysymys-nimi-ohje"
            layout="normal"
            :validation="$v.kysymys.kysymys"
            :is-editable="true"
          />
        </ep-form-content>
        <ep-form-content name="kysymys-vastaus">
          <ep-content
            v-model="kysymys.vastaus"
            help="kysymys-vastaus-ohje"
            layout="normal"
            :validation="$v.kysymys.vastaus"
            :is-editable="true"
          />
        </ep-form-content>
        <ep-form-content name="nayta-organisaatioissa">
          <ep-multi-select
            v-model="kysymys.organisaatiot"
            help="kysymys-organisaatiot-ohje"
            :is-editing="true"
            :options="organisaatiot"
            :multiple="true"
            label="nimi"
            track-by="oid"
            :searchable="false"
            open-direction="top"
          >
            <!-- <template #tag="{ option, remove }">
              <span class="mr-2 border-1 border-solid px-2 py-1 rounded-md">
                {{ $kaanna(option.nimi) }}
              </span>
            </template>

            <template #option="{ option }">
              {{ $kaanna(option.nimi) }}
            </template> -->
          </ep-multi-select>
        </ep-form-content>
      </EpModal>
    </template>
  </ep-main-view>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, useTemplateRef, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { Kysymykset, Ulkopuoliset, KysymysDto } from '@shared/api/ylops';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Kieli } from '@shared/tyypit';
import { kysymysValidator } from '@/validators/ukk';
import { organizations } from '@/utils/organisaatiot';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpDropdown from '@shared/components/EpDropdown/EpDropdown.vue';
import EpDropdownItem from '@shared/components/EpDropdown/EpDropdownItem.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';

export interface KysymysLaajennettuDto extends KysymysDto {
  $uusi?: boolean;
}

const rajain = ref('');
const kysymykset = ref<KysymysLaajennettuDto[]>([]);
const orgs = ref<any[]>([]);
const kysymys = ref<KysymysLaajennettuDto>({
  $uusi: true,
  organisaatiot: [],
});

const removeKysymys = useTemplateRef('removeKysymys');
const createUpdateKysymys = useTemplateRef('createUpdateKysymys');

const validator = computed(() => {
  return kysymysValidator([
    Kielet.getSisaltoKieli.value, // Validoidaan kentät sisältökielen mukaan
  ]);
});

const $v = useVuelidate({
  kysymys: validator,
}, { kysymys });

const isLoading = ref(true);

onMounted(async () => {
  kysymykset.value = (await Kysymykset.getKysymykset() as any).data;

  // Haetaan käyttäjän organisaatiot
  const orgsData = (await Ulkopuoliset.getUserOrganisations() as any).data;

  if (!_.find(orgsData, o => o.oid === organizations.oph.oid)) {
    orgsData.push(organizations.oph);
  }

  // Ei rajausta oletuksena
  _.each(orgsData, o => {
    o.$checked = true;
  });

  orgs.value = orgsData;

  isLoading.value = false;
});

const kysymyksetFormatted = computed(() => {
  return _(kysymykset.value)
    // Suodata kysymyksellä
    .filter((k: any) => _.includes(
      _.toLower(_.get(k, 'kysymys.' + Kielet.getSisaltoKieli.value)),
      _.toLower(rajain.value),
    ))
    // Suodata organisaatiolla
    .filter((k: any) => {
      // Tehdään lista valituista organisaatioista
      const checked: string[] = [];
      _.each(organisaatiot.value, org => {
        if (org.$checked) {
          checked.push(org.oid);
        }
      });

      // Tarkistetaan, löytyykö organisaatio haettavien joukosta
      let found = false;
      const kOrgs = _.map(k.organisaatiot, 'oid');
      _.each(checked, oid => {
        found = found || _.includes(kOrgs, oid);
      });

      return found;
    })
    .map(k => ({
      ...k,
      organisaatiot: _.map(k.organisaatiot, org => _.find(orgs.value, o => o.oid === org.oid) || org),
    }))
    .sortBy((k: any) => -k.luotu) // Laskeva järjestys
    .value();
});

const organisaatiot = computed(() => {
  return _.sortBy(orgs.value, o => _.get(o, 'nimi.' + Kielet.getSisaltoKieli.value));
});

const organisaatiotOptions = computed(() => {
  return _.map(organisaatiot.value, o => _.get(o, 'nimi.' + Kielet.getSisaltoKieli.value));
});

// Luodaan uusi kysymys tai muokataan kysymystä riippuen tilanteesta
const createUpdateKysymysHandler = async () => {
  try {
    if (kysymys.value.id) {
      // Muokataan olemassa olevaa
      const res = (await Kysymykset.updateKysymys(kysymys.value.id, kysymys.value) as any).data;
      _.remove(kysymykset.value, k => k.id === res.id);
      kysymykset.value.push(res);
    }
    else {
      // Luodaan uusi kysymys
      const res = (await Kysymykset.createKysymys(kysymys.value) as any).data;
      kysymykset.value.push(res);
    }
    createUpdateKysymys.value?.hide();
  }
  catch (e) {
    // Todo: Tallentaminen epäonnistui
  }
};

// Poistetaan olemassa oleva kysymys
const deleteKysymys = async () => {
  if (!kysymys.value || !kysymys.value.id) {
    return;
  }

  try {
    await Kysymykset.deleteKysymys(kysymys.value.id);
    _.remove(kysymykset.value, k => k.id === kysymys.value.id);
    // Reaktiivisuus täytyy hoitaa käsin tässä tilanteessa
    kysymykset.value = [
      ...kysymykset.value,
    ];
  }
  catch (e) {
    // Todo: Poistaminen epäonnistui
  }
};

// Aloitetaan kysymyksen muokkaamisen modaali
const startKysymysModal = (kysymysParam: KysymysLaajennettuDto | null) => {
  if (kysymysParam) {
    kysymys.value = {
      $uusi: false,
      ..._.cloneDeep(kysymysParam),
    };
  }
  else {
    kysymys.value = {
      organisaatiot: [],
      $uusi: true,
    };
  }
  createUpdateKysymys.value?.show();
};

// Aloitetaan kysymyksen poiston modaali
const startRemoveKysymys = (kysymysParam: KysymysLaajennettuDto) => {
  kysymys.value = {
    $uusi: false,
    ..._.cloneDeep(kysymysParam),
  };
  removeKysymys.value?.show();
};

// TODO: tämä voisi olla oma komponentti
// Modaalin kielivalitsimen metodit
const sisaltoKieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const sovelluksenKielet = computed(() => {
  return UiKielet;
});

const valitseSisaltoKieli = (kieli: Kieli) => {
  Kielet.setSisaltoKieli(kieli);
};
</script>

<style scoped lang="scss">

.qty {
  user-select: all;
}

.btn-link {
  text-decoration: none;
}

</style>
