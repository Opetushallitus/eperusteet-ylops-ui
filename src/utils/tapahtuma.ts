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
  viite: 'edit',
  opetussuunnitelma: 'article',
  opetussuunnitelma_rakenne: 'low_priority',
  termi: 'book',
  kommentti: 'comment',
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

export function muokkaustietoIcon(kohde, tapahtuma) {
  if (kohde === 'kommentti' || kohde === 'opetussuunnitelma_rakenne') {
    return kohdeIcon[kohde];
  }

  return tapahtumaIcon[tapahtuma] ? tapahtumaIcon[tapahtuma] : 'question_mark';
}
