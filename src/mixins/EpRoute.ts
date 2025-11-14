import { useEpRoot } from './EpRoot';
import { Murupolku } from '@/stores/murupolku';
import { Location } from 'vue-router';

export function useEpRoute() {
  const epRoot = useEpRoot();

  const breadcrumb = (key: string, value: any, location?: Location) => {
    Murupolku.aseta(key, value, location);
  };

  return {
    ...epRoot,
    breadcrumb,
  };
}
