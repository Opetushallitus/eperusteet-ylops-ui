import { reactive, computed, ref, watch } from 'vue';
import _ from 'lodash';
import { ITermiStore, ITermi } from '@shared/components/EpContent/KasiteHandler';
import { TermiDto, Termisto } from '@shared/api/ylops';

export class TermitStore implements ITermiStore {
  public state = reactive({
    termit: null as TermiDto[] | null,
    opsId: null as number | null,
  });

  public readonly termit = computed(() => this.state.termit);

  public async init(opsId) {
    this.state.opsId = opsId;
    this.state.termit = null;
    this.state.termit = (await Termisto.getAllTermit(opsId)).data;

    return this;
  }

  public async save(opsId: number, muokattuTermi: TermiDto) {
    if (!muokattuTermi.avain) {
      muokattuTermi.avain = this.makeKey(muokattuTermi);
    }

    if (muokattuTermi.id) {
      muokattuTermi = (await Termisto.updateTermi(opsId, muokattuTermi.id, muokattuTermi)).data;
      this.state.termit = _.map(this.state.termit, termi => {
        if (termi.id === muokattuTermi.id) {
          return muokattuTermi;
        }
        return termi;
      });
    }
    else {
      muokattuTermi = (await Termisto.addTermi(opsId, muokattuTermi)).data;
      this.state.termit = [
        muokattuTermi,
        ...this.state.termit || [],
      ];
    }

    return muokattuTermi;
  }

  public async delete(opsId: number, poistettavaTermi: TermiDto) {
    await Termisto.deleteTermi(opsId, poistettavaTermi.id!);
    this.state.termit = _.filter(this.state.termit, termi => termi.id !== poistettavaTermi.id);
  }

  private makeKey(item) {
    const termi = _.first(_.compact(_.values(item.termi))) || '';
    return termi.replace(/[^a-zA-Z0-9]/g, '') + new Date().getTime();
  }

  getTermi(avain: string) {
    return _.find(this.termit.value, termi => termi.avain === avain);
  }

  getAllTermit() {
    return this.state.termit || [];
  }

  async updateOrAddTermi(termi: ITermi) {
    return await this.save(this.state.opsId!, termi);
  }
}
