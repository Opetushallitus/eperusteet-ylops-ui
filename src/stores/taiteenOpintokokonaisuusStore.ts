import { computed } from 'vue';
import { Router } from 'vue-router';
import { required } from '@vuelidate/validators';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Taiteenperusopetus, TaiteenOpintokokonaisuusDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { nimiValidator } from '@/validators/required';

export class TaiteenOpintokokonaisuusStore implements IEditoitava {
  private opintokokonaisuusId: number | null;

  constructor(
    private opsId: number,
    private taiteenalaId: number,
    private vaiheId: number,
    opintokokonaisuusId: number | 'uusi',
    private opsStore: OpetussuunnitelmaStore,
    private router: Router,
  ) {
    this.opintokokonaisuusId = opintokokonaisuusId === 'uusi' ? null : opintokokonaisuusId;
  }

  async editAfterLoad() {
    return this.opintokokonaisuusId === null;
  }

  async load(supportDataProvider: (data: any) => void) {
    const vaihe = (await Taiteenperusopetus.getTaiteenalanVaihe(this.opsId, this.vaiheId)).data;
    supportDataProvider({
      vaihe,
      tavoitealueet: vaihe.perusteenVaihe?.tavoitealueet || [],
    });

    if (this.opintokokonaisuusId === null) {
      return {
        nimi: {},
        laajuus: null,
        kuvaus: {},
        osaamisenArviointi: {},
        tavoitealueValinnat: [],
      } as TaiteenOpintokokonaisuusDto;
    }

    return (await Taiteenperusopetus.getTaiteenOpintokokonaisuus(this.opsId, this.opintokokonaisuusId)).data;
  }

  async save(data: TaiteenOpintokokonaisuusDto) {
    if (this.opintokokonaisuusId === null) {
      const created = (await Taiteenperusopetus.addTaiteenOpintokokonaisuus(this.opsId, this.vaiheId, data)).data;
      this.opintokokonaisuusId = created.id!;
      await this.opsStore.initNavigation();
      return async () => {
        await this.router.replace({
          name: 'taiteenopintokokonaisuus',
          params: {
            taiteenalaId: String(this.taiteenalaId),
            vaiheId: String(this.vaiheId),
            opintokokonaisuusId: String(created.id),
          },
        });
      };
    }

    await Taiteenperusopetus.updateTaiteenOpintokokonaisuus(this.opsId, this.opintokokonaisuusId, data);
    await this.opsStore.initNavigation();
  }

  async remove() {
    if (this.opintokokonaisuusId !== null) {
      await Taiteenperusopetus.removeTaiteenOpintokokonaisuus(this.opsId, this.opintokokonaisuusId);
    }
    await this.opsStore.initNavigation();
    await this.router.push({
      name: 'taiteenalanvaihe',
      params: {
        taiteenalaId: String(this.taiteenalaId),
        vaiheId: String(this.vaiheId),
      },
    });
  }

  public features() {
    return computed(() => ({
      editable: true,
      hideable: false,
      removable: this.opintokokonaisuusId !== null,
    } as EditoitavaFeatures));
  }

  public readonly validator = computed(() => ({
    ...nimiValidator([]),
    laajuus: { required },
  }));
}
