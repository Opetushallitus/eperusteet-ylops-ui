import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { computed } from '@vue/composition-api';
import { required } from 'vuelidate/lib/validators';
import { buildKatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import * as _ from 'lodash';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import { OpetussuunnitelmaDto, OpetussuunnitelmaKevytDtoToteutusEnum, Opetussuunnitelmat, OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import { opsTiedotValidator } from '@/validators/ops';

export class OpetussuunnitelmaEditStore implements IEditoitava {
  public static opetussuunnitelmantyyppi: string;

  constructor(
    private opetussuunnitelmaId: number,
    private kaanna: Function,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    const ops = (await Opetussuunnitelmat.getOpetussuunnitelma(this.opetussuunnitelmaId)).data;
    OpetussuunnitelmaEditStore.opetussuunnitelmantyyppi = ops.tyyppi!;
    let pohjanVuosiluokkakokonaisuudet: OpsVuosiluokkakokonaisuusKevytDto[] | null = null;
    if (ops.toteutus === _.toLower(OpetussuunnitelmaKevytDtoToteutusEnum.PERUSOPETUS) && ops.pohja) {
      pohjanVuosiluokkakokonaisuudet = (await Opetussuunnitelmat.getOpetussuunnitelmanPohjanVuosiluokkakokonaisuudet(this.opetussuunnitelmaId)).data;
    }

    return {
      ...ops,
      perusteUrl: buildKatseluUrl(Kielet.getSisaltoKieli.value, `/${koulutustyyppiTheme(ops.koulutustyyppi!)}/${ops.perusteenId}/tiedot`),
      kaikkiOrganisaatiot: {
        kunnat: ops.kunnat,
        jarjestajat: ops.organisaatiot,
        oppilaitokset: ops.organisaatiot,
        ryhmat: [],
      },
      vuosiluokkakokonaisuudet: _.sortBy(ops.vuosiluokkakokonaisuudet, vlk => this.kaanna((vlk.vuosiluokkakokonaisuus?.nimi as any))),
      valittavatVuosiluokkakokonaisuudet: _.chain([
        ...ops.vuosiluokkakokonaisuudet as Array<any>,
        ...(_.filter(pohjanVuosiluokkakokonaisuudet,
          pohjaVlk => !_.includes(_.map(ops.vuosiluokkakokonaisuudet, opsVlk => _.get(opsVlk.vuosiluokkakokonaisuus, '_tunniste')), _.get(pohjaVlk.vuosiluokkakokonaisuus, '_tunniste')))),
      ])
        .sortBy(vlk => this.kaanna((vlk.vuosiluokkakokonaisuus?.nimi as any)))
        .value(),
      oldVuosiluokkakokonaisuudet: ops.vuosiluokkakokonaisuudet,
    };
  }

  async save(data: any) {
    data = {
      ...data,
      kunnat: data.kaikkiOrganisaatiot.kunnat,
      organisaatiot: [
        ...data.kaikkiOrganisaatiot.jarjestajat,
        ...data.kaikkiOrganisaatiot.oppilaitokset,
        ...data.kaikkiOrganisaatiot.ryhmat,
      ],

    };
    const res = await Opetussuunnitelmat.updateOpetussuunnitelma(data.id as number, data as OpetussuunnitelmaDto);
    return res.data;
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return opsTiedotValidator([
      Kielet.getSisaltoKieli.value, // Validoidaan kentät sisältökielen mukaan
    ], OpetussuunnitelmaEditStore.opetussuunnitelmantyyppi === 'ops');
  });
}