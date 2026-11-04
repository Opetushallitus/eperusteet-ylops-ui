import { computed } from 'vue';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Taiteenperusopetus, TaiteenalanVaiheDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

export class TaiteenalanVaiheStore implements IEditoitava {
  constructor(
    private opsId: number,
    private vaiheId: number,
    private opsStore: OpetussuunnitelmaStore,
  ) {
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return (await Taiteenperusopetus.getTaiteenalanVaihe(this.opsId, this.vaiheId)).data;
  }

  async save(data: TaiteenalanVaiheDto) {
    const saved = (await Taiteenperusopetus.updateTaiteenalanVaihe(this.opsId, this.vaiheId, data)).data;
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
