<template>
<div id="scroll-anchor" class="tekstiviite" v-if="hooks">
  <div class="kappale">
    <ep-editointi :hooks="hooks" type="tekstikappale" :versionumero="versionumero">
      <template slot="ohje" slot-scope="{ isEditing, data }">
        <div class="sidepad">
          <p>{{ $t('ohje-tekstikapale') }}</p>
          <p>{{ $t('ohje-tekstikapale-perusteteksti') }}</p>
          <div class="ohjeet" v-if="data.ohjeet.length > 0">
            <div class="ohje" v-for="ohje in data.ohjeet" :key="ohje.id">
              <ep-content layout="normal"
                          v-model="ohje.teksti"
                          :kasiteHandler="kasiteHandler"
                          :kuvaHandler="kuvaHandler"
                          :is-editable="allowOhjeEdit && isEditing"></ep-content>
            </div>
          </div>
        </div>
      </template>
      <template slot="keskustelu" slot-scope="{ }">
        <ep-comment-threads />
      </template>
      <template slot="header" slot-scope="{ data }">
        <h2>{{ $kaanna(perusteTekstinOtsikko || data.tov.tekstiKappale.nimi) }}</h2>
      </template>
      <template slot="additional-info" slot-scope="{ data }">
        <span v-if="data.tov.piilotettu" class="additional-info-text">({{ $t('piilotettu')}})</span>
        <span v-if="data.tov.liite" class="additional-info-text">({{ $t('liite')}})</span>
      </template>
      <template slot-scope="{ isEditing, data }">
        <div class="teksti">
          <ep-form-content v-if="isEditing && !data.tov.perusteTekstikappaleId" name="tekstikappale-nimi-ohje">
            <ep-field v-if="data.tov.tekstiKappale"
                      v-model="data.tov.tekstiKappale.nimi"
                      :is-header="true"
                      :is-editing="isEditing && !data.tov.perusteTekstikappaleId"></ep-field>
          </ep-form-content>
          <span comment-uuid="data.tov.tekstiKappale.tunniste">
            <div v-if="isEditing" class="mb-4">
              <ep-toggle v-model="data.tov.liite">{{ $t('nayta-liitteena') }}</ep-toggle>
              <ep-toggle v-model="data.tov.piilotettu">{{ $t('piilota-tekstikappale-julkisesta-opetussuunnitelmasta') }}</ep-toggle>
            </div>
            <div v-else-if="data.tov.piilotettu" class="disabled-text mb-4">{{$t('tekstikappale-piilotettu-julkisesta-opetussuunnitelmasta')}}</div>
            <ep-collapse tyyppi="perusteteksti" v-if="(isEditing || data.tov.naytaPerusteenTeksti) && perusteenTeksti && perusteenTeksti.perusteenOsa" :first="isEditing" :borderBottom="!isPohja">
              <h5 slot="header">{{ $t('perusteen-teksti') }}</h5>

              <template v-if="data.laajaAlaisetOsaamiset">
                <EpCollapse v-for="(lao, index) in data.laajaAlaisetOsaamiset" :key="'lao' + lao.id" :borderBottom="index < data.laajaAlaisetOsaamiset.length-1">
                  <h3 slot="header">{{$kaanna(lao.nimi)}}</h3>
                  <div v-html="$kaanna(lao.kuvaus)" />
                </EpCollapse>
              </template>

              <ep-content
                v-else
                layout="normal"
                v-model="perusteenTeksti.perusteenOsa.teksti"
                :is-editable="false"
                :kasiteHandler="kasiteHandler"
                :kuvaHandler="kuvaHandler"/>

              <div class="font-italic text-secondary" v-if="!isEditing && !$kaanna(perusteenTeksti.perusteenOsa.teksti) && !data.laajaAlaisetOsaamiset">{{ $t('perusteen-sisaltoa-ei-maaritetty') }}</div>
              <div v-if="isEditing">
                <ep-toggle v-model="data.tov.naytaPerusteenTeksti">{{ $t('nayta-perusteen-teksti') }}</ep-toggle>
              </div>
            </ep-collapse>
            <div class="mb-4" v-if="data.tov.perusteTekstikappaleId && !perusteenTeksti">
              <h5>{{ $t('perusteen-teksti') }}</h5>
              <div class="font-italic text-secondary">{{$t('perusteen-tekstia-ei-loydy')}}</div>
            </div>
            <ep-collapse v-if="alkuperaiset && alkuperaiset.length > 0 && (isEditing || data.tov.naytaPohjanTeksti)">
              <h5 slot="header">
                {{ $t('pohjan-teksti') }} <span v-if="pohjaNimi">({{$kaanna(pohjaNimi)}})</span>
              </h5>
              <ep-content
                v-for="(alkuperainen, index) in alkuperaiset" :key="'alkuperainen'+index"
                layout="normal"
                v-model="alkuperainen.tekstiKappale.teksti"
                :is-editable="false"
                :kasiteHandler="kasiteHandler"
                :kuvaHandler="kuvaHandler"/>
              <div v-if="isEditing" class="mb-4">
                <ep-toggle v-model="data.tov.naytaPohjanTeksti">{{ $t('nayta-pohjan-teksti') }}</ep-toggle>
              </div>
            </ep-collapse>

            <template v-if="!isPohja">
              <h5>{{ $t('paikallinen-teksti') }}</h5>
              <ep-content
                layout="normal"
                v-model="data.tov.tekstiKappale.teksti"
                :is-editable="isEditing"
                :kasiteHandler="kasiteHandler"
                :kuvaHandler="kuvaHandler"> </ep-content>
              <ep-alert v-if="!isEditing && !$kaanna(data.tov.tekstiKappale.teksti)" :ops="false" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />
            </template>
          </span>
        </div>
      </template>
    </ep-editointi>
  </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';

