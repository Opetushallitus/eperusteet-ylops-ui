import _ from 'lodash';
import Vue from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import VueMeta from 'vue-meta';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/RouteHome.vue';
import EpErrorPage from '@shared/components/EpErrorPage/EpErrorPage.vue';
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
import RouteYleisnakyma from '@/routes/opetussuunnitelmat/tiedot/RouteYleisnakyma.vue';
import RouteJarjestys from '@/routes/opetussuunnitelmat/RouteJarjestys.vue';
import RouteJulkaisu from '@/routes/opetussuunnitelmat/RouteJulkaisu.vue';
import RouteTiedotteet from '@/routes/tiedotteet/RouteTiedotteet.vue';
import RouteUkk from '@/routes/ukk/RouteUkk.vue';
import RouteOppaat from '@/routes/oppaat/RouteOppaat.vue';
import RouteVuosiluokkakokonaisuus from '@/routes/opetussuunnitelmat/sisalto/RouteVuosiluokkakokonaisuus.vue';
import RoutePerusopetusOppiaine from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RoutePerusopetusOppiaine.vue';
import RoutePerusopetusPaikallinenOppiaine from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RoutePerusopetusPaikallinenOppiaine.vue';
import RoutePerusopetusPaikallinenOppiaineVuosiluokka from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RoutePerusopetusPaikallinenOppiaineVuosiluokka.vue';
import RoutePerusopetusOppiaineVuosiluokkaistaminen from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RoutePerusopetusOppiaineVuosiluokkaistaminen.vue';
import RoutePerusopetusOppiaineVuosiluokka from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RoutePerusopetusOppiaineVuosiluokka.vue';
import RoutePerusopetusVuosiluokkaValinnaiset from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RoutePerusopetusVuosiluokkaValinnaiset.vue';

import { Kielet } from '@shared/stores/kieli';
import { changeLang, convertRouteParamsToNumbers } from '@shared/utils/router';

import { createLogger } from '@shared/utils/logger';
import { MuokkaustietoStore } from '@/stores/muokkaustieto';
import { AikatauluStore } from '../stores/aikataulu';
import { Kommentit } from '@/stores/kommentit';
import VueApexCharts from 'vue-apexcharts';
import { getCasKayttajaKieli } from '@shared/api/common';
import { Opetussuunnitelmat } from '@shared/api/ylops';
import { BrowserStore } from '@shared/stores/BrowserStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { useLoading } from 'vue-loading-overlay';
import { loadingOptions } from '@/utils/loading';
import { stores } from '@/stores';
import { $bvModal, $success } from '@shared/utils/globals';

const logger = createLogger('Router');

const props = (route: any) => {
  return {
    ...convertRouteParamsToNumbers(route.params),
    ...convertRouteParamsToNumbers(route.query),
    ...stores,
  };
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/:lang',
    alias: ['/', ''],
    component: Root,
    props,
    children: [{
      name: 'vaihdapohja',
      path: 'maintenance/opetussuunnitelma/:opsId/pohja/:pohjaId',
      redirect: (to) => {
        const opsId = Number(to.params.opsId);
        const pohjaId = Number(to.params.pohjaId);
        Opetussuunnitelmat.vaihdaPohja(opsId, pohjaId).then(() => {
          $success('Pohja vaihdettu');
        });
        return {
          name: 'root',
        };
      },
    }, {
      path: '',
      name: 'root',
      component: Home,
      props,
    }, {
      path: 'virhe',
      name: 'virhe',
      component: EpErrorPage,
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
      path: 'oppaat',
      name: 'oppaat',
      component: RouteOppaat,
    }, {
      path: 'pohjat',
      name: 'pohjaListaus',
      component: RouteOpetussuunnitelmaListaus,
      props: {
        tyyppi: 'pohja',
      },
    }, {
      path: 'opetussuunnitelmat',
      name: 'opetussuunnitelmaListaus',
      component: RouteOpetussuunnitelmaListaus,
    }, {
      path: 'opetussuunnitelmat/:id',
      name: 'opetussuunnitelma',
      component: RouteOpetussuunnitelma,
      props,
      children: [{
        path: 'tiedot',
        component: RouteTiedot,
        name: 'opsTiedot',
        props,
      }, {
        path: 'yleisnakyma',
        component: RouteYleisnakyma,
        name: 'yleisnakyma',
        props,
      }, {
        path: 'julkaisu',
        component: RouteJulkaisu,
        name: 'julkaise',
        props,
      }, {
        path: 'jarjesta',
        component: RouteJarjestys,
        name: 'jarjesta',
        props,
      }, {
        path: 'dokumentti',
        component: RouteDokumentti,
        name: 'opsDokumentti',
        props,
      }, {
        path: 'poistetut',
        component: RoutePoistetut,
        name: 'opsPoistetut',
        props,
      }, {
        path: 'kasitteet',
        component: RouteKasite,
        name: 'opsKasitteet',
        props,
      }, {
        path: 'oppiaineet',
        component: RouteOppiaineet,
        name: 'oppiaineet',
        props,
      }, {
        path: 'oppiaineet/:oppiaineId',
        component: RouteOppiaine,
        name: 'oppiaine',
        props,
      }, {
        path: 'oppiaineet/:oppiaineId/moduulit/:moduuliId',
        component: RouteModuuli,
        name: 'moduuli',
        props,
      }, {
        path: 'poppiaineet/:paikallinenOppiaineId',
        component: RoutePaikallinenOppiaine,
        name: 'paikallinenOppiaine',
        meta: {
          parentNavigation: 'oppiaineet',
        },
        props,
      }, {
        path: 'poppiaineet/:paikallinenOppiaineId/:oppiaineKoodi',
        component: RoutePaikallinenOppiaine,
        name: 'uusi-paikallinen-oppiaine',
        props,
      }, {
        path: 'opintojaksot/:opintojaksoId',
        component: RouteOpintojakso,
        name: 'opintojakso',
        meta: {
          parentNavigation: 'oppiaineet',
        },
        props,
      }, {
        path: 'opintojaksot/:opintojaksoId/:oppiaineKoodi',
        component: RouteOpintojakso,
        name: 'uusi-opintojakso',
        props,
      }, {
        path: 'tekstikappaleet/:osaId',
        component: RouteTekstikappale,
        name: 'tekstikappale',
        props,
      }, {
        path: 'vuosiluokkakokonaisuus/:vlkId',
        component: RouteVuosiluokkakokonaisuus,
        name: 'vuosiluokkakokonaisuus',
        props,
      }, {
        path: 'vuosiluokkakokonaisuus/:vlkId/oppiaine/:oppiaineId',
        component: RoutePerusopetusOppiaine,
        name: 'perusopetusoppiaine',
        props,
      }, {
        path: 'vuosiluokkakokonaisuus/:vlkId/poppiaine/:oppiaineId',
        component: RoutePerusopetusPaikallinenOppiaine,
        name: 'perusopetuspaikallinenoppiaine',
        props,
      }, {
        path: 'vuosiluokkakokonaisuus/:vlkId/poppiaine/:oppiaineId/vuosiluokka/:vuosiluokkaId',
        component: RoutePerusopetusPaikallinenOppiaineVuosiluokka,
        name: 'perusopetuspaikallinenoppiainevuosiluokka',
        props,
      }, {
        path: 'vuosiluokkakokonaisuus/:vlkId/oppiaine/:oppiaineId/vuosiluokkaistaminen',
        component: RoutePerusopetusOppiaineVuosiluokkaistaminen,
        name: 'perusopetusoppiainevuosiluokkaistaminen',
        props,
      }, {
        path: 'vuosiluokkakokonaisuus/:vlkId/oppiaine/:oppiaineId/vuosiluokka/:vlId',
        component: RoutePerusopetusOppiaineVuosiluokka,
        name: 'perusopetusoppiainevuosiluokka',
        props,
      }, {
        path: 'vuosiluokkakokonaisuus/:vlkId/valinnaiset',
        component: RoutePerusopetusVuosiluokkaValinnaiset,
        name: 'perusopetusvalinnaiset',
        props,
      },
      ],
    }],
  }, {
    path: '/:catchAll(.*)',
    redirect: (to) => {
      logger.error('Unknown route', to);
      return {
        name: 'virhe',
        query: {
          virhekoodi: '404',
        },
      };
    },
  }],
});

