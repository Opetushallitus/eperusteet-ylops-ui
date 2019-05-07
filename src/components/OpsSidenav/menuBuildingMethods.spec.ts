import {
  oppiaineLinkki,
  oppimaaraModuuliLinkit,
  oppimaaraOpintojaksoLinkit,
  opsLapsiLinkit,
  paikallinenOppiaineToMenu,
} from './menuBuildingMethods';

describe('OpsSidenav menubuilder helper', () => {
  it('runs methods without errors', () => {
    const res1 = opsLapsiLinkit([{
      tekstikappale: null,
      id: 1,
      lapset: [{
        tekstikappale: null,
        id: 2,
      }]
    }]);
    expect(res1.length).toBe(1);

    const res2 = oppimaaraModuuliLinkit({
      id: 1,
      moduulit: [{
        id: 2,
      }],
    });
    expect(res2.length).toBe(1);
  });
});
