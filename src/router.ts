import Vue from 'vue';
import Router from 'vue-router';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/component.vue';
import Route404 from '@/routes/debug/component.vue';
import VirheRoute from '@/routes/virhe/component.vue';
import Debug from '@/routes/debug/component.vue';
import About from '@/routes/about/component.vue';

import CollapseDebug from '@/routes/debug/collapse.vue';
import CKEditorDebug from '@/routes/debug/ckeditor.vue';

import { Virheet } from '@/stores/virheet';
import { SovellusVirhe } from '@/tyypit';

Vue.use(Router);

const router = new Router({
  routes: [{
    path: '/',
    redirect: (to) => '/fi',
  }, {
    path: '/:lang',
    name: 'root',
    component: Root,
    children: [{
      path: 'home',
      name: 'home',
      component: Home,
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
      }],
    }],
  }, {
    path: '*',
    name: 'unknown',
    component: Route404,
  }],
});

export default router;


Virheet.onError((virhe: SovellusVirhe) => {
  router.push({
    name: 'virhe',
    query: {
      virhe: JSON.stringify(virhe),
    },
  });
});


router.beforeResolve((to, from, next) => {
  // console.info('Resolve', to, from);
  next();
});


router.beforeEach((to, from, next) => {
  // console.info('Each', to, from);
  next();
});
