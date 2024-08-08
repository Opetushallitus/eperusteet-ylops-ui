import _ from 'lodash';
import { State, Store } from '@shared/stores/store';
import { MuokkaustietoKayttajallaDto, Muokkaustieto } from '@shared/api/ylops';

@Store
export class MuokkaustietoStore {
  @State()
  public opsId: number;

  @State()
  public muokkaustiedot: MuokkaustietoKayttajallaDto[] | null = null;

  @State()
  public viimeinenHaku: MuokkaustietoKayttajallaDto[] | null = null;

  @State()
  public hakuLukumaara = 8;

  constructor(opsId: number) {
    this.opsId = opsId;
  }

  public async update() {
    if (this.muokkaustiedot && !_.isEmpty(this.muokkaustiedot)) {
      this.viimeinenHaku = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.opsId!, (_.last(this.muokkaustiedot) as any).luotu, this.hakuLukumaara) as any).data;

      if (this.viimeinenHaku) {
        this.muokkaustiedot = [
          ...this.muokkaustiedot,
          ...this.viimeinenHaku,
        ];
      }
    }
    else {
      this.muokkaustiedot = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.opsId, undefined, this.hakuLukumaara) as any).data;
    }
  }

  public async init() {
    this.muokkaustiedot = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.opsId, undefined, this.hakuLukumaara) as any).data;
  }
}
