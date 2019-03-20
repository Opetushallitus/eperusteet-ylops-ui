import { OrganisaatioTyyppi } from '@/tyypit';
import _ from 'lodash';

export function hasOrganisaatioTyyppi(
  haetut: OrganisaatioTyyppi[],
  tyypit: Array<OrganisaatioTyyppi | string>,
) {
  if (_.isEmpty(haetut)) {
    return false;
  }

  for (const haettu of haetut) {
    if (!_.includes(tyypit, haettu)) {
      return false;
    }
  }
  return true;
}

export function metadataToTeksti(field: string, metadata: any[]) {
  const result: { [lang: string]: string } = {};
  for (const data of metadata) {
    if (data[field]) {
      result[_.toLower(data.kieli)] = data[field];
    }
  }
  return result;
}
