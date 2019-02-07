import Vue from 'vue';
import VueI18n from 'vue-i18n';
import * as _ from 'lodash';
import { Store, Getter, Mutation, Action, State } from './store';
import { Kieli } from '@/tyypit';
import { Ulkopuoliset } from '@/api';
import Aikaleima from '@/plugins/aikaleima';
import Kaannos from '@/plugins/kaannos';
import * as moment from 'moment';

import 'moment/locale/fi';
import 'moment/locale/sv';
import 'moment/locale/se';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import { createLogger } from '@/stores/logger';

Vue.use(VueI18n);
Vue.use(Aikaleima);
Vue.use(Kaannos);

const logger = createLogger('Kieli');

export const UiKielet = Object.freeze(_.values(Kieli as object));

moment.locale(Kieli.fi);

export const i18n = new VueI18n({
  fallbackLocale: Kieli.fi,
  locale: Kieli.fi,
  messages: {
    fi: require('@/translations/locale-fi.json'),
    sv: require('@/translations/locale-sv.json'),
  },
});


@Store
class KieliStore {

  @State() private sisaltoKieli: Kieli = Kieli.fi;

  @Getter()
  public getUiKieli() {
    return i18n.locale;
  }

  @Getter()
  public getSisaltoKieli() {
    return this.sisaltoKieli;
  }

  @Mutation()
  public setUiKieli(kieli: Kieli) {
    if (i18n.locale !== kieli && _.includes(UiKielet, kieli)) {
      // this.logger.debug('Ui kieli ->', kieli);
      moment.locale(kieli);
      i18n.locale = kieli;
    }
  }

  @Mutation()
  public setSisaltoKieli(kieli: Kieli) {
    if (this.sisaltoKieli !== kieli && _.includes(UiKielet, kieli)) {
      this.sisaltoKieli = kieli;
    }
  }

  public async init() {
    logger.info('Initing locales');
    _.forEach(await this.fetchLocaleMap(), (locales, lang) => {
      i18n.mergeLocaleMessage(lang, locales);
    });
  }

  private async fetchLocaleMap() {
    try {
      const result: any = {};
      const localeObj = (await Ulkopuoliset.getLokalisoinnit()).data;
      _.forEach(localeObj, (locales, lang) => {
        result[lang] = {};
        for (const locale of locales) {
          if (locale.key && locale.value) {
            result[lang][locale.key] = locale.value;
          }
        }
      });
      return result;
    }
    catch (err) {
      logger.error('Käännösten haku epäonnistui', err.message);
      return {};
    }
  }
}

export const Kielet = new KieliStore();