// Estetään ikkunan sulkeminen suoraan muokkaustilassa
window.addEventListener('beforeunload', e => {
  if (EditointiStore.anyEditing()) {
    e.preventDefault();
    // Vanhemmat selainversiot vaativat erillisen varmistustekstin
    e.returnValue = Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti');
  }
});

router.beforeEach((to, from, next) => {
  const hash = window.location.hash;

  if (hash.includes('%2F')) {
    const decoded = decodeURIComponent(hash).replace('//', '/');
    window.location.replace(window.location.pathname + window.location.search + decoded);
    window.location.reload();
  }
  else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (!EditointiStore.anyEditing()) {
    loaders.push($loading.show());
  }
  next();
});

// Estetään tilan vaihtaminen muokkaustilassa
router.beforeEach(async (to, from, next) => {
  if (EditointiStore.anyEditing()) {
    const value = await $bvModal.msgBoxConfirm(
      Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti-dialogi'), {
        title: Kielet.kaannaOlioTaiTeksti('haluatko-poistua-tallentamatta'),
        okTitle: Kielet.kaannaOlioTaiTeksti('poistu-tallentamatta'),
        cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
        size: 'lg',
      });

    if (value) {
      try {
        await EditointiStore.cancelAll();
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

router.beforeEach(async (to, from, next) => {
  if (!_.get(to.params, 'lang')) {
    router.replace({ path: '/' + await getCasKayttajaKieli() });
  }

  next();
});

router.beforeEach((to, from, next) => {
  changeLang(to, from);
  next();
});

router.beforeEach(async (to, from, next) => {
  await Kommentit.clearThread();
  next();
});

router.beforeEach(async (to, from, next) => {

  if (to.params.id && to.params.id !== from.params.id) {
    const opsId = _.parseInt(to.params.id);
    window.scrollTo(0, 0);
    try {
      stores.opetussuunnitelmaStore.clear();
      stores.muokkaustietoStore.clear();
      stores.aikatauluStore.clear();
      await Promise.all([
        stores.opetussuunnitelmaStore.init(opsId),
        stores.muokkaustietoStore.init(opsId),
        stores.aikatauluStore.init(opsId),
        stores.termitStore.init(opsId),
      ]);
    }
    catch (err) {
      console.error(err);
      throw err;
    }
  }

  next();
});

const $loading = useLoading(loadingOptions);
const loaders: any[] = [];

router.afterEach(() => {
  hideLoading();
  BrowserStore.changeLocation(location.href);
});

function hideLoading() {
  if (loaders.length > 0) {
    (loaders[loaders.length - 1] as any).hide();
    loaders.pop();
  }
}

export default router;
