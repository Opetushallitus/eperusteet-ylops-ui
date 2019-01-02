import {
  Opetussuunnitelmat,
} from '@/api';

describe('Api facade', () => {
  it('contains opetussuunnitelma methods', async () => {
    const opsit = (await Opetussuunnitelmat.getAll()).data;
    expect(opsit).toEqual([{
      id: 42,
    }]);
  });

});
