import Vue from 'vue';
import { Termisto } from '@shared/api/ylops';
import _ from 'lodash';
import { ITermiStore, ITermi } from '@shared/components/EpContent/KasiteHandler';

export class TermitStore implements ITermiStore {
  constructor(private readonly opsId?: number) {
  }

  getTermi(avain: string) {
    return Termisto.getTermi(this.opsId!, avain);
  }
  getAllTermit() {
    // return Termisto.getAllTermit(this.opsId!);
    return [];
  }
  updateTermi(termiId: number, termi: ITermi) {
    return Termisto.updateTermi(this.opsId!, termiId, termi);
  }
  updateOrAddTermi(termi: ITermi) {
    return Termisto.addTermi(this.opsId!, termi);
  }
}
