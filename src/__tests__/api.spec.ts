import { Opetussuunnitelmat } from '@/api';
import axios from 'axios';
import '@shared/api/common';


describe('Api facade', () => {
  test('contains opetussuunnitelma methods', async () => {
    const spy = jest.spyOn(Opetussuunnitelmat, 'getAll');
    spy.mockImplementationOnce(async (): Promise<any> => {
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

  test('caller-id', async () => {
    expect(axios.defaults.headers.common['Caller-Id']).toBeTruthy();
  });

});
