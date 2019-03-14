import _ from 'lodash';

export function sallittuSiirtyma(tila: string, isPohja = false) {
  switch (_.toLower(tila)) {
  case 'luonnos': return ['valmis', 'poistettu'];
  case 'valmis': return (isPohja ? [] : ['luonnos', 'julkaistu']);
  case 'poistettu': return ['luonnos'];
  case 'julkaistu': return [];
  default: return [];
  }
}
