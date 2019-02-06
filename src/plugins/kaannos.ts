import Vue from 'vue';
import moment from 'moment';
import _ from 'lodash';

class Kaannos {
  public install(vue: typeof Vue) {
    // Sisältö Translate
    vue.prototype.$st = function(value: string | object) {
      if (!value) {
        return '';
      }
      else if (_.isObject(value)) {
        const locale = this.$i18n.locale;
        return (value as any)[locale];
      }
      else {
        return value;
      }
    };

  }
}

export default new Kaannos();
