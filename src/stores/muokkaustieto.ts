import _ from 'lodash';
import { reactive, computed } from 'vue';
import { MuokkaustietoKayttajallaDto, Muokkaustieto } from '@shared/api/ylops';

export class MuokkaustietoStore {
  private state = reactive({
    opsId: 0,
    muokkaustiedot: null as MuokkaustietoKayttajallaDto[] | null,
    viimeinenHaku: null as MuokkaustietoKayttajallaDto[] | null,
    hakuLukumaara: 8,
  });

  public readonly opsId = computed(() => this.state.opsId);
  public readonly muokkaustiedot = computed(() => this.state.muokkaustiedot);
  public readonly viimeinenHaku = computed(() => this.state.viimeinenHaku);
  public readonly hakuLukumaara = computed(() => this.state.hakuLukumaara);

  public async init(opsId: number) {
    this.state.opsId = opsId;
    this.state.muokkaustiedot = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.state.opsId, undefined, this.state.hakuLukumaara) as any).data;
  }

  public async update() {
    if (this.state.muokkaustiedot && !_.isEmpty(this.state.muokkaustiedot)) {
      this.state.viimeinenHaku = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.state.opsId!, (_.last(this.state.muokkaustiedot) as any).luotu, this.state.hakuLukumaara) as any).data;

      if (this.state.viimeinenHaku) {
        this.state.muokkaustiedot = [
          ...this.state.muokkaustiedot,
          ...this.state.viimeinenHaku,
        ];
      }
    }
    else {
      this.state.muokkaustiedot = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.state.opsId, undefined, this.state.hakuLukumaara) as any).data;
    }
  }

  public clear() {
    this.state.muokkaustiedot = null;
    this.state.viimeinenHaku = null;
    this.state.opsId = 0;
  }
}
