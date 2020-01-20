import { State, Store } from '@shared/stores/store';
import { MuokkaustietoKayttajallaDto } from '@/tyypit';
import { Muokkaustieto } from '@/api';
import _ from 'lodash';

@Store
export class MuokkaustietoStore {

  @State()
  public opsId: number;

  @State()
  private muokkaustiedot: MuokkaustietoKayttajallaDto[] | null = null;

  @State()
  private viimeinenHaku: MuokkaustietoKayttajallaDto[] | null = null;

  @State()
  private hakuLukumaara = 8;

  constructor(opsId: number) {
    this.opsId = opsId;
  }

  getHakuLukumaara() {
    return this.hakuLukumaara;
  }

  getMuokkaustiedot() {
    return this.muokkaustiedot;
  }

  getViimeinenHaku() {
    return this.viimeinenHaku;
  }

  public async update() {
    if (this.muokkaustiedot) {
      this.viimeinenHaku = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.opsId!, (_.last(this.muokkaustiedot) as any).luotu, this.hakuLukumaara) as any).data;

      if (this.viimeinenHaku) {
        this.muokkaustiedot = [
          ...this.muokkaustiedot,
          ...this.viimeinenHaku
        ];
      }
    }
    else {
      this.muokkaustiedot = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.opsId, undefined, this.hakuLukumaara) as any).data;
    }
  }

}
