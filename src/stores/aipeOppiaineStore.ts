import { computed } from 'vue';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { AIPE, AIPEOppiaineDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

export class AipeOppiaineStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
    private opsStore: OpetussuunnitelmaStore,
  ) {
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return (await AIPE.getOppiaine(this.opsId, this.oppiaineId)).data;
  }

  async save(data: AIPEOppiaineDto) {
    const saved = (await AIPE.updateOppiaine(this.opsId, this.oppiaineId, data)).data;
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
