import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import * as _ from 'lodash';
import { Revision, KoulutustyyppiToteutus } from '@shared/tyypit';
import { createLogger } from '@shared/utils/logger';
import VueRouter from 'vue-router';
import Vue from 'vue';
import { sortedOppiaineet } from '../utils/opetussuunnitelmat';
import { PerusteCache } from './peruste';

import { koodiSorters } from '@shared/utils/perusteet';
import { success } from '@/utils/notifications';

const logger = createLogger('JarjestysStore');

interface JarjestysStoreConfig {
  router: VueRouter;
}

export class JarjestysStore implements IEditoitava {
  constructor(
    private opsId: number,
    private versionumero: number,
    private store: any, // Reference to the main store
    private ops: any, // Reference to ops data
  ) {
  }

  private static config: JarjestysStoreConfig;
  private cache: PerusteCache | null = null;

  public static install(vue: typeof Vue, config: JarjestysStoreConfig) {
    JarjestysStore.config = config;
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false; // Never edit after load for jarjestys
  }

  async init() {
    this.cache = await PerusteCache.of(this.opsId);
    await this.store.init();
  }

  async validate(data) {
    const uudet = _.filter(data.tekstikappaleet.lapset, '$uusi');
    return { valid: uudet.length === 0, message: 'ops-rakenne-epavalidi' };
  }

  mapPerusteOppimaarat(oa, oppiaineJarjestykset) {
    return _.chain(oa.oppimaarat)
      .map(om => {
        const opintojaksot = _.chain(this.store.opintojaksot)
          .concat(this.store.tuodutOpintojaksot)
          .filter(oj => _.includes(_.chain(oj.oppiaineet)
            .map('koodi')
            .filter(_.identity)
            .value(), om.koodi!.uri))
          .map(oj => {
            const ojOm: any = _.find(oj.oppiaineet, { koodi: om.koodi.uri });
            return {
              id: oj.id,
              nimi: oj.nimi,
              jarjestys: ojOm.jarjestys,
              koodi: oj.koodi,
            };
          })
          .sortBy('jarjestys', ...koodiSorters())
          .value();
        return {
          id: om.id,
          nimi: om.nimi,
          koodi: om.koodi.arvo,
          lapset: opintojaksot,
          group: 'opintojaksot',
          jarjestys: _.get(_.find(oppiaineJarjestykset, { koodi: om.koodi.uri }), 'jarjestys'),
        };
      })
      .sortBy('jarjestys', ...koodiSorters())
      .value();
  }

  get perusteOppiaineetJaOppimaarat() {
    if (!this.cache) return [];
    return _.chain(this.cache.peruste.oppiaineet)
      .map(oa => [
        oa,
        ...oa.oppimaarat,
      ])
      .flatten()
      .value();
  }

  mapPaikallisetOppimaarat(oa, oppiaineJarjestykset) {
    return _.chain(this.store.paikallisetOppiaineet)
      .filter(poa => {
        const parentOm = _.find(this.perusteOppiaineetJaOppimaarat, { koodi: { uri: poa.perusteenOppiaineUri } });
        if (parentOm && parentOm._oppiaine) {
          const parentOa = _.find(this.cache!.peruste.oppiaineet, { id: _.toNumber(parentOm._oppiaine) });
          return parentOa && _.get(parentOa, 'koodi.uri') === _.get(oa, 'koodi.uri');
        }

        return false;
      })
      .map(poa => {
        const opintojaksot = _.chain(this.store.opintojaksot)
          .concat(this.store.tuodutOpintojaksot)
          .filter(oj => _.includes(
            _.chain(oj.oppiaineet)
              .map('koodi')
              .filter(_.identity)
              .value(),
              poa.koodi!,
          ))
          .map(oj => {
            const ojOa: any = _.find(oj.oppiaineet, { koodi: poa.koodi });
            return {
              id: oj.id,
              nimi: oj.nimi,
              jarjestys: ojOa.jarjestys,
              koodi: oj.koodi,
            };
          })
          .sortBy('jarjestys', ...koodiSorters())
          .value();
        return {
          id: poa.id,
          nimi: poa.nimi,
          koodi: poa.koodi,
          lapset: opintojaksot,
          group: 'opintojaksot',
          jarjestys: _.get(_.find(oppiaineJarjestykset, { koodi: poa.koodi }), 'jarjestys'),
        };
      })
      .value();
  }

  getPerusteOppiaineet(oppiaineJarjestykset) {
    if (!this.cache) return [];
    return _.chain(this.cache.peruste.oppiaineet)
      .map(oa => {
        const opintojaksot = _.chain(this.store.opintojaksot)
          .concat(this.store.tuodutOpintojaksot)
          .filter(oj => _.includes(_.chain(oj.oppiaineet)
            .map('koodi')
            .filter(_.identity)
            .value(), oa.koodi!.uri))
          .map(oj => {
            const ojOa: any = _.find(oj.oppiaineet, { koodi: oa.koodi.uri });
            return {
              id: oj.id,
              nimi: oj.nimi,
              jarjestys: ojOa.jarjestys,
              koodi: oj.koodi,
            };
          })
          .sortBy('jarjestys', ...koodiSorters())
          .value();
        const oppimaarat = _.chain([...this.mapPerusteOppimaarat(oa, oppiaineJarjestykset), ...this.mapPaikallisetOppimaarat(oa, oppiaineJarjestykset)])
          .sortBy('jarjestys', ...koodiSorters())
          .value();

        return {
          id: oa.id,
          nimi: oa.nimi,
          lapset: [
            ...oppimaarat,
            ...opintojaksot,
          ],
          group: _.isEmpty(oa.oppimaarat) ? 'opintojaksot' : 'oppimaarat',
          sortable: true,
          jarjestys: _.get(_.find(oppiaineJarjestykset, { koodi: oa.koodi.uri }), 'jarjestys'),
        };
      })
      .value();
  }

