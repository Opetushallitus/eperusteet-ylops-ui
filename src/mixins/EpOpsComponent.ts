import _ from 'lodash';
import { Vue, Prop, Component } from 'vue-property-decorator';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Meta } from '@shared/utils/decorators';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';

/**
 * Mixin näkymäkomponenteille mitkä tarvitsevat opetussuunnitelman sisällön
 */
@Component
export default class EpOpsComponent extends Vue {
  @Prop({ required: true })
  private opetussuunnitelmaStore!: OpetussuunnitelmaStore;

  @Meta
  getMetaInfo() {
    if (this.ops && this.ops.nimi && !_.isEmpty(this.$kaanna(this.ops.nimi))) {
      return {
        title: this.$kaanna(this.ops.nimi),
        titleTemplate: '%s - ' + this.$t('eperusteet-ops-tyokalu'),
      };
    }
    else {
      return {
        title: this.$t('eperusteet-ops-tyokalu'),
        titleTemplate: null,
      };
    }
  }

  get store() {
    return this.opetussuunnitelmaStore!;
  }

  get ops() {
    return this.store.opetussuunnitelma!;
  }

  get isLops2019() {
    return this.ops.toteutus as string === 'lops2019';
  }

  get opsId() {
    return this.ops.id!;
  }

  get isPohja() {
    return this.ops.tyyppi as string === 'pohja';
  }

  get isOps() {
    return this.ops.tyyppi as string === 'ops';
  }

  get isValmisPohja() {
    return this.isPohja && this.ops.tila as any === 'valmis';
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.opsId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.opsId!));
  }
}
