import {
  Opetussuunnitelmat,
} from '@/api';

describe('Api facade', () => {
  it('contains opetussuunnitelma methods', async () => {
    const spy = jest.spyOn(Opetussuunnitelmat, 'getAll');
    spy.mockImplementationOnce(async () => {
      return {
        data: [{
          id: 42,
        }],
      };
    });

    const opsit = (await Opetussuunnitelmat.getAll()).data;
    expect(opsit).toEqual([{
      id: 42,
    }]);
  });

});
