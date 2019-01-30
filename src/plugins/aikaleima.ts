import Vue from 'vue';
import moment from 'moment';

export class Aikaleima {
  public install(vue: typeof Vue) {

    // Long datetime
    vue.prototype.$ldt = function(value: number) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      this.$i18n.locale; // tslint:disable-line
      return moment(value).format('LLL');
    };

    // Long date
    vue.prototype.$ld = function(value: number) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      this.$i18n.locale; // tslint:disable-line
      return moment(value).format('LL');
    };

    // Long time
    vue.prototype.$lt = function(value: number) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      this.$i18n.locale; // tslint:disable-line
      return moment(value).format('H:mm:ss');
    };

    // Short datetime
    vue.prototype.$sdt = function(value: number) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      this.$i18n.locale; // tslint:disable-line
      return moment(value).format('D.M.YYYY H:mm');
    };

    // Short date
    vue.prototype.$sd = function(value: number) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      this.$i18n.locale; // tslint:disable-line
      return moment(value).format('D.M.YYYY');
    };

    // Short time
    vue.prototype.$st = function(value: number) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      this.$i18n.locale; // tslint:disable-line
      return moment(value).format('H:mm');
    };

    vue.prototype.$ago = function(value: number) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      this.$i18n.locale; // tslint:disable-line
      return moment(value).fromNow();
    };

    // Custom datetime
    vue.prototype.$cdt = function(value: number, format: string) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      this.$i18n.locale; // tslint:disable-line
      return moment(value).format(format);
    };

  }
}

export default new Aikaleima();
