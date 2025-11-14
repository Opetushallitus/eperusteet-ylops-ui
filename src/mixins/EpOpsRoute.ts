import { computed, provide } from 'vue';
import { useRoute } from 'vue-router';
import { useEpRoute } from './EpRoute';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import _ from 'lodash';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { Koulutustyyppi } from '@shared/tyypit';

/**
 * Composable for route components that need opetussuunnitelma content
 */
export function useEpOpsRoute(opetussuunnitelmaStore: OpetussuunnitelmaStore) {
  const route = useRoute();
  const epRoute = useEpRoute();

  const isPohja = computed(() => opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string === 'pohja');

  const isOps = computed(() => opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string === 'ops');

  const isValmisPohja = computed(() => isPohja.value && opetussuunnitelmaStore.opetussuunnitelma.value?.tila as any === 'valmis');

  const isLuva = computed(() => opetussuunnitelmaStore.opetussuunnitelma.value?.koulutustyyppi as string === Koulutustyyppi.lukiovalmistavakoulutus);

  return {
    ...epRoute,
    store: opetussuunnitelmaStore,
    ops: opetussuunnitelmaStore.opetussuunnitelma.value,
    opsId: opetussuunnitelmaStore.opetussuunnitelma.value?.id,
    isPohja,
    isOps,
    isValmisPohja,
    isLuva,
  };
}
