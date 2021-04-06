import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import { Termisto } from '@shared/api/ylops';
import _ from 'lodash';
import { ITermiStore, ITermi } from '@shared/components/EpContent/KasiteHandler';

Vue.use(VueCompositionApi);

export class TermitStore implements ITermiStore {
  constructor(private readonly opsId?: number) {
  }

  getTermi(avain: string) {
    return Termisto.getTermi(this.opsId!, avain);
  }
  getAllTermit() {
    return Termisto.getAllTermit(this.opsId!);
  }
  updateTermi(termiId: number, termi: ITermi) {
    return Termisto.updateTermi(this.opsId!, termiId, termi);
  }
  addTermi(termi: ITermi) {
    return Termisto.addTermi(this.opsId!, termi);
  }
}
