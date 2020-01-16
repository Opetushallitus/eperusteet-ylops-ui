import Vue from 'vue';
import Router from 'vue-router';
import { RouteConfig } from 'vue-router';
import _ from 'lodash';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/RouteHome.vue';
import VirheRoute from '@/routes/virhe/VirheRoute.vue';

import RouteDokumentti from '@/routes/opetussuunnitelmat/dokumentti/RouteDokumentti.vue';
import RouteKasite from '@/routes/opetussuunnitelmat/kasite/RouteKasite.vue';
import RouteModuuli from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RouteModuuli.vue';
import RouteOpetussuunnitelma from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelma.vue';
import RouteOpetussuunnitelmaListaus from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelmaListaus.vue';
import RouteOpetussuunnitelmaUusi from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelmaUusi.vue';
import RouteOpintojakso from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/opintojaksot/RouteOpintojakso.vue';
import RouteOppiaine from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RouteOppiaine.vue';
import RouteOppiaineet from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RouteOppiaineet.vue';
import RoutePaikallinenOppiaine from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RoutePaikallinenOppiaine.vue';
import RouteOrganisaatio from '@/routes/organisaatio/RouteOrganisaatio.vue';
import RoutePohjaUusi from '@/routes/opetussuunnitelmat/RoutePohjaUusi.vue';
import RoutePoistetut from '@/routes/opetussuunnitelmat/RoutePoistetut.vue';
import RouteTekstikappale from '@/routes/opetussuunnitelmat/sisalto/tekstikappale/RouteTekstikappale.vue';
import RouteTiedot from '@/routes/opetussuunnitelmat/tiedot/RouteTiedot.vue';
import RouteHallintapaneeli from '@/routes/opetussuunnitelmat/tiedot/RouteHallintapaneeli.vue';
import RouteJarjestys from '@/routes/opetussuunnitelmat/RouteJarjestys.vue';
import RouteJulkaisu from '@/routes/opetussuunnitelmat/RouteJulkaisu.vue';
import RouteTiedotteet from '@/routes/tiedotteet/RouteTiedotteet.vue';
import RouteUkk from '@/routes/ukk/RouteUkk.vue';

