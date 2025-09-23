import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import { $t, $bvModal } from '@shared/utils/globals';

export function useEpRoot() {
  const route = useRoute();
  const mIsLoading = ref(true);

  // Meta info using useHead
  const getMetaInfo = () => {
    if (route && route.name) {
      return {
        title: $t('route-' + route.name),
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

  const vahvista = async (title = 'vahvista-toiminto', msg = 'vahvista-toiminto-viesti', okTitle = 'kylla', config: any = {}) => {
    return await $bvModal.msgBoxConfirm($t(msg) as any, {
      title: $t(title),
      okVariant: 'primary',
      okTitle: $t(okTitle) as any,
      cancelVariant: 'link',
      cancelTitle: $t('peruuta') as any,
      centered: true,
      ...config,
    });
  };

  const loading = async (fn: () => Promise<void>) => {
    mIsLoading.value = true;
    try {
      await fn();
    }
    catch (err) {
      // ei tehdä mitään
    }
    finally {
      mIsLoading.value = false;
    }
  };

  const isLoading = computed(() => mIsLoading.value);

  const init = async () => {
    // Default empty implementation
  };

  onMounted(async () => {
    await loading(init);
  });

  return {
    isLoading,
    vahvista,
    loading,
    init,
    getMetaInfo,
  };
}
