import Vue from 'vue';
import Router from 'vue-router';
import * as _ from 'lodash';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/component.vue';
import NotFound from '@/routes/NotFound.vue';
import VirheRoute from '@/routes/virhe/VirheRoute.vue';
import Debug from '@/routes/debug/component.vue';
import HallintaRoute from '@/routes/hallinta/HallintaRoute.vue';

import PohjatRoute from '@/routes/pohjat/PohjatRoute.vue';
import UusiPohjaRoute from '@/routes/pohjat/UusiPohjaRoute.vue';
import PohjanTiedotRoute from '@/routes/pohjat/PohjanTiedotRoute.vue';

import CollapseDebug from '@/routes/debug/collapse.vue';
import CkEditorDebug from '@/routes/debug/ckeditor.vue';
import EpContentDebug from '@/routes/debug/epcontent.vue';

import { Virheet } from '@/stores/virheet';
import { i18n, UiKielet } from '@/stores/kieli';
import { SovellusVirhe } from '@/tyypit';

Vue.use(Router);

const router = new Router({
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
        }],
      }],
    }, {
      path: 'debug',
      name: 'debug',
      component: Debug,
      children: [{
        path: 'collapse',
        name: 'collapseDebug',
        component: CollapseDebug,
      }, {
        path: 'ckeditor',
        name: 'ckeditorDebug',
        component: CkEditorDebug,
      }, {
        path: 'epcontent',
        name: 'epcontentDebug',
        component: EpContentDebug,
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

export default router;

Virheet.onError((virhe: SovellusVirhe) => {
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
    i18n.locale = to.params.lang;
  }
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
