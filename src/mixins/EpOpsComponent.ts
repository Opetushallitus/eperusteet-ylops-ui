import _ from 'lodash';
import { computed, inject } from 'vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { useHead } from '@unhead/vue';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { Koulutustyyppi } from '@shared/tyypit';
import { $kaanna, $t } from '@shared/utils/globals';

/**
 * Composable for components that need opetussuunnitelma content
 */
export function useEpOpsComponent(opetussuunnitelmaStore: OpetussuunnitelmaStore) {
  // const store = computed(() => opetussuunnitelmaStore);

  // const ops = computed(() => store.value.opetussuunnitelma!);

  const isLops2019 = computed(() => opetussuunnitelmaStore.opetussuunnitelma.value?.toteutus as string === 'lops2019');

  // const opsId = computed(() => ops.value.id!);

  const isPohja = computed(() => opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string === 'pohja');

  const isOps = computed(() => opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string === 'ops');

  const isValmisPohja = computed(() => isPohja.value && opetussuunnitelmaStore.opetussuunnitelma.value?.tila as any === 'valmis');

  const isPohjanTyyppiOps = computed(() => opetussuunnitelmaStore.opetussuunnitelma.value?.pohja?.tyyppi as string === 'ops');

  const isLuva = computed(() => opetussuunnitelmaStore.opetussuunnitelma.value?.koulutustyyppi as string === Koulutustyyppi.lukiovalmistavakoulutus);

  // Meta info using useHead
  const getMetaInfo = () => {
    if (opetussuunnitelmaStore.opetussuunnitelma.value && opetussuunnitelmaStore.opetussuunnitelma.value.nimi && !_.isEmpty($kaanna(opetussuunnitelmaStore.opetussuunnitelma.value.nimi))) {
      return {
        title: $kaanna(opetussuunnitelmaStore.opetussuunnitelma.value.nimi),
        titleTemplate: '%s - ' + $t('eperusteet-ops-tyokalu'),
      };
    }
    else {
      return {
        title: $t('eperusteet-ops-tyokalu'),
        titleTemplate: null,
      };
    }
  };

  useHead(getMetaInfo);

  return {
    store: opetussuunnitelmaStore,
    ops: opetussuunnitelmaStore.opetussuunnitelma.value,
    isLops2019,
    opsId: opetussuunnitelmaStore.opetussuunnitelma.value?.id,
    isPohja,
    isOps,
    isValmisPohja,
    isPohjanTyyppiOps,
    isLuva,
    getMetaInfo,
  };
}
