import { Kielet } from '@shared/stores/kieli';
import { buildKatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import * as _ from 'lodash';

const kohdereititys = {
  viite: 'tekstikappale',
  opetussuunnitelma: 'opsTiedot',
  opetussuunnitelma_rakenne: 'jarjesta',
  poppiaine: 'paikallinenOppiaine',
  opintojakso: 'opintojakso',
  termi: 'opsKasitteet',
  perusopetusoppiaine: 'perusopetusoppiaine',
  vuosiluokkakokonaisuus: 'vuosiluokkakokonaisuus',
  oppiaineenvuosiluokka: 'perusopetusoppiainevuosiluokka',
  perusopetuspaikallinenoppiaine: 'perusopetuspaikallinenoppiaine',
};

const kohdeUrl = {
  'peruste': (ops) => buildKatseluUrl(Kielet.getSisaltoKieli.value, `/${koulutustyyppiTheme(ops.koulutustyyppi!)}/${ops.perusteenId}/muutoshistoria?noscroll`),
};

const kohdereititysId = {
  viite: 'osaId',
  poppiaine: 'paikallinenOppiaineId',
  opintojakso: 'opintojaksoId',
  perusopetusoppiaine: 'oppiaineId',
  perusopetuspaikallinenoppiaine: 'oppiaineId',
  vuosiluokkakokonaisuus: 'vlkId',
  oppiaineenvuosiluokka: 'vlId',

};

const kohdeIcon = {
  opetussuunnitelma_rakenne: 'low_priority',
  kommentti: 'comment',
  peruste: 'account_balance',
};

const tapahtumaIcon = {
  paivitys: 'edit',
  luonti: 'add',
  poisto: 'delete',
  palautus: 'keyboard_return',
  julkaisu: 'check',
  virhe: 'error',
};

const poistetutTabIndices = {
  opintojakso: 0,
  poppiaine: 1,
  viite: 2,
};

export function muokkaustietoRoute(id, kohde, tapahtuma, lisaparametrit?) {
  if (tapahtuma === 'poisto') {
    return {
      name: 'opsPoistetut',
      params: {
        tabIndex: poistetutTabIndices[kohde],
      },
    };
  }

  if (!kohdereititys[kohde]) {
    return null;
  }

  const router = {
    name: kohdereititys[kohde],
    params: {},
  };

  if (kohdereititysId[kohde]) {
    router.params[kohdereititysId[kohde]] = id;
  }

  if (lisaparametrit) {
    _.forEach(lisaparametrit, lisaparametri => {
      router.params[kohdereititysId[lisaparametri.kohde]] = lisaparametri.kohdeId;
    });
  }

  return router;
}

export function muokkaustietoUrl(id, kohde, opetussuunnitelma) {
  if (!kohdeUrl[kohde]) {
    return null;
  }

  return kohdeUrl[kohde](opetussuunnitelma);
}

export function muokkaustietoIcon(kohde, tapahtuma, lisatieto = '') {
  return kohdeIcon[kohde] || tapahtumaIcon[tapahtuma] || 'question_mark';
}
