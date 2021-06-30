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
};

const kohdereititysId = {
  viite: 'osaId',
  poppiaine: 'paikallinenOppiaineId',
  opintojakso: 'opintojaksoId',
  perusopetusoppiaine: 'oppiaineId',
  vuosiluokkakokonaisuus: 'vlkId',
  oppiaineenvuosiluokka: 'vlId',

};

const kohdeIcon = {
  viite: 'kyna',
  opetussuunnitelma: 'opetussuunnitelma',
  opetussuunnitelma_rakenne: 'jarjesta',
  termi: 'kasitteet',
  kommentti: 'kommentti',
};

const tapahtumaIcon = {
  paivitys: 'kyna',
  luonti: 'plussa',
  poisto: 'roskalaatikko',
  palautus: 'peruuta',
  julkaisu: 'julkaisu',
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

  return tapahtumaIcon[tapahtuma] ? tapahtumaIcon[tapahtuma] : 'kysymysmerkki';
}