import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpRoute from '@/mixins/EpRoute';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';

import {
  Lops2019Perusteet,
  OhjeDto,
  Ohjeet,
  OpetussuunnitelmanSisalto,
  TekstiKappaleViiteDto,
  Puu,
  Matala,
  Opetussuunnitelmat,
} from '@shared/api/ylops';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { createLogger } from '@shared/utils/logger';

import { success } from '@/utils/notifications';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';

const logger = createLogger('RouteTekstikappale');

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpCommentThreads,
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpInput,
    EpAlert,
    EpToggle,
  },
})
export default class RouteTekstikappale extends Mixins(EpRoute, EpOpsComponent) {
  private ohjeet: OhjeDto[] = [];
  private perusteenTeksti: TekstiKappaleViiteDto | null = null;
  private alkuperaiset: Matala[] | null = null;
  private nimi: any = {};
  private kopioitava = false;

  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: async () => this.isUusi(),
    source: {
      load: this.load,
      save: this.save,
    },
    remove: this.remove,
    history: {
      revisions: this.revisions,
      restore: this.restore,
    },
    editable: this.editable,
  };

  async remove(data: any) {
    const alaOpsLkm = await this.store.tekstikappaleAlaOpetussuunnitelmaLukumaara(data.tov.tekstiKappale.tunniste);

    const confirm = this.$bvModal.msgBoxConfirm((this.$t('tekstikappale-poisto-vahvistus-ala-ops', { alaOpsLkm }) as any), {
      title: this.$t('poista-tekstikappale'),
      okVariant: 'primary',
      okTitle: this.$t('poista') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
      ...{} as any,
    });

    if (alaOpsLkm === 0 || await confirm) {
      await this.store.removeTeksti(data.tov);
      this.$router.push({
        name: 'opsPoistetut',
        params: {
          tabIndex: '2',
        },
      });
    }
  }

  get isPohja() {
    return this.store.opetussuunnitelma!.tyyppi as string === 'pohja';
  }

  get allowOhjeEdit() {
    return this.isPohja;
  }

  get opsId() {
    return _.parseInt(this.$route.params.id);
  }

  get osaId(): number {
    return _.parseInt(this.$route.params.osaId);
  }

  get pohjaNimi() {
    return this.ops.pohja?.nimi;
  }

  async isUusi() {
    return this.$route.params.osaId === 'uusi';
  }

  private async restore(data, numero) {
    await OpetussuunnitelmanSisalto.revertTekstikappaleToVersion(this.opsId, data.tov!.id!, numero);
    success('palautus-onnistui');
  }

  private async revisions(data) {
    if (data.tov && data.tov.tekstiKappale && data.tov.tekstiKappale.id) {
      return (await OpetussuunnitelmanSisalto
        .getVersionsForTekstiKappaleViite(this.opsId, data.tov.tekstiKappale.id)).data;
    }
    else {
      return [];
    }
  }

  get versionumero() {
    return _.parseInt(_.get(this, '$route.query.versionumero') as any);
  }

  private async load() {
    if (await this.isUusi()) {
      return {
        tov: {
          tekstiKappale: {
            nimi: {},
          },
        },
      };
    }
    else {
      const teksti = (await OpetussuunnitelmanSisalto.getTekstiKappaleViiteSyva(this.opsId, this.osaId)).data;
      if (this.versionumero) {
        const revisions = (await OpetussuunnitelmanSisalto
          .getVersionsForTekstiKappaleViite(this.opsId, teksti.tekstiKappale!.id as number)).data;
        const rev = revisions[revisions.length - this.versionumero];
        if (rev) {
          teksti.tekstiKappale = (await OpetussuunnitelmanSisalto
            .getVersionForTekstiKappaleViite(this.opsId, this.osaId, rev.numero as number)).data;
        }
      }
      const ohjeet = await Ohjeet.getTekstiKappaleOhje(teksti.tekstiKappale!.tunniste as string);
      try {
        this.alkuperaiset = (await OpetussuunnitelmanSisalto
          .getTekstiKappaleViiteOriginals(this.opsId, this.osaId)).data as Matala[];
        this.alkuperaiset = _.filter(this.alkuperaiset, 'tekstiKappale');
      }
      catch (err) {
        logger.warn('Alkuperäisen tekstikappaleen hakeminen epäonnistui:', err);
      }

      const result = {
        tov: _.omit(_.cloneDeep(teksti), 'lapset'),
        ohjeet: ohjeet.data || [],
        laajaAlaisetOsaamiset: null,
      } as any;

      if (_.isEmpty(result.ohjeet)) {
        result.ohjeet.push({});
      }

      try {
        if (teksti.perusteTekstikappaleId) {
          this.perusteenTeksti = (await OpetussuunnitelmanSisalto.getPerusteTekstikappale(this.opsId, teksti!.id as number)).data;

          if (this.perusteenTeksti?.perusteenOsa?.tunniste === 'laajaalainenosaaminen') {
            result.laajaAlaisetOsaamiset = (await Opetussuunnitelmat.getLaajalaisetosamiset(this.opsId)).data;
          }
        }
      }
      catch (err) {
        console.error(err);
      }

      if (teksti.tekstiKappale) {
        this.breadcrumb('tekstikappale', teksti.tekstiKappale.nimi);
      }
      return result;
    }
  }

  get perusteTekstinOtsikko() {
    return this.perusteenTeksti?.perusteenOsa?.nimi;
  }

  siirry(uusi) {
    setTimeout(() => {
      this.$router.push({
        name: 'tekstikappale',
        params: {
          ...this.$route.params,
          osaId: '' + uusi.id,
        },
      });
    }, 300);
  }

  async save({ tov, ohjeet }) {
    if (await this.isUusi()) {
      const uusi = await this.store.addTeksti(tov, _.parseInt(this.$route.params.parentId));
      this.$nextTick(() => this.siirry(uusi));
    }
    else {
      await this.store.saveTeksti(tov);
      await Promise.all(_.map(ohjeet, (ohje) => this.store.saveOhje({
        ...ohje,
        kohde: tov.tekstiKappale.tunniste,
      })));
      success('tallennus-onnistui-tekstikappale');
    }
  }

  async addAlikappale(parent: Puu) {
    const uusi = await this.store.addTeksti({}, parent.id);
    this.$nextTick(() => this.siirry(uusi));
  }

  async editable() {
    return !this.isPohja;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.opsId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.opsId!));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.badges {
  .badge {
    margin: 4px;
  }
}

.tekstiviite {
  .kappale {
    .otsikko {
      margin-bottom: 0;
      font-family: Poppins;
    }

    .teksti {
      margin-left: 0;
    }

    .infos {
      margin-bottom: 20px;

      .badges {
        .badge {
          margin: 0 4px 0 4px;
        }
      }
    }

    .perusteteksti {

      @include teksti-sisalto;

      font-style: italic;
      font-size: 80%;
    }

    .ohjeet {
      .ohje {
        padding: 10px;
        margin-bottom: 10px;
        color: #555;
      }

      .ohje-perusteteksti {
        background: #F5FBF0;
      }

      .ohje-ohje {
        background: #FBF1FA;
      }
    }

  }

  .sidepad {
    padding: 8px;
  }

  .additional-info-text {
    margin-right: 10px;
    font-weight: 600;
  }

}
</style>
