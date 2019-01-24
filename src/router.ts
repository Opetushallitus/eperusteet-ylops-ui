import Vue from 'vue';
import Router from 'vue-router';
import * as _ from 'lodash';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/component.vue';
import VirheRoute from '@/routes/virhe/component.vue';
import Debug from '@/routes/debug/component.vue';
import AdminRoute from '@/routes/admin/AdminRoute.vue';

import CollapseDebug from '@/routes/debug/collapse.vue';
import CKEditorDebug from '@/routes/debug/ckeditor.vue';
import EpContentDebug from '@/routes/debug/epcontent.vue';
import AikaleimaDebug from '@/routes/debug/aikaleima.vue';

import { Virheet } from '@/stores/virheet';
import { Kielet, UiKielet } from '@/stores/kieli';
import { Kieli, SovellusVirhe } from '@/tyypit';

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
      component: AdminRoute,
    }, {
      path: 'virhe',
      name: 'virhe',
      component: VirheRoute,
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
        component: CKEditorDebug,
      }, {
        path: 'epcontent',
        name: 'epcontentDebug',
        component: EpContentDebug,
      }, {
        path: 'aikaleima',
        name: 'aikaleimaDebug',
        component: AikaleimaDebug,
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
    Kielet.setUiKieli(to.params.lang as Kieli);
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
