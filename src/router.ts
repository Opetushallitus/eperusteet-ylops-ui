import Vue from 'vue';
import Router from 'vue-router';
import * as _ from 'lodash';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/RouteHome.vue';
import NotFound from '@/routes/NotFound.vue';
import VirheRoute from '@/routes/virhe/VirheRoute.vue';
import Debug from '@/routes/debug/component.vue';
import HallintaRoute from '@/routes/hallinta/HallintaRoute.vue';

import PohjatRoute from '@/routes/pohjat/PohjatRoute.vue';
import UusiPohjaRoute from '@/routes/pohjat/UusiPohjaRoute.vue';
import PohjanTiedotRoute from '@/routes/pohjat/PohjanTiedotRoute.vue';
import PohjanSisaltoRoute from '@/routes/pohjat/PohjanSisaltoRoute.vue';

import CollapseDebug from '@/routes/debug/collapse.vue';
import AikaleimaDebug from '@/routes/debug/aikaleima.vue';
import EditointiDebug from '@/routes/debug/editointi/editointi.vue';

import { Virheet } from '@/stores/virheet';
import { Kielet, UiKielet } from '@/stores/kieli';
import { Kieli, SovellusVirhe } from '@/tyypit';

Vue.use(Router);

import { createLogger } from '@/stores/logger';
const logger = createLogger('Router');

export const router = new Router({
  routes: [{
    path: '/',
    redirect: (to) => '/fi',
  }, {
    path: '/:lang',
    component: Root,
    children: [{
      path: '',
      name: 'root',
      component: Home,
    }, {
      path: 'admin',
      name: 'admin',
      component: HallintaRoute,
    }, {
      path: 'virhe',
      name: 'virhe',
      component: VirheRoute,
    }, {
      path: 'pohjat',
      component: PohjatRoute,
      children: [{
        path: 'uusi',
        name: 'uusiPohja',
        component: UusiPohjaRoute,
      }, {
        path: ':id',
        component: PohjatRoute,
        children: [{
          path: 'tiedot',
          name: 'pohjanTiedot',
          component: PohjanTiedotRoute,
        }, {
          path: 'sisalto',
          name: 'pohjanSisalto',
          component: PohjanSisaltoRoute,
        }],
      }],
    }, {
      path: 'debug',
      name: 'debug',
      component: Debug,
      children: [{
        path: 'editointi',
        name: 'editointiDebug',
        component: EditointiDebug,
      // }, {
      //   path: 'aikaleima',
      //   name: 'aikaleimaDebug',
      //   component: AikaleimaDebug,
      }],
    }],
  }, {
    path: '*',
    redirect: (to) => {
      return {
        name: 'virhe',
        params: to.params,
        query: {
          // virhe: JSON.stringify({}),
        },
      };
    },
  }],
});

Virheet.onError((virhe: SovellusVirhe) => {
  logger.error('Route error', virhe);
  router.push({
    name: 'virhe',
    query: {
      // virhe: JSON.stringify(virhe),
    },
  });
});


router.beforeEach((to, from, next) => {
  if (to.params.lang
    && to.params.lang !== from.params.lang
    && _.includes(UiKielet, to.params.lang)) {
    Kielet.setUiKieli(to.params.lang as Kieli);
  }
  logger.debug(`Route change ${from.name} -> ${to.name}`, from, to);
  next();
  // else {
  //   router.push({
  //     ...to,
  //     params: {
  //       ...to.params,
  //       lang: i18n.fallbackLocale || 'fi',
  //     },
  //   });
  // }
});
