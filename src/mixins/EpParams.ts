import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import _ from 'lodash';

export function useEpParams() {
  const router = useRouter();
  const route = useRoute();

  const navigateTo = async (name: string, params: object = {}) => {
    await router.push({
      name,
      params: {
        ...route.params,
        ...params,
      },
    });
  };

  const params = computed((): any => {
    return {
      ...route.params,
      id: _.parseInt(route.params.id as string),
      moduuliId: _.parseInt(route.params.moduuliId as string) || undefined,
      opintojaksoId: _.parseInt(route.params.opintojaksoId as string) || undefined,
      oppiaineId: _.parseInt(route.params.oppiaineId as string) || undefined,
      osaId: _.parseInt(route.params.osaId as string) || undefined,
    } as any;
  });

  return {
    navigateTo,
    params,
  };
}
