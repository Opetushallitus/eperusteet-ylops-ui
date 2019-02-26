import Vue from 'vue';
import Router from 'vue-router';
import * as _ from 'lodash';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/RouteHome.vue';
import NotFound from '@/routes/NotFound.vue';
import VirheRoute from '@/routes/virhe/VirheRoute.vue';
import Debug from '@/routes/debug/component.vue';
import HallintaRoute from '@/routes/hallinta/HallintaRoute.vue';

import RouteOpetussuunnitelma from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelma.vue';
import RoutePohjaUusi from '@/routes/opetussuunnitelmat/RoutePohjaUusi.vue';
import RouteOpetussuunnitelmaUusi from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelmaUusi.vue';
import RouteTiedot from '@/routes/opetussuunnitelmat/tiedot/RouteTiedot.vue';
import RouteSisalto from '@/routes/opetussuunnitelmat/sisalto/RouteSisalto.vue';
import RouteTekstikappale from '@/routes/opetussuunnitelmat/sisalto/tekstikappale/RouteTekstikappale.vue';
import RouteOppiaineet from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RouteOppiaineet.vue';
import UnderConstruction from '@/routes/UnderConstruction.vue';

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
      path: 'uusi/pohja',
      name: 'uusiPohja',
      component: RoutePohjaUusi,
    }, {
      path: 'uusi/opetussuunnitelma',
      name: 'uusiOpetussuunnitelma',
      component: RouteOpetussuunnitelmaUusi,
    }, {
      path: 'opetussuunnitelmat/:id',
      name: 'opetussuunnitelma',
      component: RouteOpetussuunnitelma,
      children: [{
        path: 'tiedot',
        component: RouteTiedot,
        name: 'opsTiedot',
      }, {
        path: 'dokumentti',
        component: UnderConstruction,
        name: 'opsDokumentti',
      }, {
        path: 'poistetut',
        component: UnderConstruction,
        name: 'opsPoistetut',
      }, {
        path: 'kasitteet',
        component: UnderConstruction,
        name: 'opsKasitteet',
      }, {
        path: 'oppiaineet',
        component: RouteOppiaineet,
        name: 'oppiaineet',
      }, {
        path: 'tekstikappale/:osaId',
        component: RouteTekstikappale,
        name: 'tekstikappale',
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
