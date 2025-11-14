<template>
  <div class="kasitteet">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">
        {{ $t('kasitteet') }}
      </h2>
    </div>
    <ep-spinner v-if="isLoading" />
    <div
      v-else
      class="sisalto"
    >
      <div class="otsikko-toiminnot">
        <ep-search
          v-model="hakusana"
          class="mb-3"
        />
        <div class="lisaysnappi">
          <button @click="avaaMuokkausModal(null)">
            <EpMaterialIcon class="mr-2">
              add
            </EpMaterialIcon>
            <span>{{ $t('lisaa-kasite') }}</span>
          </button>
        </div>
      </div>
      <div class="kasitelista">
        <div
          v-for="(k, idx) in suodatettuTermisto"
          :key="idx"
          class="kasite"
        >
          <ep-content
            class="termi"
            :class="{ closed: k.closed, open: !k.closed }"
            :model-value="k.kasite.termi"
            layout="simplified"
          />
          <ep-content
            class="selitys"
            :class="{ closed: k.closed, open: !k.closed }"
            :model-value="k.kasite.selitys"
            layout="normal"
          />
          <div class="toiminnot">
            <button
              class="btn btn-link"
              @click="avaaPoistoModal(k.kasite)"
            >
              <EpMaterialIcon>delete</EpMaterialIcon>
            </button>
            <button
              class="btn btn-link"
              @click="avaaMuokkausModal(k.kasite)"
            >
              <EpMaterialIcon>edit</EpMaterialIcon>
            </button>
            <button
              class="btn btn-link"
              @click="k.closed = !k.closed"
            >
              <EpMaterialIcon v-if="k.closed">
                expand_more
              </EpMaterialIcon>
              <EpMaterialIcon v-else>
                expand_less
              </EpMaterialIcon>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Käsitteen poisto modal-->
    <b-modal
      id="kasitteenPoistoModal"
      ref="kasitteenPoistoModal"
      class="backdrop"
      :lazy="true"
      size="lg"
      @ok="poistaKasite"
    >
      <span class="mr-2">{{ $t('haluatko-poistaa-kasitteen') }}</span><template #modal-cancel>
        {{ $t('peruuta') }}
      </template><template #modal-ok>
        {{ $t('poista') }}
      </template>
    </b-modal>
    <!-- Käsitteen luomisen ja muokkaamisen modaali-->
    <b-modal
      id="kasitteenLuontiModal"
      ref="kasitteenLuontiModal"
      class="backdrop"
      :no-close-on-backdrop="true"
      :no-enforce-focus="true"
      :lazy="true"
      :ok-disabled="validation.$invalid"
      size="lg"
      @ok="tallennaKasite"
    >
      <template #modal-title>
        <span class="mr-2">{{ kasite.id ? $t('muokkaa-kasitetta') : $t('lisaa-uusi-kasite') }}</span><!-- Sisällön kieli--><b-dropdown
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
            @click="valitseSisaltoKieli(kieli as Kieli)"
          >
            {{ kieli }}
          </b-dropdown-item>
        </b-dropdown>
      </template>
      <ep-form-content name="kasite-termi">
        <ep-input
          v-model="kasite.termi"
          type="localized"
          help="kasite-termi-ohje"
          :validation="validation.termi"
          :is-editing="true"
        />
      </ep-form-content>
      <ep-form-content name="kasite-selitys">
        <ep-content
          v-model="kasite.selitys"
          help="kasite-selitys-ohje"
          :validation="validation.selitys"
          :is-editable="true"
          layout="normal"
        />
      </ep-form-content>
      <ep-form-content name="alaviite">
        <ep-toggle v-model="kasite.alaviite">
          {{ $t('merkitse-kasite-alaviitteeksi') }}
        </ep-toggle>
      </ep-form-content><template #modal-cancel>
        {{ $t('peruuta') }}
      </template><template #modal-ok>
        {{ kasite.id ? $t('tallenna') : $t('lisaa-kasite') }}
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { TermiDto, Termisto } from '@shared/api/ylops';
import { kasiteValidator } from '@/validators/kasite';
import { Kieli } from '@shared/tyypit';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t } from '@shared/utils/globals';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { TermitStore } from '@/stores/TermitStore';

interface Kasite {
  kasite: TermiDto;
  closed: boolean;
}


const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
  termitStore: TermitStore;
}>();

// Use composables
const store = computed(() => props.opetussuunnitelmaStore);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);
const isLoading = computed(() => false); // Not needed from the route mixin
// Template refs
const kasitteenPoistoModal = ref();
const kasitteenLuontiModal = ref();

// Reactive data
const termisto = ref<Kasite[]>([]);
const kasite = ref<TermiDto>({});
const hakusana = ref<string>('');

const avaaMuokkausModal = (kasiteParam: TermiDto | null) => {
  if (!kasiteParam) {
    kasite.value = {
      termi: {},
    };
  }
  else {
    kasite.value = _.cloneDeep(kasiteParam);
  }
  kasitteenLuontiModal.value?.show();
};

