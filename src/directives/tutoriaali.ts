import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

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
        el.setAttribute('tutorial', '');
        options.tutoriaalistore.paivitaAvaimet();
      },
    });
  },
};
