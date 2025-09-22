<template>
<div id="scroll-anchor" class="content">
  <div v-if="editointiStore">
    <ep-editointi :store="editointiStore"
                  :versionumero="versionumero"
                  type="paikallinen-oppiaine">
      <template #muokkaa-content v-if="tuotuOppimaara">
        <div class="muokkaus-esto align-self-center">
          {{$t('et-voi-muokata-pohjan-oppimaaraa')}}
          <div class="d-inline">
            <b-button @click="remove()" variant="link" id="muokkaus-esto">
              {{ $t('poista-oppimaara') }}
            </b-button>
          </div>
        </div>
      </template>
      <template #header="{ data }">
        <h2>{{ $kaanna(data.nimi) }}</h2>
      </template>
      <template #ohje>
        <div class="sidepad">
          <p>{{ $t('ohje-paikallinen-oppiaine') }}</p>
        </div>
      </template>
      <template #keskustelu>
        <ep-comment-threads />
      </template>
    <template #default="{ data, validation, isEditing, supportData }">
      <div class="content">
        <b-row v-if="isEditing">
          <b-col>
            <ep-form-content :name="data.perusteenOppiaineUri ? 'oppimaara-nimi-ohje' : 'oppiaine-nimi-ohje'">
              <ep-field v-model="data.nimi" :is-header="true" :validation="validation.nimi" :is-editing="isEditing">
              </ep-field>
            </ep-form-content>
          </b-col>
           <b-col />
        </b-row>
        <b-row>
          <b-col v-if="isEditing || data.perusteenOppiaineUri">
            <ep-form-content name="oppiainekoodi">
              <ep-oppiaine-selector
                v-model="data.perusteenOppiaineUri"
                :opetussuunnitelma-store="store"
                :is-editable="isEditing"
                :multiple="false"
                :allow-oppiaine="true"
                :oppiaine-filter="oppiaineFilter" />
            </ep-form-content>
          </b-col>
          <b-col>
            <ep-form-content>
              <div class="d-flex">
                <label class="mr-1">{{$t('koodi')}}</label>
                <EpInfoPopover v-if="isEditing">
                  <div v-html="$t('koodiohje')"></div>
                </EpInfoPopover>
              </div>
              <ep-field v-model="data.koodi" :validation="validation.koodi" type="string" :is-editing="isEditing" />
            </ep-form-content>
          </b-col>
        </b-row>
        <div>
          <ep-collapse tyyppi="tehtava" :first="true">
            <h3 class="header" slot="header">{{ $t('tehtava') }}</h3>
            <ep-content v-if="oppimaara && oppimaara.tehtava" layout="normal" v-model="oppimaara.tehtava.kuvaus"> </ep-content>

            <h4>{{ $t('paikallinen-lisays-tehtavalle') }}</h4>
            <ep-content :opetussuunnitelma-store="store" v-model="data.tehtava.kuvaus" :is-editable="isEditing" layout="normal"> </ep-content>
          </ep-collapse>

          <ep-collapse tyyppi="tavoitteet">
            <h3 class="header" slot="header">{{ $t('tavoitteet') }}</h3>
            <ep-content v-if="oppimaara && oppimaara.tavoitteet && oppimaara.tavoitteet.kuvaus" v-model="oppimaara.tavoitteet.kuvaus" :is-editable="false" layout="normal"> </ep-content>
            <div class="tavoitealueet" v-if="oppimaara && oppimaara.tavoitteet">
              <ep-prefix-list v-model="oppimaara.tavoitteet.tavoitealueet" arvot="tavoitteet" :is-editable="false"></ep-prefix-list>
            </div>

            <h4>{{ $t('paikallinen-lisays-tavoitteet') }}</h4>
            <ep-content
              :kasiteHandler="kasiteHandler"
              :kuvaHandler="kuvaHandler"
              v-model="data.tavoitteet.kuvaus"
              :is-editable="isEditing"
              layout="normal"> </ep-content>
            <div class="tavoitealueet">
              <ep-prefix-list v-model="data.tavoitteet.tavoitealueet" arvot="tavoitteet" arvo="tavoite" :is-editable="isEditing"></ep-prefix-list>
            </div>
          </ep-collapse>

          <ep-collapse tyyppi="arviointi">
            <h3 class="header" slot="header">{{ $t('osaamisen-arviointi') }}</h3>
            <ep-content v-if="oppimaara && oppimaara.arviointi" layout="normal" v-model="oppimaara.arviointi.kuvaus"> </ep-content>

            <h4>{{ $t('paikallinen-lisays-osaamisen-arvioinnille') }}</h4>
            <ep-content
              :kasiteHandler="kasiteHandler"
              :kuvaHandler="kuvaHandler"
              v-model="data.arviointi.kuvaus"
              :is-editable="isEditing"
              layout="normal"> </ep-content>
          </ep-collapse>

          <ep-collapse tyyppi="opiskeluymparistoTyotavat" v-if="isLuva">
            <h3 class="header" slot="header">{{ $t('opiskeluymparisto-ja-tyotavat') }}</h3>
            <ep-content v-if="oppimaara && oppimaara.opiskeluymparistoTyotavat" v-model="oppimaara.opiskeluymparistoTyotavat.kuvaus" :is-editable="false" layout="normal"> </ep-content>

            <h4>{{ $t('paikallinen-lisays-opiskeluymparisto-ja-tyotavat') }}</h4>
            <ep-content :opetussuunnitelma-store="store" v-model="data.opiskeluymparistoTyotavat.kuvaus" :is-editable="isEditing" layout="normal"> </ep-content>

          </ep-collapse>

          <ep-collapse tyyppi="laajaAlainenOsaaminen" v-else>
            <h3 class="header" slot="header">{{ $t('laaja-alaiset-sisallot') }}</h3>
            <ep-content v-if="oppimaara && oppimaara.laajaAlaisetOsaamiset" v-model="oppimaara.laajaAlaisetOsaamiset.kuvaus" :is-editable="false" layout="normal"> </ep-content>

            <laaja-alaiset-osaamiset
              v-model="data.laajaAlainenOsaaminen"
              :koodit="supportData.laajaAlaisetKoodit"
              :nimi="'lisaa-laaja-alainen-osaaminen'"
              :is-editable="isEditing" />
          </ep-collapse>

          <div v-if="!isEditing">
            <h3 class="header" slot="header">{{ $t('opintojaksot') }}</h3>
            <div class="block-container mb-2" v-for="opintojakso in opintojaksot" :key="opintojakso.id">
              <div class="oj-content">
                <span class="nimi">
                  <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: opintojakso.id } }">
                    <span class="mr-2">{{ $kaanna(opintojakso.nimi) }}</span>
                    <span v-if="opintojakso.koodi">({{ opintojakso.koodi }})</span>
                  </router-link>
                </span>
                <span class="pituus">{{ opintojakso.laajuus }} {{ $t('opintopiste') }}</span>
              </div>
            </div>
            <ep-button class="mt-2"
                       v-if="!isUusi()"
                       icon="add"
                       @click="uusiOpintojakso()">{{ $t('uusi-opintojakso') }}</ep-button>
          </div>
        </div>
      </div>
    </template>
    </ep-editointi>
  </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Lops2019PaikallinenOppiaineDto, Opetussuunnitelmat } from '@shared/api/ylops';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { Kielet } from '@shared/stores/kieli';