const avaaPoistoModal = (kasiteParam: TermiDto) => {
  kasite.value = _.cloneDeep(kasiteParam);
  kasitteenPoistoModal.value?.show();
};

const poistaKasite = async () => {
  if (!kasite.value || !kasite.value.id) {
    return;
  }

  try {
    await Termisto.deleteTermi(opsId.value, kasite.value.id);
    _.remove(termisto.value, k => k.kasite.id === kasite.value.id);
    termisto.value = [...termisto.value];
    await store.value.updateSisalto();
  }
  catch (err) {
    // Todo: Termin poisto epäonnistui
  }
};

const makeKey = (item: TermiDto) => {
  var termi = _.first(_.compact(_.values(item.termi))) || '';
  return termi.replace(/[^a-zA-Z0-9]/g, '') + new Date().getTime();
};

const tallennaMuuttunut = async (kasiteId: number) => {
  // Tallennetaan muokattu käsite
  const res = await Termisto.updateTermi(
    opsId.value,
    kasiteId,
    kasite.value,
  );
  _.remove(termisto.value, termi => termi.kasite.id === kasiteId);
  termisto.value.push({
    closed: true,
    kasite: res.data,
  });
};

const tallennaUusi = async () => {
  // Luodaan uusi käsite + lisätään sille avain
  if (!kasite.value.avain) {
    kasite.value.avain = makeKey(kasite.value);
  }
  const res = await Termisto.addTermi(opsId.value, kasite.value);
  termisto.value.push({
    closed: true,
    kasite: res.data,
  });
};

const tallennaKasite = async (e: Event) => {
  e.preventDefault();

  try {
    if (kasite.value.id) {
      await tallennaMuuttunut(kasite.value.id);
    }
    else {
      await tallennaUusi();
    }

    // Päivitetään OPS:n sisällä oleva käsitelista
    await store.value.updateSisalto();
    kasitteenLuontiModal.value?.hide();
    props.termitStore.init(opsId.value);
  }
  catch (err) {
    // Todo: Tallennus epäonnistui
  }
};

const init = async () => {
  try {
    const resp = await Termisto.getAllTermit(opsId.value);
    termisto.value = resp.data.map(kasiteItem => {
      return { closed: true, kasite: kasiteItem };
    });
  }
  catch (err) {
    // Todo: Termien lataus epäonnistui
  }
};

const suodatettuTermisto = computed(() => {
  const hakutermi = _.toLower(hakusana.value);
  const kieli = Kielet.getSisaltoKieli.value;

  return termisto.value.filter(termi => _.includes(
    _.toLower(
      _.get(termi, 'kasite.termi.' + kieli) + ' ' + _.get(termi, 'kasite.selitys.' + kieli),
    ),
    hakutermi,
  ));
});

const validator = computed(() => {
  return kasiteValidator([
    Kielet.getSisaltoKieli.value, // Validoidaan kentät sisältökielen mukaan
  ]);
});

const $v = useVuelidate(
  { kasite: validator.value },
  { kasite },
);

const validation = computed(() => $v.value.kasite);

const sisaltoKieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const sovelluksenKielet = computed(() => {
  return UiKielet;
});

const valitseSisaltoKieli = (kieli: Kieli) => {
  Kielet.setSisaltoKieli(kieli);
};

// Initialize on mount
onMounted(async () => {
  await init();
});

</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.kasitteet {
  //margin-top: 4px;

  .ylapaneeli {
    border-bottom: 1px solid #eee;
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    padding: 15px;
  }
}

.otsikko-toiminnot {
  display: flex;

  .has-search {
    flex: 1 1 0%;
  }

  .lisaysnappi {
    flex: 1 1 20%;
    text-align: right;

    button {
      border: 0;
      outline: 0;
      background-color: transparent;

      span {
        vertical-align: text-top;
      }

      svg {
        width: 25px;
        height: 25px;
        vertical-align: middle;
        color: #0041dc;
      }
    }
  }
}

.kasitelista {
  display:flex;
  flex-wrap: wrap;
}

.kasite:nth-child(odd) {
  background-color: #f3f3f3;
}

.kasite {
  padding: 5px 15px;
  display: flex;
  align-items: top;
  width: 100%;
  line-height: 2.5em;

  .termi {
    flex-grow: 2;
    font-weight: 600;
    width: 6em;
    min-width: auto;
  }

  .termi.closed {
    white-space: nowrap;

    :deep(div) {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .selitys {
    margin-left: 10px;
    flex-grow: 6;
    width: 10em;
    min-width: auto;
    overflow: hidden;
    line-height: 1.5em;

    :deep(img) {
      max-width: 100%;
    }

  }

  .selitys.open {
    margin-top: 0.5em;
  }

  .selitys.closed {
    height: 2.5em;
    line-height: 2.5em;
    white-space: nowrap;
    text-overflow: ellipsis;

    :deep(p) {
      margin: 0;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .toiminnot {
    flex-grow: 1;
    text-align: right;
    width: 7em;
  }
  .toiminnot svg {
    color: #222;
  }
}
</style>
