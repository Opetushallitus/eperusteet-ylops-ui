import { computed, provide } from 'vue';
import { useRoute } from 'vue-router';
import { useEpRoute } from './EpRoute';
import { OpetussuunnitelmaStore, Opetussuunnitelma } from '@/stores/opetussuunnitelma';
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

  const store = computed(() => opetussuunnitelmaStore);

  const ops = computed(() => store.value.opetussuunnitelma!);

  const opsId = computed(() => store.value.opetussuunnitelma!.id!);

  const isPohja = computed(() => store.value.opetussuunnitelma?.tyyppi as string === 'pohja');

  const isOps = computed(() => store.value.opetussuunnitelma?.tyyppi as string === 'ops');

  const isValmisPohja = computed(() => isPohja.value && ops.value.tila as any === 'valmis');

  const kasiteHandler = computed(() => {
    return createKasiteHandler(new TermitStore(_.toNumber(route.params.id)));
  });

  const kuvaHandler = computed(() => {
    return createKuvaHandler(new KuvaStore(_.toNumber(route.params.id)));
  });

  const isLuva = computed(() => ops.value?.koulutustyyppi as string === Koulutustyyppi.lukiovalmistavakoulutus);

  // Provide reactive handlers
  provide('kasiteHandler', kasiteHandler);
  provide('kuvaHandler', kuvaHandler);

  return {
    ...epRoute,
    store,
    ops,
    opsId,
    isPohja,
    isOps,
    isValmisPohja,
    kasiteHandler,
    kuvaHandler,
    isLuva,
  };
}
