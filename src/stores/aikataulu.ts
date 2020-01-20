import { State, Store } from '@shared/stores/store';
import { OpetussuunnitelmanAikatauluDto } from '@/tyypit';
import { Aikataulu } from '@/api';
import _ from 'lodash';

@Store
export class AikatauluStore {

  @State()
  public opsId: number;

  @State()
  private aikataulut: OpetussuunnitelmanAikatauluDto[] | null = null;

  constructor(opsId: number) {
    this.opsId = opsId;
  }

  getAikataulut() {
    return this.aikataulut;
  }

  public async update() {
    this.aikataulut = (await Aikataulu.getAikataulu(this.opsId) as any).data;
  }

  public async saveAikataulut(aikataulut) {
    const lisattavat = _.filter(aikataulut, (aikataulu) => _.isNil(aikataulu.id));
    const paivitettavat = _.filter(aikataulut, (aikataulu) => !_.isNil(aikataulu.id));
    const poistettavat = _.filter(this.aikataulut, (aikataulu) => !_.includes(_.map(aikataulut, (aikataulu) => aikataulu.id), aikataulu.id));

    const lisatyt = _.map(await Promise.all(_.map(lisattavat, (lisattava) => Aikataulu.save(this.opsId, (lisattava as any)) as any)), (lisatty) => lisatty.data);
    const paivitetyt = _.map(await Promise.all(_.map(paivitettavat, (paivitettava) => Aikataulu.update(this.opsId, (paivitettava as any)) as any)), (paivitetty) => paivitetty.data);
    await Promise.all(_.map(poistettavat, (poistettava) => Aikataulu._delete(this.opsId, (poistettava as any)) as any));

    this.aikataulut = [
      ...lisatyt,
      ...paivitetyt,
    ];
  }

}
