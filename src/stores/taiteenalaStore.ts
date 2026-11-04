import { computed } from 'vue';
import { Router } from 'vue-router';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Taiteenperusopetus, TaiteenalaDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

export class TaiteenalaStore implements IEditoitava {
  constructor(
    private opsId: number,
    private taiteenalaId: number,
    private opsStore: OpetussuunnitelmaStore,
    private router: Router,
  ) {
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    const taiteenala = (await Taiteenperusopetus.getTaiteenala(this.opsId, this.taiteenalaId)).data;
    return taiteenala;
  }

  async save(data: TaiteenalaDto) {
    const saved = (await Taiteenperusopetus.updateTaiteenala(this.opsId, this.taiteenalaId, data)).data;
    await this.opsStore.initNavigation();
    return saved;
  }

  async remove() {
    await Taiteenperusopetus.removeTaiteenala(this.opsId, this.taiteenalaId);
    await this.opsStore.initNavigation();
    await this.router.push({ name: 'yleisnakyma' });
  }

  public features() {
    return computed(() => ({
      editable: true,
      hideable: false,
      removable: true,
    } as EditoitavaFeatures));
  }
}
