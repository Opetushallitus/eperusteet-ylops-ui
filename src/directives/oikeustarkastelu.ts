import Vue from 'vue';
import * as _ from 'lodash';
import { Kayttajat } from '@/stores/kayttaja';

const DisableTags = ['input', 'button'];

export const oikeustarkastelu: Vue.DirectiveOptions = {
  async bind(el, binding) {
    // Hide the element before rights have been resolved
    const old = el.style.display;
    el.style.display = 'none';
    let value = binding.value || 'luku';
    let kohde;
    if (_.isObject(value)) {
      kohde = (value as any).kohde;
      value = (value as any).oikeus;
    }

    if (await Kayttajat.hasOikeus(value, kohde)) {
      el.style.display = old;
    }
    else {
      const { tagName } = el;
      if (_.includes(DisableTags, _.toLower(tagName))) {
        (el as HTMLInputElement).disabled = true;
        el.style.display = old;
      }
    }
  },
};
