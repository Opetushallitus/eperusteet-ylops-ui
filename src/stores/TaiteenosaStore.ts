import { computed } from 'vue';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { TaiteenosaDto, Taiteenperusopetus } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from './opetussuunnitelma';

export class TaiteenosaStore implements IEditoitava {
  constructor(
    private readonly opsId: number,
    private readonly taiteenosaId: number,
    private readonly opetussuunnitelmaStore: OpetussuunnitelmaStore,
  ) {
  }

  public async load(supportDataProvider) {
    const taiteenosa = (await Taiteenperusopetus.getTaiteenosa(this.opsId, this.taiteenosaId)).data;
    const perusteenTaiteenosa = (await Taiteenperusopetus.getPerusteenTaiteenosa(
      this.opsId,
      taiteenosa.perusteenTaiteenosanId as number,
    )).data;
    supportDataProvider({ perusteenTaiteenosa });
    return {
      ...taiteenosa,
      paikallinenTarkennus: taiteenosa.paikallinenTarkennus || {},
    };
  }

  public async save(data: TaiteenosaDto) {
    await Taiteenperusopetus.updateTaiteenosa(this.opsId, this.taiteenosaId, data);
    await this.opetussuunnitelmaStore.initNavigation();
  }

  public async editAfterLoad() {
    return false;
  }

  public features() {
    return computed(() => {
      return {
        editable: this.opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string !== 'pohja',
        removable: false,
      } as EditoitavaFeatures;
    });
  }
}
