import {
  oppiaineLinkki,
  oppimaaraModuuliLinkit,
  oppimaaraOpintojaksoLinkit,
  opsLapsiLinkit,
  paikallinenOppiaineToMenu,
} from './menuBuildingMethods';

describe('OpsSidenav menubuilder helper', () => {
  it('runs opsLapsiLinkit & oppiaineLinkki without errors', () => {
    const res1 = opsLapsiLinkit([{
      tekstikappale: null,
      id: 1,
      lapset: [{
        tekstikappale: null,
        id: 2,
      }]
    }]);
    expect(res1.length).toBe(1);
    expect(res1[0].item.type).toEqual('tekstikappale');

    const res2 = oppiaineLinkki('test', { id: null }, []);
    expect(res2.item.type).toEqual('test');
  });

  it('runs oppimaaraModuuliLinkit & oppimaaraOpintojaksoLinkit without errors', () => {
    const res1 = oppimaaraModuuliLinkit({
      id: 1,
      moduulit: [{
        id: 2,
      }],
    });
    expect(res1.length).toBe(1);
    expect(res1[0].item.type).toEqual('moduuli');

    const res2 = oppimaaraOpintojaksoLinkit([
      {
        oppiaineet: [{
          koodi: 'testiuri',
        }]
      }
    ], {
      koodi: {
        uri: 'testiuri',
      }
    }
    );
    expect(res2.length).toBe(1);
    expect(res2[0].item.type).toEqual('opintojakso');
  });

  it('runs paikallinenOppiaineToMenu without errors', () => {
    const res1 = paikallinenOppiaineToMenu({ id: 1 });
    expect(res1.item.type).toEqual('oppiaine');
  });
});
