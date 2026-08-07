import { computed } from 'vue';
import { Router } from 'vue-router';
import _ from 'lodash';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { TaiteenalaDto, Taiteenperusopetus } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from './opetussuunnitelma';

export class TaiteenalaStore implements IEditoitava {
  constructor(
    private readonly opsId: number,
    private readonly taiteenalaId: number,
    private readonly opetussuunnitelmaStore: OpetussuunnitelmaStore,
    private readonly router: Router,
  ) {
  }

  public async load(supportDataProvider) {
    const taiteenala = (await Taiteenperusopetus.getTaiteenala(this.opsId, this.taiteenalaId)).data;
    const perusteenTaiteenala = (await Taiteenperusopetus.getPerusteenTaiteenala(this.opsId, taiteenala.koodi as string)).data;
    supportDataProvider({ perusteenTaiteenala });
    return {
      ...taiteenala,
      paikallinenTarkennus: taiteenala.paikallinenTarkennus || {},
    };
  }

  public async save(data: TaiteenalaDto) {
    await Taiteenperusopetus.updateTaiteenala(this.opsId, this.taiteenalaId, data);
    await this.opetussuunnitelmaStore.initNavigation();
  }

  public async remove() {
    await Taiteenperusopetus.removeTaiteenala(this.opsId, this.taiteenalaId);
    await this.opetussuunnitelmaStore.initNavigation();
    this.router.push({ name: 'yleisnakyma' });
  }

  public async editAfterLoad() {
    return false;
  }

  public features(data) {
    return computed(() => {
      return {
        editable: this.opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string !== 'pohja',
        removable: !_.isNil(data?.id),
      } as EditoitavaFeatures;
    });
  }
}
