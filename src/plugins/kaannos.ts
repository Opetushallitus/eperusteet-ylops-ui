import Vue from 'vue';
import moment from 'moment';
import _ from 'lodash';
import { createLogger } from '@/stores/logger';


const logger = createLogger('Kaannos');
const Varoitus = '"$kaanna" on tekstiolioiden kääntämiseen. Käytä vue-i18n vastaavaa funktiota. Esimerkiksi "$t()".';

class Kaannos {
  public install(vue: typeof Vue) {
    // Sisällön kääntäminen
    vue.prototype.$kaanna = function(value: object) {
      if (!value) {
        return '';
      }
      else if (_.isObject(value)) {
        const locale = this.$i18n.locale;
        return (value as any)[locale];
      }
      else {
        logger.warn(Varoitus, 'Käännös:', '"' + value + '"');
        return value;
      }
    };

  }
}

export default new Kaannos();
