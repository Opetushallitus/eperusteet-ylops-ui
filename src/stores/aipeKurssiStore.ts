import { computed } from 'vue';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { AIPE, AIPEKurssiDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

export class AipeKurssiStore implements IEditoitava {
  constructor(
    private opsId: number,
    private kurssiId: number,
    private opsStore: OpetussuunnitelmaStore,
  ) {
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return (await AIPE.getKurssi(this.opsId, this.kurssiId)).data;
  }

  async save(data: AIPEKurssiDto) {
    const saved = (await AIPE.updateKurssi(this.opsId, this.kurssiId, data)).data;
    await this.opsStore.initNavigation();
    return saved;
  }

  async hide(data: any) {
    data.piilotettu = true;
    await this.save(data);
  }

  async unHide(data: any) {
    data.piilotettu = false;
    await this.save(data);
  }

  public features(data: any) {
    return computed(() => ({
      editable: true,
      hideable: true,
      isHidden: !!data?.piilotettu,
      removable: false,
    } as EditoitavaFeatures));
  }
}
