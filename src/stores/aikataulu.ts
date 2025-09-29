import { reactive, computed } from 'vue';
import { OpetussuunnitelmanAikatauluDto, Aikataulu } from '@shared/api/ylops';

import _ from 'lodash';

export class AikatauluStore {
  private state = reactive({
    opsId: 0,
    aikataulut: null as OpetussuunnitelmanAikatauluDto[] | null,
  });

  public readonly opsId = computed(() => this.state.opsId);
  public readonly aikataulut = computed(() => this.state.aikataulut);

  public async init(opsId: number) {
    this.state.opsId = opsId;
    await this.update();
  }

  public async update() {
    this.state.aikataulut = (await Aikataulu.getAikataulu(this.state.opsId) as any).data;
  }

  public async saveAikataulut(aikataulut) {
    const lisattavat = _.filter(aikataulut, (aikataulu) => _.isNil(aikataulu.id));
    const paivitettavat = _.filter(aikataulut, (aikataulu) => !_.isNil(aikataulu.id));
    const poistettavat = _.filter(this.state.aikataulut, (aikataulu) => !_.includes(_.map(aikataulut, (aikataulu) => aikataulu.id), aikataulu.id));

    const lisatyt = _.map(await Promise.all(_.map(lisattavat, (lisattava) => Aikataulu.save(this.state.opsId, (lisattava as any)) as any)), (lisatty) => lisatty.data);
    const paivitetyt = _.map(await Promise.all(_.map(paivitettavat, (paivitettava) => Aikataulu.update(this.state.opsId, (paivitettava as any)) as any)), (paivitetty) => paivitetty.data);
    await Promise.all(_.map(poistettavat, (poistettava) => Aikataulu._delete(this.state.opsId, (poistettava as any)) as any));

    this.state.aikataulut = [
      ...lisatyt,
      ...paivitetyt,
    ];
  }

  public clear() {
    this.state.aikataulut = null;
    this.state.opsId = 0;
  }
}
