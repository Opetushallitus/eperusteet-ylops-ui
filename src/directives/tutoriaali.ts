import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import Vue, {PluginObject} from 'vue';
import EpTutorial from '@/components/EpTutorial/EpTutorial.vue';

interface VueTutorialParams {
  tutoriaalistore: TutoriaaliStore
}

export const VueTutorial: Vue.PluginObject<VueTutorialParams> = {
  install(Vue, options) {
    if (!options || !options.tutoriaalistore) {
      throw new Error();
    } 

    Vue.directive('tutorial', {
      inserted(el, def) {

        el.setAttribute('tutorial','');
        options.tutoriaalistore.paivitaAvaimet();

      }
    });
  }
};
