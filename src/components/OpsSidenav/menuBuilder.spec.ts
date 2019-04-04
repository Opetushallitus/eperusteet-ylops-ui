import { MenuBuilder } from './menuBuilder';

describe('OpsSidenav menubuilder helper', () => {
  it('runs methods without errors', () => {
    let mb = new MenuBuilder();

    const res1 = mb.OpsLapsiLinkit([{
      tekstikappale: null,
      id: 1,
      lapset: [{
        tekstikappale: null,
        id: 2,
      }]
    }]);
    expect(res1.length).toBe(1);

    const res2 = mb.OppimaaraModuuliLinkit({
      id: 1,
      moduulit: [{
        id: 2,
      }],
    });
    expect(res2.length).toBe(1);
  });
});
