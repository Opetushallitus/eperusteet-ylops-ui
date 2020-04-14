import { OrganisaatioTyyppi } from '@shared/tyypit';
import _ from 'lodash';

export function hasOrganisaatioTyyppi(
  haetut: OrganisaatioTyyppi[],
  tyypit: Array<OrganisaatioTyyppi | string>
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

export const OphOid = '1.2.246.562.10.00000000001';

export const organizations = Object.freeze({
  oph: {
    nimi: {
      fi: 'Opetushallitus',
      sv: 'Utbildningsstyrelsen',
      en: 'Finnish National Agency for Education',
    },
    oid: OphOid,
  },
});