  getPaikallisetOppiaineet(oppiaineJarjestykset) {
    return _.chain(this.store.paikallisetOppiaineet)
      .filter(poa => !poa.perusteenOppiaineUri)
      .map(poa => {
        const opintojaksot = _.chain(this.store.opintojaksot)
          .concat(this.store.tuodutOpintojaksot)
          .filter(oj => _.includes(
            _.chain(oj.oppiaineet)
              .map('koodi')
              .filter(_.identity)
              .value(),
              poa.koodi!,
          ))
          .map(oj => {
            const ojOa: any = _.find(oj.oppiaineet, { koodi: poa.koodi });
            return {
              id: oj.id,
              nimi: oj.nimi,
              jarjestys: ojOa.jarjestys,
              koodi: oj.koodi,
            };
          })
          .sortBy('jarjestys', ...koodiSorters())
          .value();
        return {
          id: poa.id,
          nimi: poa.nimi,
          lapset: opintojaksot,
          group: 'opintojaksot',
          jarjestys: _.get(_.find(oppiaineJarjestykset, { koodi: poa.koodi }), 'jarjestys'),
        };
      })
      .value();
  }

  getOppiaineet(oppiaineJarjestykset) {
    return _.chain([
      ...this.getPerusteOppiaineet(oppiaineJarjestykset),
      ...this.getPaikallisetOppiaineet(oppiaineJarjestykset),
    ])
      .sortBy('jarjestys')
      .value();
  }

  get isLops2019() {
    return ((this.ops.toteutus as any) === KoulutustyyppiToteutus.lops2019);
  }

  async load(supportDataProvider) {
    await this.init();

    const tekstikappaleet = await this.store.getOtsikot();
    const oppiaineJarjestykset = this.store.oppiaineJarjestykset;

    let oppiaineet;
    if (this.isLops2019) {
      oppiaineet = this.getOppiaineet(oppiaineJarjestykset);
    }
    else {
      // Perusopetus oppiaineet
      const vuosiluokkakokonaisuudet = _.map(this.ops.vuosiluokkakokonaisuudet, 'vuosiluokkakokonaisuus._tunniste');
      oppiaineet = _.chain(sortedOppiaineet(this.ops.oppiaineet))
        .filter(oppiaine => _.some(vuosiluokkakokonaisuudet, vlk => _.includes(_.map(oppiaine.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'), vlk))
                         || _.some(oppiaine.oppimaarat, oppimaara => _.some(vuosiluokkakokonaisuudet, vlk => _.includes(_.map(oppimaara.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'), vlk))))
        .map(oppiaine => {
          return {
            ...oppiaine,
          };
        })
        .value();
    }

    supportDataProvider({
      hasPohja: !_.isEmpty(this.ops.pohja),
      isLops2019: this.isLops2019,
    });

    return {
      tekstikappaleet,
      oppiaineet,
    };
  }

  private sortTekstikappaleet(lapset) {
    return _.chain(lapset)
      .map(tekstikappale => {
        if (_.size(tekstikappale?.lapset) > 0) {
          tekstikappale.lapset = this.sortTekstikappaleet(tekstikappale.lapset);
        }
        return tekstikappale;
      })
      .sortBy('liite')
      .value();
  }

  async save(data) {
    data.tekstikappaleet.lapset = this.sortTekstikappaleet(data.tekstikappaleet.lapset);
    await this.store.saveTeksti(data.tekstikappaleet);

    if (_.size(data.oppiaineet) > 0) {
      if (this.isLops2019) {
        await this.store.updateOppiaineJaOpintojaksojarjestys(data.oppiaineet);
        await this.store.init();
      }
      else {
        let jnro = 0;
        let valinnainenjnro = 0;
        const oppiainejarjestys = _.chain(data.oppiaineet)
          .map(oppiaine => {
            return [
              oppiaine,
              ..._.isEmpty(oppiaine.oppimaarat) ? [] : oppiaine.oppimaarat,
            ];
          })
          .flatMap()
          .map(oppiaine => {
            return {
              oppiaineId: oppiaine.id,
              jnro: oppiaine.tyyppi === 'muu_valinnainen' ? _.size(data.oppiaineet) + valinnainenjnro++ : jnro++,
            };
          })
          .value();

        await this.store.updateOppiainejarjestys(oppiainejarjestys);
        await this.store.init();
      }
    }

    success('tallennus-onnistui-jarjestys');
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async restore(rev) {
    // No revision history for jarjestys
  }

  async revisions() {
    return [];
  }

  async start() {
  }

  async remove(data?: any) {
    // No remove functionality for jarjestys
  }

  async hide(data) {
    // No hide functionality for jarjestys
  }

  async unHide(data) {
    // No unhide functionality for jarjestys
  }

  async copy(data) {
    // No copy functionality for jarjestys
  }

  public readonly validator = computed(() => {
    return null; // Custom validation handled in validate method
  });

  public features(data) {
    return computed(() => {
      return {
        editable: true,
        removable: false,
        hideable: false,
        isHidden: false,
        recoverable: false,
        copyable: false,
      } as EditoitavaFeatures;
    });
  }
}