import { Virheet } from '@shared/stores/virheet';
import { EditointiKontrolli } from '@/stores/editointi';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Kieli, SovellusVirhe } from '@shared/tyypit';
import { getOpetussuunnitelmaService, OpetussuunnitelmaStore, Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { info } from '@/utils/notifications';
import { changeLang, resolveRouterMetaProps } from '@shared/utils/router';

import { createLogger } from '@shared/utils/logger';
import { tutoriaalistore } from './stores/tutoriaaliStore';
import { VueTutorial } from './directives/tutoriaali';
import { MuokkaustietoStore } from '@/stores/muokkaustieto';
import { AikatauluStore } from './stores/aikataulu';

Vue.use(Router);
Vue.use(VueTutorial, {tutoriaalistore});

const logger = createLogger('Router');

export const router = new Router({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes: [{
    path: '/',
    redirect: () => '/fi',
  }, {
    path: '/:lang',
    component: Root,
    meta: {
      resolve: {
        async props(route) {
          return {
            default: {
              tutoriaalistore: tutoriaalistore,
            },
          };
        },
      },
    },
    children: [{
      path: '',
      name: 'root',
      component: Home,
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
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
    }, {
      path: 'organisaatio',
      name: 'organisaatio',
      component: RouteOrganisaatio,
    }, {
      path: 'ukk',
      name: 'useinkysytyt',
      component: RouteUkk,
    }, {
      path: 'pohjat',
      name: 'pohjaListaus',
      component: RouteOpetussuunnitelmaListaus,
      props: {
        tyyppi: 'pohjat',
      },
    }, {
      path: 'opetussuunnitelmat',
      name: 'opetussuunnitelmaListaus',
      component: RouteOpetussuunnitelmaListaus,
    }, {
      path: 'opetussuunnitelmat/:id',
      name: 'opetussuunnitelma',
      component: RouteOpetussuunnitelma,
      meta: {
        resolve: {
          cacheBy: ['id'],
          async props(route) {
            return {
              default: {
                opetussuunnitelmaStore: getOpetussuunnitelmaService(_.parseInt(route.params.id)),
              },
            };
          },
        },
      },
      children: [{
        path: 'tiedot',
        component: RouteTiedot,
        name: 'opsTiedot',
      }, {
        path: 'yleisnakyma',
        component: RouteHallintapaneeli,
        name: 'yleisnakyma',
        meta: {
          resolve: {
            cacheBy: ['id'],
            async props(route) {
              return {
                default: {
                  muokkaustietoStore: new MuokkaustietoStore(_.parseInt(route.params.id)),
                  aikatauluStore: new AikatauluStore(_.parseInt(route.params.id)),
                },
              };
            },
          },
        },
      }, {
        path: 'julkaisu',
        component: RouteJulkaisu,
        name: 'opsJulkaisu',
      }, {
        path: 'jarjesta',
        component: RouteJarjestys,
        name: 'jarjesta',
      }, {
        path: 'dokumentti',
        component: RouteDokumentti,
        name: 'opsDokumentti',
      }, {
        path: 'poistetut',
        component: RoutePoistetut,
        name: 'opsPoistetut',
      }, {
        path: 'kasitteet',
        component: RouteKasite,
        name: 'opsKasitteet',
      }, {
        path: 'oppiaineet',
        component: RouteOppiaineet,
        name: 'oppiaineet',
      }, {
        path: 'oppiaineet/:oppiaineId',
        component: RouteOppiaine,
        name: 'oppiaine',
      }, {
        path: 'oppiaineet/:oppiaineId/moduulit/:moduuliId',
        component: RouteModuuli,
        name: 'moduuli',
      }, {
        path: 'poppiaineet/:paikallinenOppiaineId',
        component: RoutePaikallinenOppiaine,
        name: 'paikallinenOppiaine',
        meta: {
          parentNavigation: 'oppiaineet',
        },
      }, {
        path: 'opintojaksot/:opintojaksoId',
        component: RouteOpintojakso,
        name: 'opintojakso',
        meta: {
          parentNavigation: 'oppiaineet'
        },
      }, {
        path: 'opintojaksot/:opintojaksoId/:oppiaineKoodi',
        component: RouteOpintojakso,
        name: 'uusi-opintojakso',
      }, {
        path: 'tekstikappaleet/:osaId',
        component: RouteTekstikappale,
        name: 'tekstikappale',
      }],
    }],
  }, {
    path: '*',
    redirect: (to) => {
      logger.error('Unknown route', to);
      return {
        name: 'virhe',
        params: {
          lang: 'fi',
          ...to.params,
        },
        query: {
          viesti: 'virhe-route',
          virhe: to.path,
        },
      };
    },
  }],
});

Virheet.onError((virhe: SovellusVirhe) => {
  router.push({
    name: 'virhe',
    query: {
      virhe: JSON.stringify(virhe),
    },
  });
});

// Estetään ikkunan sulkeminen suoraan muokkaustilassa
window.addEventListener('beforeunload', e => {
  if (EditointiKontrolli.anyEditing()) {
    e.preventDefault();
    // Vanhemmat selainversiot vaativat erillisen varmistustekstin
    e.returnValue = Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti');
  }
});

// Estetään tilan vaihtaminen muokkaustilassa
router.beforeEach(async (to, from, next) => {
  if (EditointiKontrolli.anyEditing()) {
    const value = await router.app.$bvModal.msgBoxConfirm(
      Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti-dialogi'),
      {
        title: Kielet.kaannaOlioTaiTeksti('haluatko-poistua-tallentamatta'),
        okTitle: Kielet.kaannaOlioTaiTeksti('poistu-tallentamatta'),
        cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
        size: 'lg',
      });

    if (value) {
      try {
        await EditointiKontrolli.cancelAll();
      }
      finally {
        next();
      }
    }
  }
  else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  changeLang(to, from);
  next();
});

router.beforeEach(async (to, from, next) => {
  await resolveRouterMetaProps(to);
  next();
});