import LaajaAlaisetOsaamiset from '@/routes/opetussuunnitelmat/sisalto/yhteiset/LaajaAlaisetOsaamiset.vue';
import { KoodistoLops2019LaajaAlaiset, paikallisestiSallitutLaajennokset } from '@/utils/perusteet';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import { PerusteCache } from '@/stores/peruste';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { LopsPaikallinenOppiaineStore } from '@/stores/lopsPaikallinenOppiaineStore';

@Component({
  components: {
    EpInfoPopover,
    EpButton,
    EpCollapse,
    EpColorIndicator,
    EpCommentThreads,
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpOppiaineSelector,
    EpPrefixList,
    EpSpinner,
    LaajaAlaisetOsaamiset,
  },
})
export default class RoutePaikallinenOppiaine extends Mixins(EpRoute, EpOpsComponent) {
  private perusteCache: PerusteCache | null = null;
  private editointiStore: EditointiStore | null = null;

  get editable() {
    return this.editointiStore?.data.value;
  }

  set editable(data) {
    this.editointiStore?.setData(data);
  }

  get isLoading() {
    return this.editointiStore?.isLoading?.value || false;
  }

  async mounted() {
    await this.init();

    this.editointiStore = new EditointiStore(new LopsPaikallinenOppiaineStore(
      this.opsId,
      this.$route.params.paikallinenOppiaineId,
      this.versionumero,
      (this as any).store, // Access the parent store
      this.$route.params.paikallinenOppiaineId === 'uusi',
      _.get(this.$route, 'query.oppiaine') as string,
    ));
  }

  async init() {
    this.perusteCache = await PerusteCache.of(this.opsId);
  }

  async remove() {
    return this.editointiStore?.remove();
  }

  isUusi() {
    return this.$route.params.paikallinenOppiaineId === 'uusi';
  }

  get tuotuOppimaara() {
    const supportData = this.editointiStore?.supportData?.value;
    return supportData?.tuotuOppimaara || false;
  }

  get opintojaksot() {
    if (!this.editable?.koodi) {
      return [];
    }
    return _.chain(this.store.opintojaksot as any)
      .filter(oj => {
        return !!_(oj.oppiaineet)
          .map('koodi')
          .filter(koodi => koodi === this.editable!.koodi)
          .first();
      })
      .sortBy('koodi')
      .value();
  }

  public uusiOpintojakso() {
    this.$router.push({
      name: 'opintojakso',
      params: {
        ...this.$router.currentRoute.params,
        opintojaksoId: 'uusi',
      },
      query: {
        oppiaineet: this.editable?.koodi,
      },
    });
  }

  get oppimaara() {
    if (this.editable?.perusteenOppiaineUri && this.perusteCache) {
      return _.chain(this.perusteCache.peruste.oppiaineet)
        .map(oppiaine => {
          return [
            oppiaine,
            ...oppiaine.oppimaarat,
          ];
        })
        .flatMap()
        .filter(oppiaineTaiOppimaara => oppiaineTaiOppimaara.koodi.uri === this.editable!.perusteenOppiaineUri)
        .head()
        .value();
    }
  }

  oppiaineFilter(oppiaine) {
    return _.some(paikallisestiSallitutLaajennokset(), (laajennos) =>
      _.startsWith(oppiaine.koodiUri, laajennos));
  }

  get versionumero() {
    return _.parseInt(_.get(this, '$route.query.versionumero') as any);
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.content {
  padding: 10px;
}

.tavoitealueet {
  margin-top: 10px;
}

.header {
  user-select: none;
}

.oj-content {
  border-radius: 24px;
  border: 1px solid #CDEEFF;
  padding: 14px 30px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #E6F6FF;

  span.nimi {
    flex: 1 0 auto;
  }

  span.pituus {
    min-width: 4em;
  }

  span.tyyppi {
    min-width: 6em;
  }
}

.block-container {
}

.muokkaus-esto {
  font-size: 0.8rem;
  color: $gray-lighten-1;

  .lisainfo {
    color: $blue-lighten-5;
    cursor: pointer;
  }
}

</style>
