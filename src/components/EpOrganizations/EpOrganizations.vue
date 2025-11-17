<template>
  <div class="organisaatiot">
    <ep-form-content :show-header="false">
      <div class="selectors">
        <div class="form-group required mb-4">
          <label>{{ $t('kunnat') }} *</label>
          <ep-multi-list-select
            v-model="valitutKunnat"
            tyyppi="kunta"
            :items="kunnatSelectOptions"
            :is-loading="kunnat.length === 0"
            :required="true"
            :equality="kuntaEquals"
            @update:model-value="updateKunnat"
          />
        </div>
      </div>

      <div
        class="selectors mb-4"
        :class="{'disabled-events': valitutKunnat.length === 0}"
      >
        <label>{{ $t('jarjestajat') }} *</label>
        <ep-multi-list-select
          v-model="valitutJarjestajat"
          tyyppi="koulutuksen-jarjestaja"
          :items="jarjestajatSelectOptions"
          :is-loading="kunnatLoading"
          :required="true"
          :equality="jarjestajaEquals"
          @update:model-value="updateJarjestajat"
        />
      </div>

      <div
        class="selectors mb-4"
        :class="{'disabled-events': valitutJarjestajat.length === 0}"
      >
        <div class="d-flex">
          <label>{{ $t('oppilaitokset') }}</label>
          <slot name="oppilaitokset-label-suffix" />
        </div>
        <ep-multi-list-select
          v-model="valitutOppilaitokset"
          tyyppi="oppilaitos"
          :items="oppilaitoksetSelectOptions"
          :is-loading="jarjestajatLoading || kunnatLoading"
          :equality="jarjestajaEquals"
          @update:model-value="updateOppilaitokset"
        />
      </div>
    </ep-form-content>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import * as _ from 'lodash';
import { minLength, required } from '@vuelidate/validators';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiListSelect from '@shared/components/forms/EpMultiListSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { Kielet } from '@shared/stores/kieli';
import { koulutustyypinOppilaitokset } from '@/utils/perusteet';
import { metadataToTeksti } from '@/utils/organisaatiot';
import { Ulkopuoliset } from '@shared/api/ylops';
import { Koulutustyyppi } from '@shared/tyypit';
import { $kaanna, $t } from '@shared/utils/globals';

interface ValueType {
  jarjestajat: any[];
  oppilaitokset: any[];
  kunnat: any[];
  ryhmat: any[];
}

const props = defineProps<{
  modelValue: ValueType;
  koulutustyyppi?: string | null;
  sallitutLakkautetutOrganisaatiot?: string[];
}>();

const emit = defineEmits(['update:modelValue']);

const kayttajanOrganisaatiot = ref<any>({});
const kunnat = ref<any[]>([]);
const jarjestajat = ref<any[]>([]);
const oppilaitokset = ref<any[]>([]);
const valitutKunnat = ref<any[]>([]);
const valitutJarjestajat = ref<any[]>([]);
const valitutOppilaitokset = ref<any[]>([]);

const kunnatLoading = ref<boolean>(false);
const jarjestajatLoading = ref<boolean>(false);
const ryhmatLoading = ref<boolean>(false);

const query = ref({
  jarjestajat: '',
  oppilaitokset: '',
  kunnat: '',
});

const taiteenperusopetus = computed(() => {
  return props.koulutustyyppi === Koulutustyyppi.tpo;
});

const validationConfig = computed(() => {
  return {
    valitutKunnat: {
      required,
      'min-length': minLength(1),
    },
    valitutJarjestajat: {
      required,
      'min-length': minLength(1),
    },
  };
});

const filterAndSort = (orgs: any[], queryText: string) => {
  return _.chain(orgs)
    .filter(org => Kielet.search(queryText, org.nimi))
    .map(org => _.omit(org, 'children'))
    .sortBy(org => Kielet.kaanna(org.nimi))
    .value();
};

const filteredKunnat = computed(() => {
  return filterAndSort(kunnat.value, query.value.kunnat);
});

const kunnatSelectOptions = computed(() => {
  return _.chain(filteredKunnat.value)
    .map(org => {
      return {
        value: org,
        text: $kaanna((org as any).nimi),
        unselectable: false,
        child: false,
      };
    })
    .value();
});

const filteredJarjestajat = computed(() => {
  return filterAndSort(jarjestajat.value, query.value.jarjestajat);
});

const jarjestajatSelectOptions = computed(() => {
  return _.chain(filteredJarjestajat.value)
    .map(org => {
      return {
        value: org,
        text: $kaanna((org as any).nimi),
        unselectable: false,
        child: false,
      };
    })
    .value();
});

