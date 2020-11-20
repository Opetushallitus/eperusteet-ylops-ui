<template>
<div id="scroll-anchor" class="content">
  <div v-if="hooks && !isLoading">
    <ep-editointi :hooks="hooks"
                  v-model="editable"
                  :validator="validator"
                  :versionumero="versionumero"
                  type="opintojakso">
      <template slot="muokkaa-content" slot-scope="{ data }" v-if="data.tuotuOpintojakso">
        <div class="muokkaus-esto align-self-center">
          {{$t('et-voi-muokata-pohjan-opintojaksoa')}}
          <div class="d-inline" v-if="data.opintojaksonOpetussuunnitelma">
            <b-button @click="remove(data)" variant="link" id="muokkaus-esto">
              {{ $t('poista-opintojakso') }}
            </b-button>
          </div>
        </div>
      </template>
      <template slot="ohje" slot-scope="{ }">
        <div class="sidepad">
          <p v-html="$t('ohje-opintojakso')">
          </p>
          <p v-html="$t('ohje-opintojakso-saannot')">
          </p>
        </div>
      </template>
      <template slot="keskustelu" slot-scope="{ }">
        <ep-comment-threads />
      </template>
      <template slot="header" slot-scope="{ data }">
        <h2 class="nimi mb-0">{{ $kaanna(data.nimi) || $t('opintojakso') }}</h2>
      </template>
      <template v-slot="{ data, validation, isEditing }">
        <div class="osio">
          <div class="row">
            <div class="col-md-6">
              <ep-form-content name="nimi">
                <ep-field
                  help="opintojakso-nimi-ohje"
                  v-model="data.nimi"
                  :validation="validation.nimi"
                  :is-header="false"
                  :is-editing="isEditing"></ep-field>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <ep-form-content name="koodi">
                <ep-field help="opintojakso-koodi-ohje" v-model="data.koodi" type="string" :validation="validation.koodi" :is-editing="isEditing" />
              </ep-form-content>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <ep-form-content name="oppiaineet">
                <ep-oppiaine-selector
                  v-if="isEditing"
                  :opetussuunnitelma-store="opetussuunnitelmaStore"
                  :ops-id="$route.params.id"
                  :validation="validation.oppiaineet"
                  :value="data.oppiaineet.map(x => x.koodi)"
                  @input="updateOppiaineet"
                  :oppiaine-filter="oppiaineFilter"/>
                <div v-else>
                  <ul>
                    <li v-for="(oa,index) in data.oppiaineet" :key="index+'data.oppiaineet.select'">
                      {{ $kaanna(oppiaineetMap[oa.koodi].nimi) }}
                    </li>
                  </ul>
                </div>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <ep-form-content name="opintopisteet">
                <span>{{ laajuus }} {{ $t('opintopiste') }} {{laajuusJohdettavusTeksti}}</span>
              </ep-form-content>
            </div>
          </div>
        </div>
        <hr v-if="isEditing" />
        <div class="osio" v-if="isEditing || data.moduulit.length > 0">
          <div class="alueotsikko"><h3>{{ $t('opintojakson-moduulit') }}</h3></div>
          <div class="oppiaineet" v-if="isEditing">
            <div v-for="(oa, index) in oppiaineetModuuliTaiIlman" :key="index+'oppiaineetModuuliTaiIlman'" class="mb-4">
              <div class="d-flex moduuliotsikko">
                <div class="flex-grow-1">
                  {{ $kaanna(oppiaineetMap[oa.koodi].nimi) }}
                </div>
                <div class="moduulikuvaukset mr-5 d-inline-flex" v-if="isEditing && !oa.isModuuliton">
                  <div>
                    <ep-color-indicator kind="pakollinen" />
                    <span class="ml-2">{{ $t('pakollinen') }}</span>
                  </div>
                  <div>
                    <ep-color-indicator class="ml-4" kind="valinnainen" />
                    <span class="ml-2">{{ $t('valinnainen') }}</span>
                  </div>
                </div>
                <ep-toggle @input="toggleLaajuus(oa, $event)" class="mb-2" :value="oa.isModuuliton">
                  <span class="label">
                    {{ $t('ilman-moduuleita') }}
                  </span>
                </ep-toggle>
              </div>
              <div v-if="oa.isModuuliton">
                <ep-form-content name="laajuus">
                  <ep-field
                    type="number"
                    help="oppainekohtainen-laajuus-opintojaksossa"
                    :validation="validation.oppiaineet.$each.$iter[index].laajuus"
                    v-model="oa.laajuus"
                    :is-header="false"
                    :is-editing="isEditing"></ep-field>
                </ep-form-content>
              </div>
              <div v-else>
                <div class="moduulit">
                  <div class="moduuli" v-for="(moduuli, index) in oppiaineidenModuulitMap[oa.koodi].moduulit" :key="index+'oppiaineetMap.moduulit'">
                    <ep-opintojakson-moduuli
                      :moduuli="moduuli"
                      :is-editing="true"
                      v-model="data.moduulit"
                      :opetussuunnitelmaStore="opetussuunnitelmaStore"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="oppiaineet" v-if="!isEditing">
            <div class="moduulit" v-if="editable && editable.moduulit">
              <div class="moduuli" v-for="(moduuli, index) in editable.moduulit" :key="index+'editable.moduulit.oppiaineet'">
                <ep-opintojakson-moduuli :moduuli="moduulitMap[moduuli.koodiUri]" :value="data.moduulit">
                </ep-opintojakson-moduuli>
              </div>
            </div>
          </div>
          <div class="moduulilista" v-if="editable.moduulit.length > 0">
            <h4>{{ $t('valitut-moduulit') }}</h4>
            <div v-for="(moduuli, idx) in editable.moduulit" :key="idx+'editable.moduulit.moduulilista'">
              <div class="d-flex">
                <div class="p-2 flex-grow-1">
                  <fas class="checked" icon="check">
                  </fas>
                  <span class="nimi">{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</span>
                </div>
                <div class="p-2">
                  <span class="laajuus">{{ moduulitMap[moduuli.koodiUri].laajuus }} {{ $t('opintopiste') }}</span>
                  <ep-color-indicator :kind="moduulitMap[moduuli.koodiUri].pakollinen ? 'pakollinen' : 'valinnainen'" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="osio" v-if="editable.paikallisetOpintojaksot.length > 0 || (isEditing && paikallistenOppiaineidenOpintojaksot.length > 0)">
          <hr/>
          <div class="alueotsikko"><h3>{{ $t('paikallisen-oppiaineen-opintojaksot') }}</h3></div>
          <div class="oppiaineet">
            <div v-if="isEditing">
              <div v-for="(oppiaineOpintojakso, index) in paikallistenOppiaineidenOpintojaksot" :key="index+'paikallistenOppiaineidenOpintojaksot'" >
                {{ $kaanna(oppiaineetMap[oppiaineOpintojakso.oppiaine.koodi].nimi) }}
                <ep-opintojakso-select :options="oppiaineOpintojakso.opintojaksot" v-model="editable.paikallisetOpintojaksot" :is-editing="isEditing"/>
              </div>
            </div>
            <div v-else>
              <div v-for="(oppiaineOpintojakso, index) in esitettavaPaikallistenOppiaineidenOpintojaksot" :key="index+'paikallistenOppiaineidenOpintojaksot'" >
                {{ $kaanna(oppiaineetMap[oppiaineOpintojakso.oppiaine.koodi].nimi) }}
                <ep-opintojakso-select v-model="oppiaineOpintojakso.opintojaksot" :is-editing="isEditing"/>
              </div>
            </div>
          </div>
        </div>
        <div class="osio">
          <ep-collapse tyyppi="opintojakson-tavoitteet" :first="true">
            <div class="alueotsikko" slot="header"><h3>{{ $t('tavoitteet') }}</h3></div>
            <div class="perustesisalto" v-for="(moduuli, idx) in data.moduulit" :key="idx+'data.moduulit.tavoitteet'">
              <div class="moduuliotsikko"><h4>{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</h4></div>
              <ep-prefix-list :value="moduulitMap[moduuli.koodiUri].tavoitteet" kohde="kohde" arvot="tavoitteet"></ep-prefix-list>
            </div>

            <div v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot" :key="index+'h'">
              <div class="perustesisalto" v-if="paikallinenOpintojakso.tavoitteet.length > 0">
                <div class="moduuliotsikko"><h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4></div>
                <ep-list
                  :is-editable="false"
                  lisays="lisaa-tavoite"
                  kentta="kuvaus"
                  v-model="paikallinenOpintojakso.tavoitteet" />
              </div>
            </div>

            <div class="moduuliotsikko"><h4>{{ $t('paikallinen-lisays-tavoitteet') }}</h4></div>
            <div class="alert alert-info" v-if="!isEditing && data.tavoitteet && data.tavoitteet.length === 0">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <ep-list
              :is-editable="isEditing"
              lisays="lisaa-tavoite"
              kentta="kuvaus"
              v-model="data.tavoitteet" />
          </ep-collapse>
        </div>

        <div class="osio">
          <ep-collapse tyyppi="opintojakson-keskeiset-sisallot">
            <div class="alueotsikko" slot="header"><h3>{{ $t('keskeiset-sisallot') }}</h3></div>
            <div class="perustesisalto" v-for="(moduuli, idx) in data.moduulit" :key="idx+'data.moduulit.keskeiset'">
              <div class="moduuliotsikko"><h4>{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</h4></div>
              <ep-prefix-list :value="moduulitMap[moduuli.koodiUri].sisallot" kohde="kohde" arvot="sisallot">
              </ep-prefix-list>
            </div>

            <div v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot" :key="index+'data.paikallisetOpintojaksot'">
              <div class="perustesisalto" v-if="paikallinenOpintojakso.keskeisetSisallot.length > 0">
                <div class="moduuliotsikko"><h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4></div>
                <ep-list
                  :is-editable="false"
                  lisays="lisaa-tavoite"
                  kentta="kuvaus"
                  v-model="paikallinenOpintojakso.keskeisetSisallot" />
              </div>
            </div>

            <div class="moduuliotsikko"><h4>{{ $t('paikallinen-lisays-keskeiset-sisallot') }}</h4></div>
            <div class="alert alert-info" v-if="!isEditing && data.keskeisetSisallot && data.keskeisetSisallot.length === 0">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <ep-list
              :is-editable="isEditing"
              lisays="lisaa-keskeinen-sisalto"
              kentta="kuvaus"
              v-model="data.keskeisetSisallot" />
          </ep-collapse>
        </div>

        <div class="osio">
         <ep-collapse tyyppi="opintojakson-laaja-alaiset">
            <div class="alueotsikko" slot="header"><h3>{{ $t('laaja-alaiset-sisallot') }}</h3></div>

            <div class="perustesisalto" v-for="(oppiaine, idx) in opintojaksonOppiaineidenTiedot" :key="idx+'opintojaksonOppiaineet'">
              <div v-if="oppiaine.laajaAlaisetOsaamiset && oppiaine.laajaAlaisetOsaamiset.kuvaus">
                <div class="moduuliotsikko"><h4 v-html="$kaanna(oppiaine.nimi)"></h4></div>
                <ep-content
                  layout="normal"
                  :opetussuunnitelma-store="opetussuunnitelmaStore"
                  :value="oppiaine.laajaAlaisetOsaamiset.kuvaus"
                  help="ohje-lyhyt-laaja-alainen"></ep-content>
              </div>
              <!-- Todo: Tee parempi ratkaisu tähän -->
              <div v-else-if="oppiaine.laajaAlainenOsaaminen">
                <div class="moduuliotsikko"><h4 v-html="$kaanna(oppiaine.nimi)"></h4></div>
                <ep-content v-for="(laajalainenosaaminen, index) in oppiaine.laajaAlainenOsaaminen" :key="index+'oppiaine.laajaAlainenOsaaminen'"
                    layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" :value="laajalainenosaaminen.kuvaus"></ep-content>
              </div>
            </div>

            <div class="moduuliotsikko"><h4>{{ $t('paikallinen-lisays-opintojakso-laaja-alainen') }}</h4></div>

            <div class="paikallinen-laaja-alainen" v-for="(lo, index) in data.laajaAlainenOsaaminen" :key="index+'laajaAlainenOsaaminen'">
              <div slot="header">
                <span v-if="laajaAlaisetKooditByUri[lo.koodi]">
                  <h5 class="d-inline">{{ $kaanna(laajaAlaisetKooditByUri[lo.koodi].nimi) }}</h5>
                  <b-button variant="link" @click.stop="poistaLaaja(lo)" v-if="isEditing">
                    <fas icon="sulje" />
                  </b-button>
                </span>
              </div>
              <ep-content
                layout="normal"
                v-model="lo.kuvaus"
                :is-editable="isEditing"></ep-content>
            </div>

            <div class="alert alert-info" v-if="!isEditing && data.laajaAlainenOsaaminen.length === 0">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <b-dropdown v-if="isEditing" :text="$t('lisaa-laaja-alainen-osaaminen')" variant="primary" class="mb-4">
              <b-dropdown-item-button
                @click="addLaaja(laaja)"
                v-for="(laaja, index) in laajaAlaistenKoodit"
                :key="index+'addlaaja'"
                :disabled="laaja.hasPaikallinenKuvaus">
                {{ $kaanna(laaja.nimi) }}
              </b-dropdown-item-button>
            </b-dropdown>

            <div v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot" :key="index+'laaja'">
              <div v-if="paikallinenOpintojakso.laajaAlainenOsaaminen && paikallinenOpintojakso.laajaAlainenOsaaminen.length > 0">
                <div class="moduuliotsikko"><h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4></div>
                <div class="paikallinen-laaja-alainen" v-for="(lo, index) in paikallinenOpintojakso.laajaAlainenOsaaminen" :key="index+'paik-laaja-osa'">
                  <div slot="header" class="moduuliotsikko">
                    <span v-if="laajaAlaisetKooditByUri[lo.koodi]">
                      <h5>{{ $kaanna(laajaAlaisetKooditByUri[lo.koodi].nimi) }}</h5>
                    </span>
                  </div>
                  <ep-content
                    layout="normal"
                    v-model="lo.kuvaus"
                    :is-editable="false"></ep-content>
                </div>
              </div>
            </div>

          </ep-collapse>
        </div>

        <div class="osio">
          <ep-collapse tyyppi="opintojakson-arviointi">
            <div class="alueotsikko" slot="header"><h3>{{ $t('opintojakson-arviointi') }}</h3></div>

            <div class="perustesisalto" v-for="(oppiaine, idx) in opintojaksonOppiaineidenTiedot" :key="idx+'op-arviointi'">
              <div v-if="oppiaine.arviointi && oppiaine.arviointi.kuvaus">
                <div class="moduuliotsikko"><h4 v-html="$kaanna(oppiaine.nimi)">></h4></div>
                <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" :value="oppiaine.arviointi.kuvaus"></ep-content>
              </div>
            </div>
            <div class="moduuliotsikko"><h4>{{ $t('paikallinen-lisays-opintojakso-arviointi') }}</h4></div>
            <div class="alert alert-info" v-if="!isEditing && !data.arviointi">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" layout="normal" v-model="data.arviointi" :is-editable="isEditing"></ep-content>

            <div v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot" :key="index+'paik-arviointi'" class="mt-4">
              <div v-if="paikallinenOpintojakso.arviointi">
                <div class="moduuliotsikko"><h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4></div>
                <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" layout="normal" v-model="paikallinenOpintojakso.arviointi" :is-editable="false"></ep-content>
              </div>
            </div>
          </ep-collapse>
        </div>

        <div class="osio">
          <ep-collapse tyyppi="opintojakson-vapaa-kuvaus" :border-bottom="false">
            <div class="alueotsikko" slot="header"><h3>{{ $t('opintojakson-vapaa-kuvaus') }}</h3></div>
            <div class="alert alert-info" v-if="!isEditing && !data.kuvaus">{{ $t('ei-kuvausta') }}</div>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" layout="normal" v-model="data.kuvaus" :is-editable="isEditing" help="ohje-lyhyt-vapaa-kuvaus" ></ep-content>
          </ep-collapse>
        </div>
      </template>
    </ep-editointi>
  </div>
</div>
</template>

<script lang="ts">
import { Vue, Mixins, Component, Prop } from 'vue-property-decorator';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpList from '@shared/components/forms/EpList.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019OpintojaksonOppiaineDto, Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto, Opetussuunnitelmat } from '@shared/api/ylops';
import { PerusteCache } from '@/stores/peruste';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import * as _ from 'lodash';
import EpOpintojaksonModuuli from './EpOpintojaksonModuuli.vue';
import EpOpintojaksoSelect from './EpOpintojaksoSelect.vue';
import { opintojaksoValidator } from '@/validators/opintojakso';
import { Kielet } from '@shared/stores/kieli';
import * as defaults from '@/defaults';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';

import { KoodistoLops2019LaajaAlaiset, koodiSorters, paikallisestiSallitutLaajennokset } from '@/utils/perusteet';

import { success } from '@/utils/notifications';

interface OpintojaksonOppiaine {
  koodi: string;
  laajuus: number;
  isPaikallinenOppiaine: boolean;
  isModuuliton: boolean;
}

@Component({
  components: {
    EpCollapse,
    EpColorIndicator,
    EpCommentThreads,
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpInput,
    EpList,
    EpOpintojaksoSelect,
    EpOpintojaksonModuuli,
    EpOppiaineSelector,
    EpPrefixList,
    EpToggle,
  },
})
export default class RouteOpintojakso extends Mixins(EpOpsRoute) {
  @Prop({ required: false })
  private oppiaineUri!: string;

  private oppiaineQuery = '';
  private editable: Lops2019OpintojaksoDto | null = null;
  private cache!: PerusteCache;
  private laajaAlaisetKoodit: any | null = null;
  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: this.isUusi,
    remove: this.remove,
    source: {
      save: this.save,
      load: this.load,
    },
    history: {
      revisions: this.revisions,
      restore: this.restore,
    },
  };

  get laajaAlaisetSorted() {
    return _.sortBy(this.laajaAlaisetKoodit, 'koodiArvo');
  }

  async remove(data: any) {
    if (await this.vahvista('vahvista-poisto', 'poistetaanko-opintojakso')) {
      await this.store.removeOpintojakso(data.id);
      this.$router.push({
        name: 'opsPoistetut',
        params: {
          tabIndex: '0',
        },
      });
    }
  }

  async isUusi() {
    return this.$route.params.opintojaksoId === 'uusi';
  }

  async revisions() {
    if (await this.isUusi() || !_.includes(_.map(this.store.opintojaksot, 'id'), _.parseInt(this.$route.params.opintojaksoId))) {
      return [];
    }
    else {
      return this.store.getOpintojaksoHistoria(_.parseInt(this.$route.params.opintojaksoId));
    }
  }

  async restore(data, numero) {
    await this.store.revertOpintojaksoToVersion(_.parseInt(this.$route.params.opintojaksoId), numero);
    success('palautus-onnistui');
  }

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    try {
      this.laajaAlaisetKoodit = (await Opetussuunnitelmat.getKoodistonKoodit(
        this.opsId,
        KoodistoLops2019LaajaAlaiset)).data;
    }
    catch (err) {
      console.error(err);
    }
  }

  oppiaineFilter(oppiaine) {
    return !_.some(paikallisestiSallitutLaajennokset(), (laajennos) =>
      _.startsWith(oppiaine.koodiUri, laajennos));
  }

  get versionumero() {
    return _.parseInt(_.get(this, '$route.query.versionumero'));
  }

  get validator() {
    return opintojaksoValidator([
      Kielet.getSisaltoKieli.value, // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  get laajaAlaistenKoodit() {
    const lisatyt = _.map(this.editable!.laajaAlainenOsaaminen!, 'koodi');
    return _.map(this.laajaAlaisetKoodit, lo => ({
      koodi: lo.koodiUri,
      nimi: lo.nimi,
      hasPaikallinenKuvaus: _.includes(lisatyt, lo.koodi),
    }));
  }

  get laajaAlaisetKooditByUri() {
    return _.keyBy(this.laajaAlaistenKoodit, 'koodi');
  }

  get paikallisetOppiaineet() {
    return _.chain(this.store.paikallisetOppiaineet)
      .filter('koodi')
      .map((oa) => {
        return {
          ...oa,
          koodi: {
            uri: oa.koodi,
          },
        };
      })
      .value();
  }

  get oppiaineet() {
    return [
      ...this.cache.peruste.oppiaineet,
      ...this.paikallisetOppiaineet,
    ] as Lops2019OppiaineDto[];
  }

  get laajuusJohdettavusTeksti() {
    if (!_.isEmpty(this.editable!.moduulit) && !_.isEmpty(this.editable!.paikallisetOpintojaksot)) {
      return `(${this.$t('johdetaan-moduuleista-ja-opintojaksoista')})`;
    }
    else if (!_.isEmpty(this.editable!.moduulit)) {
      return `(${this.$t('johdetaan-moduuleista')})`;
    }
    else if (!_.isEmpty(this.editable!.paikallisetOpintojaksot)) {
      return `(${this.$t('johdetaan-opintojaksoista')})`;
    }

    return '';
  }

  get laajuus() {
    let result: number = _.chain(this.editable!.oppiaineet)
      .filter((oppiaine) => !_.includes(_.map(this.paikallistenOpintojaksojenOppiaineet, 'koodi'), oppiaine.koodi))
      .filter('laajuus')
      .map('laajuus')
      .map(_.parseInt)
      .sum()
      .value();
    if (this.editable && this.editable.moduulit && !_.isEmpty(this.editable.moduulit)) {
      result += _.chain(this.editable.moduulit)
        .map('koodiUri')
        .map((uri: string) => this.moduulitMap[uri].laajuus)
        .map(_.parseInt)
        .sum()
        .value();
    }
    result += _.chain(this.editable!.paikallisetOpintojaksot)
      .map('laajuus')
      .sum()
      .value();

    return result;
  }

  get oppiaineetMap() {
    return _.keyBy(this.oppiaineetJaOppimaarat, 'koodi.uri');
  }

  get oppiaineidenModuulit() {
    return _.chain(this.oppiaineetJaOppimaarat)
      .map((oa: any) => {
        if (oa.perusteenOppiaineUri) {
          return {
            ...oa,
            moduulit: this.oppiaineetMap[oa.perusteenOppiaineUri].moduulit,
          };
        }
        else {
          return oa;
        }
      })
      .value();
  }

  get oppiaineidenModuulitMap() {
    return _.chain(this.oppiaineidenModuulit)
      .keyBy('koodi.uri')
      .value();
  }

  get moduulit() {
    return _.chain(this.oppiaineetJaOppimaarat)
      .map((oa) => _.map(oa.moduulit, (moduuli) => ({
        ...moduuli,
        oppiaineUri: oa.koodi!.uri,
      })))
      .flatten()
      .sortBy(...koodiSorters())
      .value() as (Lops2019ModuuliDto & { oppiaineUri: string })[];
  }

  get moduulitMap() {
    return _.chain(this.moduulit)
      .keyBy('koodi.uri')
      .value();
  }

  get oppiaineetJaOppimaarat() {
    return _.chain(this.oppiaineet)
      .map((oa: any) => [oa, ..._.map(oa.oppimaarat, om => ({
        ...om,
        parentUri: oa.koodi.uri,
      }))])
      .flatten()
      .map((oa: Lops2019OppiaineDto) => {
        return {
          ...oa,
          moduulit: _.sortBy(oa.moduulit, ...koodiSorters()),
        };
      })
      .value() as (Lops2019OppiaineDto & { parentUri?: string })[];
  }

  get filteredOppiaineet() {
    return _.chain(this.oppiaineetJaOppimaarat)
      .filter((org) => Kielet.search(this.oppiaineQuery, org.nimi))
      .map('koodi.uri')
      .value();
  }

  get oppiaineetModuuliTaiIlman() {
    return _.chain(this.editable!.oppiaineet)
      .filter((oppiaine) => !_.includes(_.map(this.paikallistenOpintojaksojenOppiaineet, 'koodi'), oppiaine.koodi))
      .value();
  }

  get opintojaksonOppiaineet() {
    return _.chain(this.editable!.oppiaineet)
      .map(({ koodi }) => koodi)
      .sortBy(...koodiSorters() as any[])
      .uniq()
      .map((uri: string) => {
        if (this.oppiaineetMap[uri].parentUri) {
          return [this.oppiaineetMap[uri].parentUri, uri];
        }
        else {
          return [uri];
        }
      })
      .flatten()
      .map((uri: string) => {
        return {
          ...this.oppiaineetMap[uri],
        };
      })
      .value() as Lops2019OppiaineDto[];
  }

  get opintojaksonOppiaineidenTiedot() {
    return _.chain(this.editable!.oppiaineet)
      .map(({ koodi }) => koodi)
      .sortBy(...koodiSorters() as any[])
      .uniq()
      .map((uri: string) => {
        let oppiaineet = [this.oppiaineetMap[uri]];
        if (this.oppiaineetMap[uri].parentUri) {
          oppiaineet = [this.oppiaineetMap[uri], this.oppiaineetMap[this.oppiaineetMap[uri].parentUri!]];
        }

        if ((this.oppiaineetMap[uri] as any).perusteenOppiaineUri) {
          const perusteenOppiaine = this.oppiaineetMap[(this.oppiaineetMap[uri] as any).perusteenOppiaineUri];
          let perusteenOppiaineenParent;
          if (perusteenOppiaine.parentUri) {
            perusteenOppiaineenParent = this.oppiaineetMap[perusteenOppiaine.parentUri!];
          }
          oppiaineet = [this.oppiaineetMap[uri], perusteenOppiaine, perusteenOppiaineenParent];
        }

        return {
          nimi: this.oppiaineetMap[uri].nimi,
          arviointi: this.getOppiaineTieto(oppiaineet, 'arviointi'),
          laajaAlaisetOsaamiset: this.getOppiaineTieto(oppiaineet, 'laajaAlaisetOsaamiset'),
        };
      })
      .value() as Lops2019OppiaineDto[];
  }

  getOppiaineTieto(oppiaineet, tieto) {
    if (oppiaineet) {
      return _.chain(oppiaineet)
        .filter(oppiaine => oppiaine && oppiaine[tieto] && oppiaine[tieto].kuvaus)
        .map(oppiaine => oppiaine[tieto])
        .head()
        .value();
    }

    return {};
  }

  get paikallistenOpintojaksojenOppiaineet() {
    return _.chain(this.editable!.paikallisetOpintojaksot)
      .map('oppiaineet')
      .flatMap()
      .value();
  }

  get editoitavaOpintojaksoValittuToisessaOpintojaksossa() {
    return !_.isEmpty(_.filter(this.store.opintojaksot, opintojakso => _.includes(_.map(opintojakso.paikallisetOpintojaksot, 'koodi'), this.editable!.koodi)));
  }

  get paikallistenOppiaineidenOpintojaksot() {
    if (this.editoitavaOpintojaksoValittuToisessaOpintojaksossa) {
      return [];
    }

    return _.chain(this.editable!.oppiaineet)
      .filter('isPaikallinenOppiaine')
      .map((oppiaine) => {
        return {
          oppiaine,
          opintojaksot: _.chain(this.store.opintojaksot)
            // valittavalla ei saa olla paikallisia opintojaksoja (ei saa olla parentti)
            .filter((opintojakso) => _.isEmpty(opintojakso.paikallisetOpintojaksot))
            // valittavassa opintojaksossa on editoitavan opintojakson oppiaine
            .filter((opintojakso) => _.includes(_.map(opintojakso.oppiaineet, 'koodi'), oppiaine.koodi))
            // valittava ei ole editoitava itse
            .filter((opintojakso) => opintojakso.koodi !== this.editable!.koodi)
            .value(),
        };
      })
      .filter(oppiaine => !_.isEmpty(oppiaine.opintojaksot))
      .reject(oppiaine => _.includes(this.oppiaineetJoiltaValittuModuuli, oppiaine.oppiaine.koodi))
      .sortBy(...koodiSorters() as any[])
      .value();
  }

  get oppiaineetJoiltaValittuModuuli() {
    return _.chain(this.oppiaineidenModuulit)
      .filter(oppiaineMod => _.some(_.map(oppiaineMod.moduulit, 'koodi.uri'), (oppainemoduri) => _.includes(_.map(this.editable!.moduulit, 'koodiUri'), oppainemoduri)))
      .map('koodi.uri')
      .value();
  }

  get esitettavaPaikallistenOppiaineidenOpintojaksot() {
    return _.chain(this.editable!.oppiaineet)
      .filter('isPaikallinenOppiaine')
      .map((oppiaine) => {
        return {
          oppiaine,
          opintojaksot: _.filter(this.editable!.paikallisetOpintojaksot, (paikallinenOpintojakso) => _.includes(_.map(paikallinenOpintojakso.oppiaineet, 'koodi'), oppiaine.koodi)),
        };
      })
      .filter(oppiaineOpintojakso => !_.isEmpty(oppiaineOpintojakso.opintojaksot))
      .sortBy(...koodiSorters() as any[])
      .value();
  }

  private toggleLaajuus(oa, value) {
    oa.isModuuliton = value;
    if (value) {
      this.editable!.moduulit = _.reject(this.editable!.moduulit, moduuli => {
        const moduulikoodit = _.map(this.oppiaineidenModuulitMap[oa.koodi].moduulit, 'koodi.uri');
        return _.includes(moduulikoodit, moduuli.koodiUri);
      }) as any[];
    }
    else {
      oa.laajuus = 0;
    }
  }

  private async poistaLaaja(laaja) {
    if (await this.vahvista('vahvista-poisto')) {
      const filtered = _.reject(this.editable!.laajaAlainenOsaaminen!,
        (lo) => laaja.koodi === lo.koodi);
      Vue.set(this.editable!, 'laajaAlainenOsaaminen', filtered);
    }
  }

  private addLaaja({ koodi }) {
    this.editable!.laajaAlainenOsaaminen!.push({
      koodi,
    });
  }

  updateOppiaineet(koodit: string[]) {
    const vanhat = _.map(this.editable!.oppiaineet, 'koodi');
    const uudet = _.filter(koodit, koodi => !_.includes(vanhat, koodi));

    this.editable!.moduulit = _.filter(this.editable!.moduulit, moduuli => {
      const moduuliurit = _.chain(koodit)
        .map(koodi => this.oppiaineidenModuulitMap[koodi].moduulit)
        .flatMap()
        .map('koodi.uri')
        .value();
      return _.includes(moduuliurit, moduuli.koodiUri);
    }) as any[];

    this.editable!.oppiaineet = _.filter(this.editable!.oppiaineet, (oppiaine) => _.includes(koodit, oppiaine.koodi));
    this.editable!.oppiaineet = [
      ...this.editable!.oppiaineet,
      ..._.map(uudet, koodi => ({
        koodi,
        laajuus: 0,
        isPaikallinenOppiaine: _.includes(_.map(this.paikallisetOppiaineet, 'koodi.uri'), koodi),
        isModuuliton: _.isEmpty(this.oppiaineidenModuulitMap[koodi]) || _.isEmpty(this.oppiaineidenModuulitMap[koodi].moduulit),
      })),
    ];

    const paikallistenOpintojaksojenOppiaineKoodit = _.chain(this.editable!.paikallisetOpintojaksot)
      .map('oppianeet')
      .flatMap()
      .map('koodi')
      .value();

    this.editable!.paikallisetOpintojaksot = _.filter(this.editable!.paikallisetOpintojaksot, paikallinenopintojakso =>
      _.some(paikallinenopintojakso.oppiaineet, oppiaine => _.includes(koodit, oppiaine.koodi)));
  }

  public async load() {
    const { opintojaksoId } = this.$route.params;
    if (await this.isUusi()) {
      const result = defaults.opintojakso();
      const oaUri = _.get(this.$route, 'query.oppiaineet');
      if (oaUri) {
        result.oppiaineet!.push({
          koodi: oaUri,
          laajuus: null as any,
          isPaikallinenOppiaine: _.includes(_.map(this.paikallisetOppiaineet, 'koodi.uri'), oaUri),
          isModuuliton: _.isEmpty(this.oppiaineidenModuulitMap[oaUri]) || _.isEmpty(this.oppiaineidenModuulitMap[oaUri].moduulit),
        } as OpintojaksonOppiaine);
        delete this.$route.query.oppiaineet;
      }
      return result;
    }
    else {
      let opintojakso: any = await this.store.getTuotuOpintojakso(_.parseInt(opintojaksoId));

      if (!opintojakso) {
        const revisions = await this.store.getOpintojaksoHistoria(_.parseInt(opintojaksoId));
        const rev = revisions[revisions.length - this.versionumero];
        if (this.versionumero && rev) {
          opintojakso = await this.store.getOpintojaksoVersion(_.parseInt(opintojaksoId), rev.numero as number);
        }
        else {
          opintojakso = await this.store.getOpintojakso(_.parseInt(opintojaksoId));
        }
      }
      else {
        opintojakso.tuotuOpintojakso = true;
        opintojakso.opintojaksonOpetussuunnitelma = await this.store.getOpintojaksonOpetussuunnitelma(_.parseInt(opintojaksoId));
      }

      _.forEach(opintojakso.oppiaineet, (oa: OpintojaksonOppiaine) => {
        oa.isPaikallinenOppiaine = _.includes(_.map(this.paikallisetOppiaineet, 'koodi.uri'), oa.koodi);
        oa.isModuuliton = this.isModuuliton(oa);
      });

      if (opintojakso) {
        this.breadcrumb('opintojakso', opintojakso.nimi);
      }

      return opintojakso;
    }
  }

  isModuuliton(oa: OpintojaksonOppiaine) {
    return !_.isNil(oa.laajuus) || _.isEmpty(this.oppiaineidenModuulitMap[oa.koodi]) || _.isEmpty(this.oppiaineidenModuulitMap[oa.koodi].moduulit);
  }

  async save(opintojakso: Lops2019OpintojaksoDto) {
    _.forEach(opintojakso.oppiaineet, oa => {
      if (!(oa as any).isModuuliton) {
        oa.laajuus = null as any;
      }
    });

    if (await this.isUusi()) {
      const uusi = await this.store.addOpintojakso(opintojakso);
      return () => {
        this.$router.push({
          name: 'opintojakso',
          params: {
            ...this.$router.currentRoute.params,
            opintojaksoId: _.toString(uusi.id),
          },
        });
      };
    }
    else {
      await this.store.saveOpintojakso(opintojakso);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

/deep/ .nimi {
  // font-size: 150%;
  // font-weight: 600;
}

.moduulit {
  display: flex;
  flex-wrap: wrap;

  .moduuli {
    margin: 0 10px 10px 0;
  }
}

.liitetyt-moduulit {
  .taso {
    margin-left: 8px;
  }
}

hr.valiviiva {
  margin: 30px 0 30px 0;
}

.block-container {
  padding-top: 20px;
}

.collapse-container {
  padding-top: 30px;
  padding-bottom: 30px;

  div.ep-collapse {
    border-top: 1px solid #ccc;
    padding: 10px 10px 10px 0;
  }

  div.ep-collapse:last-child {
    border-bottom: 1px solid #ccc;
  }
}

.osio {
  padding: 27px 0 0 0;

  .paikallinen-laaja-alainen {
    margin-bottom: 20px;
  }

  .alueotsikko {
    color: #010013;
    // font-size: 20px;
    margin-bottom: 24px;
  }

  .moduuliotsikko {
    // font-size: 18px;
    color: #2B2B2B;
    // font-weight: 600;
    margin-bottom: 8px;

    .moduulikuvaukset {
      font-size: 1rem;
    }
  }

  .perustesisalto {
    color: #2B2B2B;
    // font-size: 16px;
    margin-bottom: 10px;
    padding-bottom: 5px;
  }
}

.moduulilista {
  margin-top: 27px;
  .checked {
    color: $blue-lighten-1;
  }

  span.nimi {
    padding: 5px;
  }

  span.laajuus {
    padding: 5px;
  }
}

.sidepad {
  padding: 8px;
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

.muokkaus-esto {
  font-size: 0.8rem;
  color: $gray-lighten-1;

  .lisainfo {
    color: $blue-lighten-5;
    cursor: pointer;
  }
}

</style>
