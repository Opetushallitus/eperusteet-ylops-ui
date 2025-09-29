<template>
  <ep-main-view>
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
        <div
          v-for="(org, idx) in organisaatiot"
          :key="idx"
          class="form-check form-check-inline"
        >
          <ep-toggle
            :id="org.oid"
            v-model="org.$checked"
          >
            {{ $kaanna(org.nimi) }}
          </ep-toggle>
        </div>
        <p>
          <ep-button
            v-oikeustarkastelu="{ oikeus: 'tilanvaihto', kohde: 'pohja' }"
            class="float-right"
            variant="outline-primary"
            icon="add"
            @click="startKysymysModal(null)"
          >
            {{ $t('lisaa-uusi-kysymys') }}
          </ep-button>
        </p>
      </div>
    </template>

    <!-- Kysymykset-->
    <template #custom-content>
      <div v-if="!isLoading">
        <div
          v-for="kysymys in kysymyksetFormatted"
          :key="kysymys.id"
          class="row"
        >
          <div class="col">
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

    <!-- Kysymyksen poiston vahvistus modal-->
    <b-modal
      id="removeKysymys"
      ref="removeKysymys"
      class="backdrop"
      :lazy="true"
      size="lg"
      @ok="deleteKysymys"
    >
      <span class="mr-2">{{ $t('haluatko-poistaa-kysymyksen') }}</span>
      <template #modal-cancel>
        {{ $t('peruuta') }}
      </template>
      <template #modal-ok>
        {{ $t('poista') }}
      </template>
    </b-modal>

    <!-- Kysymyksen luomisen ja muokkaamisen modaali-->
    <template #after>
      <b-modal
        id="createUpdateKysymys"
        ref="createUpdateKysymys"
        class="backdrop"
        :no-close-on-backdrop="true"
        :no-enforce-focus="true"
        :lazy="true"
        :ok-disabled="$v.kysymys.$invalid"
        size="lg"
        @ok="createUpdateKysymysHandler"
      >
        <template #modal-title>
          <span class="mr-2">{{ kysymys.$uusi ? $t('lisaa-uusi-kysymys') : $t('muokkaa-kysymys') }}</span>
          <!-- Sisällön kieli-->
          <b-dropdown
            class="float-right"
            size="sm"
          >
            <template #button-content>
              <span>{{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}</span>
            </template>
            <b-dropdown-item
              v-for="kieli in sovelluksenKielet"
              :key="kieli"
              :disabled="kieli === sisaltoKieli"
              @click="valitseSisaltoKieli(kieli)"
            >
              {{ kieli }}
            </b-dropdown-item>
          </b-dropdown>
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
          <ep-select
            v-model="kysymys.organisaatiot"
            help="kysymys-organisaatiot-ohje"
            :is-editing="true"
            :items="organisaatiot"
            :multiple="true"
          >
            <template #default="{ item }">
              {{ $kaanna(item.nimi) }}
            </template>
          </ep-select>
        </ep-form-content>
        <template #modal-cancel>
          {{ $t('peruuta') }}
        </template>
        <template #modal-ok>
          {{ kysymys.$uusi ? $t('lisaa-kysymys') : $t('tallenna') }}
        </template>
      </b-modal>
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
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

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
const createUpdateKysymysHandler = async (event: any) => {
  event.preventDefault(); // Piilotetaan modaali myöhemmin
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