const filteredOppilaitokset = computed(() => {
  return filterAndSort(oppilaitokset.value, query.value.oppilaitokset);
});

const oppilaitoksetSelectOptions = computed(() => {
  return _.chain(filteredOppilaitokset.value)
    .filter(org => _.includes(props.sallitutLakkautetutOrganisaatiot || [], org.oid) || org.status !== 'PASSIIVINEN')
    .map(org => {
      return {
        value: org,
        text: $kaanna((org as any).nimi) + (org.status === 'PASSIIVINEN' ? ` (${$t('lakkautettu')})` : ''),
        unselectable: false,
        child: false,
      };
    })
    .value();
});

const kuntaEquals = computed(() => {
  return (val1: any, val2: any) => _.isEqual(_.get(val1, 'koodiUri'), _.get(val2, 'koodiUri'));
});

const jarjestajaEquals = computed(() => {
  return (val1: any, val2: any) => _.isEqual(_.get(val1, 'oid'), _.get(val2, 'oid'));
});

const updateInput = () => {
  emit('update:modelValue', {
    kunnat: valitutKunnat.value,
    jarjestajat: valitutJarjestajat.value,
    oppilaitokset: valitutOppilaitokset.value,
    ryhmat: [],
  });
};

const updateOppilaitokset = (valitut: any[]) => {
  valitutOppilaitokset.value = valitut;
  updateInput();
};

const updateJarjestajat = (valitut: any[]) => {
  jarjestajatLoading.value = true;
  valitutJarjestajat.value = valitut;
  const valitutJarjestajaList = _.filter(jarjestajat.value, (jarjestaja) => _.includes(_.map(valitut, 'koodiUri'), jarjestaja.koodiUri));
  oppilaitokset.value = _.chain(valitutJarjestajaList)
    .map('children')
    .flatten()
    .map(oppilaitos => {
      return {
        ...oppilaitos,
        tyypit: ['Oppilaitos'],
      };
    })
    .sortBy((org: any) => Kielet.kaanna(org.nimi))
    .value();
  const jarjestajaOids = _.map(valitutJarjestajat.value, 'oid');

  valitutOppilaitokset.value = _.chain(valitutOppilaitokset.value)
    .filter(valittuOppilaitos => _.find(oppilaitokset.value, oppilaitos => jarjestajaEquals.value(oppilaitos, valittuOppilaitos)))
    .map(valittuOppilaitos => _.find(oppilaitokset.value, oppilaitos => jarjestajaEquals.value(oppilaitos, valittuOppilaitos)))
    .filter(valittuOppilaitos => _.includes(jarjestajaOids, valittuOppilaitos.parentOid))
    .value();

  updateOppilaitokset(valitutOppilaitokset.value);
  updateInput();
  jarjestajatLoading.value = false;
};

const updateKunnat = async (kunnatList: any[]) => {
  kunnatLoading.value = true;
  valitutKunnat.value = kunnatList;
  jarjestajat.value = _.chain((await Ulkopuoliset.getKoulutustoimijat(
    _.map(kunnatList, 'koodiUri'),
    koulutustyypinOppilaitokset(props.koulutustyyppi))).data)
    .sortBy((org: any) => Kielet.kaanna(org.nimi))
    .value();

  const kuntaUris = _.map(kunnatList, 'koodiUri');

  valitutJarjestajat.value = _.filter(
    valitutJarjestajat.value,
    valittuJarjestaja => _.some(jarjestajat.value, jarjestaja => jarjestajaEquals.value(jarjestaja, valittuJarjestaja)),
  );

  updateJarjestajat(valitutJarjestajat.value);
  kunnatLoading.value = false;
};

const update = async () => {
  const kunnatData = (await Ulkopuoliset.kaikkiKoodistonKoodit('kunta')).data;
  kunnat.value = _.chain(kunnatData)
    .map((kunta: any) => ({
      ...kunta,
      nimi: metadataToTeksti('nimi', kunta.metadata),
    }))
    .sortBy(org => Kielet.kaanna(org.nimi))
    .value();
};

const kouluryhmaChange = async () => {
  valitutJarjestajat.value = [];
  valitutOppilaitokset.value = [];
};

watch(() => props.modelValue, async (value) => {
  valitutKunnat.value = value.kunnat;
  valitutJarjestajat.value = value.jarjestajat;
  valitutOppilaitokset.value = value.oppilaitokset;
}, { immediate: true });

onMounted(async () => {
  await update();
});

</script>

<style scoped lang="scss">
.selectors {
  margin-top: 25px;

  h6 {
    color: #555;

    &.required {
      font-weight: bolder;
    }
  }

}
</style>
