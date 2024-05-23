<template>
<div id="scroll-anchor" class="tekstiviite">
  <div class="kappale">
    <ep-editointi
        :store="tekstikappaleStore"
        :versionumero="versionumero">
      <template v-slot:ohje="{ isEditing, data }">
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
      <template v-slot:keskustelu="{ }">
        <ep-comment-threads />
      </template>
      <template v-slot:header="{ data }">
        <h2>{{ $kaanna(perusteenTekstikappaleNimi || data.tov.tekstiKappale.nimi) }}</h2>
      </template>
      <template v-slot:postHeader="{ data }">
        <span v-if="data.tov.piilotettu" class="additional-info-text">({{ $t('piilotettu')}})</span>
        <span v-if="data.tov.liite" class="additional-info-text">({{ $t('liite')}})</span>
      </template>
      <template v-slot:default="{ data, isEditing }">
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
            <ep-collapse tyyppi="perusteteksti" v-if="(isEditing || data.tov.naytaPerusteenTeksti) && data.perusteenTeksti && data.perusteenTeksti.perusteenOsa" :first="isEditing" :borderBottom="!isPohja">
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
                v-model="data.perusteenTeksti.perusteenOsa.teksti"
                :is-editable="false"
                :kasiteHandler="kasiteHandler"
                :kuvaHandler="kuvaHandler"/>

              <div class="font-italic text-secondary"
                v-if="!isEditing && data.perusteenTeksti && data.perusteenTeksti.perusteenOsa && data.perusteenTeksti.perusteenOsa.teksti && !$kaanna(data.perusteenTeksti.perusteenOsa.teksti) && !data.laajaAlaisetOsaamiset">
                {{ $t('perusteen-sisaltoa-ei-maaritetty') }}
              </div>
              <div v-if="isEditing">
                <ep-toggle v-model="data.tov.naytaPerusteenTeksti">{{ $t('nayta-perusteen-teksti') }}</ep-toggle>
              </div>
            </ep-collapse>
            <div class="mb-4" v-if="data.tov.perusteTekstikappaleId && !data.perusteenTeksti">
              <h5>{{ $t('perusteen-teksti') }}</h5>
              <div class="font-italic text-secondary">{{$t('perusteen-tekstia-ei-loydy')}}</div>
            </div>
            <ep-collapse v-if="data.alkuperaiset && data.alkuperaiset.length > 0 && (isEditing || data.tov.naytaPohjanTeksti)">
              <h5 slot="header">
                {{ $t('pohjan-teksti') }} <span v-if="pohjaNimi">({{$kaanna(pohjaNimi)}})</span>
              </h5>
              <ep-content
                v-for="(alkuperainen, index) in data.alkuperaiset" :key="'alkuperainen'+index"
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
import { Mixins, Component, Watch } from 'vue-property-decorator';

import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpRoute from '@/mixins/EpRoute';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createLogger } from '@shared/utils/logger';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Murupolku } from '@/stores/murupolku';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';

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
  private tekstikappaleStore: EditointiStore | null = null;

  async fetch() {
    const tkstore = new TekstikappaleStore(this.opsId, this.osaId, this.store, this.versionumero);
    this.tekstikappaleStore = new EditointiStore(tkstore);
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  @Watch('osaId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.fetch();
  }

  @Watch('tekstikappale')
  onDataChange(tk) {
    if (tk) {
      Murupolku.aseta('tekstikappale', this.$kaanna(tk.nimi), {
        name: 'tekstikappale',
      });
    }
  }

  get tekstikappale() {
    return this.tekstikappaleStore?.data?.value || null;
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

  get versionumero() {
    return _.parseInt(_.get(this, '$route.query.versionumero') as any);
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.opsId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.opsId!));
  }

  get perusteenTekstikappaleNimi() {
    return this.tekstikappaleStore?.data?.value?.perusteenTeksti?.perusteenOsa?.nimi;
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
