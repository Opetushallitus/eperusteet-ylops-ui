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
  const store = computed(() => opetussuunnitelmaStore);

  const ops = computed(() => store.value.opetussuunnitelma!);

  const isLops2019 = computed(() => ops.value.toteutus as string === 'lops2019');

  const opsId = computed(() => ops.value.id!);

  const isPohja = computed(() => ops.value.tyyppi as string === 'pohja');

  const isOps = computed(() => ops.value.tyyppi as string === 'ops');

  const isValmisPohja = computed(() => isPohja.value && ops.value.tila as any === 'valmis');

  const isPohjanTyyppiOps = computed(() => ops.value.pohja?.tyyppi as string === 'ops');

  const kasiteHandler = computed(() => {
    return createKasiteHandler(new TermitStore(opsId.value));
  });

  const kuvaHandler = computed(() => {
    return createKuvaHandler(new KuvaStore(opsId.value));
  });

  const isLuva = computed(() => ops.value?.koulutustyyppi as string === Koulutustyyppi.lukiovalmistavakoulutus);

  // Meta info using useHead
  const getMetaInfo = () => {
    if (ops.value && ops.value.nimi && !_.isEmpty($kaanna(ops.value.nimi))) {
      return {
        title: $kaanna(ops.value.nimi),
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
    store,
    ops,
    isLops2019,
    opsId,
    isPohja,
    isOps,
    isValmisPohja,
    isPohjanTyyppiOps,
    kasiteHandler,
    kuvaHandler,
    isLuva,
    getMetaInfo,
  };
}
