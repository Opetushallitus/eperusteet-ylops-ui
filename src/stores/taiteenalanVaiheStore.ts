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

  public features() {
    return computed(() => ({
      editable: true,
      hideable: false,
      removable: false,
    } as EditoitavaFeatures));
  }
}
