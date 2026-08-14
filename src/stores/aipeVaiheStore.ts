import { computed } from 'vue';
import { Router } from 'vue-router';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { AIPE, AIPEVaiheDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

export class AipeVaiheStore implements IEditoitava {
  constructor(
    private opsId: number,
    private vaiheId: number,
    private opsStore: OpetussuunnitelmaStore,
    private router: Router,
  ) {
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return (await AIPE.getVaihe(this.opsId, this.vaiheId)).data;
  }

  async save(data: AIPEVaiheDto) {
    const saved = (await AIPE.updateVaihe(this.opsId, this.vaiheId, data)).data;
    await this.opsStore.initNavigation();
    return saved;
  }

  async remove() {
    await AIPE.removeVaihe(this.opsId, this.vaiheId);
    await this.opsStore.initNavigation();
    await this.router.push({ name: 'yleisnakyma' });
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
      removable: true,
    } as EditoitavaFeatures));
  }
}
