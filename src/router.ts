import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/routes/home/component.vue';
import About from '@/routes/about/component.vue';

import CollapseDebug from '@/routes/debug/collapse.vue';
import CKEditorDebug from '@/routes/debug/ckeditor.vue';

Vue.use(Router);

export default new Router({
  routes: [{
    path: '/',
    name: 'home',
    component: Home,
  }, {
    path: '/about',
    name: 'about',
    component: About,
  }, {
    path: '/debug/collapse',
    name: 'collapseDebug',
    component: CollapseDebug,
  }, {
    path: '/debug/ckeditor',
    name: 'ckeditorDebug',
    component: CKEditorDebug,
  }],
});
