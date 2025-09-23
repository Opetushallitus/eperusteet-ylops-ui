<template>
<div id="scroll-anchor" class="content">
  <div v-if="editointiStore">
    <ep-editointi :store="editointiStore"
                  :versionumero="versionumero"
                  type="opintojakso">
      <template #muokkaa-content="{ data }">
        <template v-if="data.tuotuOpintojakso">
          <div class="muokkaus-esto align-self-center">
            {{$t('et-voi-muokata-pohjan-opintojaksoa')}}
            <div class="d-inline" v-if="data.opintojaksonOpetussuunnitelma">
              <b-button @click="remove(data)" variant="link" id="muokkaus-esto">
                {{ $t('poista-opintojakso') }}
              </b-button>
            </div>
          </div>
        </template>
      </template>
      <template #ohje>
        <div class="sidepad">
          <p v-html="$t('ohje-opintojakso')">
          </p>
          <p v-html="$t('ohje-opintojakso-saannot')">
          </p>
        </div>
      </template>
      <template #keskustelu>
        <ep-comment-threads />
      </template>
      <template #header="{ data }">
        <h2 class="nimi mb-0">{{ $kaanna(data.nimi) || $t('opintojakso') }}</h2>
      </template>
      <template #default="{ data, validation, isEditing }">
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
              <ep-form-content>
                <div class="d-flex">
                  <label class="mr-1">{{$t('koodi')}}</label>
                  <EpInfoPopover v-if="isEditing">
                    <div v-html="$t('koodiohje')"></div>
                  </EpInfoPopover>
                </div>
                <ep-field help="opintojakso-koodi-ohje" v-model="data.koodi" type="string" :validation="validation.koodi" :is-editing="isEditing" />
              </ep-form-content>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <ep-form-content name="oppiaineet">
                <ep-oppiaine-selector
                  v-if="isEditing"
                  :opetussuunnitelma-store="opetussuunnitelmaStoreRef"
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
              <div class="moduulit" v-if="!oa.isModuuliton">
                <div class="moduuli mb-2" v-for="(moduuli, index) in oppiaineidenModuulitMap[oa.koodi].moduulit" :key="index+'oppiaineetMap.moduulit'">
                  <ep-opintojakson-moduuli
                    :moduuli="moduuli"
                    :is-editing="true"
                    v-model="data.moduulit"
                    :opetussuunnitelmaStore="opetussuunnitelmaStoreRef"/>
                </div>
              </div>
              <div class="col-md-4 mt-3 px-0">
                <ep-form-content :name="oa.isModuuliton ? 'laajuus' : 'lisalaajuus'">
                  <ep-field
                    type="number"
                    :help="oa.isModuuliton ? 'oppiainekohtainen-laajuus-opintojaksossa' : 'oppiainekohtainen-lisalaajuus-opintojaksossa-kuvaus'"
                    :validation="validation.oppiaineet.$each.$iter[index].laajuus"
                    v-model="oa.laajuus"
                    :is-header="false"
                    :is-editing="isEditing">
                    {{ $t('op') }}
                  </ep-field>
                </ep-form-content>
              </div>
            </div>
          </div>
          <div class="oppiaineet" v-if="!isEditing">
            <div class="moduulit" v-if="editable && editable.moduulit">
              <div class="moduuli mb-2" v-for="(moduuli, index) in editable.moduulit" :key="index+'editable.moduulit.oppiaineet'">
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
                  <EpMaterialIcon class="checked">check</EpMaterialIcon>
                  <span class="nimi">{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</span>
                </div>
                <div class="p-2">
                  <span class="laajuus">{{ moduulitMap[moduuli.koodiUri].laajuus }} {{ $t('opintopiste') }}</span>
                  <ep-color-indicator :kind="moduulitMap[moduuli.koodiUri].pakollinen ? 'pakollinen' : 'valinnainen'" />
                </div>
              </div>
            </div>
            <div class="mt-3" v-if="!isEditing">
              <ep-form-content name="lisalaajuus">
                <span>{{ lisalaajuus }} {{ $t('op') }}</span>
              </ep-form-content>
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
            <template #header>
              <div class="alueotsikko"><h3>{{ $t('tavoitteet') }}</h3></div>
            </template>
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
            <template #header>
              <div class="alueotsikko"><h3>{{ $t('keskeiset-sisallot') }}</h3></div>
            </template>
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

        <div class="osio" v-if="!isLuva">
         <ep-collapse tyyppi="opintojakson-laaja-alaiset">
            <template #header>
              <div class="alueotsikko"><h3>{{ $t('laaja-alaiset-sisallot') }}</h3></div>
            </template>

            <div class="perustesisalto" v-for="(oppiaine, idx) in opintojaksonOppiaineidenTiedot" :key="idx+'opintojaksonOppiaineet'">
              <div v-if="oppiaine.laajaAlaisetOsaamiset && oppiaine.laajaAlaisetOsaamiset.kuvaus">
                <div class="moduuliotsikko"><h4 v-html="$kaanna(oppiaine.nimi)"></h4></div>
                <ep-content
                  layout="normal"
                  :kasiteHandler="kasiteHandler"
                  :kuvaHandler="kuvaHandler"
                  :value="oppiaine.laajaAlaisetOsaamiset.kuvaus"
                  help="ohje-lyhyt-laaja-alainen"></ep-content>
              </div>
              <!-- Todo: Tee parempi ratkaisu tähän -->
              <div v-else-if="oppiaine.laajaAlainenOsaaminen">
                <div class="moduuliotsikko"><h4 v-html="$kaanna(oppiaine.nimi)"></h4></div>
                <ep-content v-for="(laajalainenosaaminen, index) in oppiaine.laajaAlainenOsaaminen" :key="index+'oppiaine.laajaAlainenOsaaminen'"
                    layout="normal"
                    :kasiteHandler="kasiteHandler"
                    :kuvaHandler="kuvaHandler"
                    :value="laajalainenosaaminen.kuvaus"></ep-content>
              </div>
            </div>

            <div class="moduuliotsikko"><h4>{{ $t('paikallinen-lisays-opintojakso-laaja-alainen') }}</h4></div>

            <div class="paikallinen-laaja-alainen" v-for="(lo, index) in data.laajaAlainenOsaaminen" :key="index+'laajaAlainenOsaaminen'">
              <div>
                <span v-if="laajaAlaisetKooditByUri[lo.koodi]">
                  <h5 class="d-inline">{{ $kaanna(laajaAlaisetKooditByUri[lo.koodi].nimi) }}</h5>
                  <b-button variant="link" @click.stop="poistaLaaja(lo)" v-if="isEditing">
                    <EpMaterialIcon>close</EpMaterialIcon>
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
                  <div class="moduuliotsikko">
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
            <template #header>
              <div class="alueotsikko"><h3>{{ $t('opintojakson-arviointi') }}</h3></div>
            </template>

            <div class="perustesisalto" v-for="(oppiaine, idx) in opintojaksonOppiaineidenTiedot" :key="idx+'op-arviointi'">
              <div v-if="oppiaine.arviointi && oppiaine.arviointi.kuvaus">
                <div class="moduuliotsikko"><h4 v-html="$kaanna(oppiaine.nimi)"></h4></div>
                <ep-content
                  layout="normal"
                  :kasiteHandler="kasiteHandler"
                  :kuvaHandler="kuvaHandler"
                  :value="oppiaine.arviointi.kuvaus"></ep-content>
              </div>
            </div>
            <div class="moduuliotsikko"><h4>{{ $t('paikallinen-lisays-opintojakso-arviointi') }}</h4></div>
            <div class="alert alert-info" v-if="!isEditing && !data.arviointi">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <ep-content
              :kasiteHandler="kasiteHandler"
              :kuvaHandler="kuvaHandler"
              layout="normal"
              v-model="data.arviointi"
              :is-editable="isEditing"></ep-content>

            <div v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot" :key="index+'paik-arviointi'" class="mt-4">
              <div v-if="paikallinenOpintojakso.arviointi">
                <div class="moduuliotsikko"><h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4></div>
                <ep-content
                  :kasiteHandler="kasiteHandler"
                  :kuvaHandler="kuvaHandler"
                  layout="normal"
                  v-model="paikallinenOpintojakso.arviointi"
                  :is-editable="false"></ep-content>
              </div>
            </div>
          </ep-collapse>
        </div>

        <div class="osio" v-if="isLuva">
          <ep-collapse tyyppi="opiskeluymparisto-ja-tyotavat">
            <template #header>
              <div class="alueotsikko"><h3>{{ $t('opiskeluymparisto-ja-tyotavat') }}</h3></div>
            </template>

            <div class="perustesisalto" v-for="(oppiaine, idx) in opintojaksonOppiaineidenTiedot" :key="idx+'op-opiskeluymparistoTyotavat'">
              <div v-if="oppiaine.opiskeluymparistoTyotavat && oppiaine.opiskeluymparistoTyotavat.kuvaus">
                <div class="moduuliotsikko"><h4 v-html="$kaanna(oppiaine.nimi)"></h4></div>
                <ep-content
                  layout="normal"
                  :kasiteHandler="kasiteHandler"
                  :kuvaHandler="kuvaHandler"
                  :value="oppiaine.opiskeluymparistoTyotavat.kuvaus"></ep-content>
              </div>
            </div>
            <div class="moduuliotsikko"><h4>{{ $t('paikallinen-lisays-opintojakso-opiskeluymparisto-ja-tyotavat') }}</h4></div>
            <div class="alert alert-info" v-if="!isEditing && !data.opiskeluymparistoTyotavat">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <ep-content
              :kasiteHandler="kasiteHandler"
              :kuvaHandler="kuvaHandler"
              layout="normal"
              v-model="data.opiskeluymparistoTyotavat"
              :is-editable="isEditing"></ep-content>

            <div v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot" :key="index+'paik-opiskeluymparistoTyotavat'" class="mt-4">
              <div v-if="paikallinenOpintojakso.opiskeluymparistoTyotavat">
                <div class="moduuliotsikko"><h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4></div>
                <ep-content
                  :kasiteHandler="kasiteHandler"
                  :kuvaHandler="kuvaHandler"
                  layout="normal"
                  v-model="paikallinenOpintojakso.opiskeluymparistoTyotavat"
                  :is-editable="false"></ep-content>
              </div>
            </div>
          </ep-collapse>
        </div>

        <div class="osio">
          <ep-collapse tyyppi="opintojakson-vapaa-kuvaus" :border-bottom="false">
            <template #header>
              <div class="alueotsikko"><h3>{{ $t('opintojakson-vapaa-kuvaus') }}</h3></div>
            </template>
            <div class="alert alert-info" v-if="!isEditing && !data.kuvaus">{{ $t('ei-kuvausta') }}</div>
            <ep-content
              :kasiteHandler="kasiteHandler"
              :kuvaHandler="kuvaHandler"
              layout="normal"
              v-model="data.kuvaus"
              :is-editable="isEditing"
              help="ohje-lyhyt-vapaa-kuvaus" ></ep-content>
          </ep-collapse>
        </div>
      </template>
    </ep-editointi>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpList from '@shared/components/forms/EpList.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpOpintojaksonModuuli from '@shared/components/EpOpintojaksonModuuli/EpOpintojaksonModuuli.vue';
import EpOpintojaksoSelect from './EpOpintojaksoSelect.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { OpintojaksoStore } from '@/stores/opintojaksoStore';
import { PerusteCache } from '@/stores/peruste';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto, Opetussuunnitelmat, Lops2019OpintojaksonModuuliDto } from '@shared/api/ylops';
import { KoodistoLops2019LaajaAlaiset, koodiSorters, paikallisestiSallitutLaajennokset } from '@/utils/perusteet';
import { Kielet } from '@shared/stores/kieli';
import { useEpOpsRoute } from '@/mixins/EpOpsRoute';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $kaanna, $t, $vahvista } from '@shared/utils/globals';

interface OpintojaksonOppiaine {
  koodi: string;
  laajuus: number;
  isPaikallinenOppiaine: boolean;
  isModuuliton: boolean;
}

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
  oppiaineUri?: string;
}>();

// Use composables
const route = useRoute();
const { store, opsId, kasiteHandler, kuvaHandler, isLuva } = useEpOpsRoute(props.opetussuunnitelmaStore);

// Component state
const oppiaineQuery = ref('');
const cache = ref<PerusteCache | null>(null);
const laajaAlaisetKoodit = ref<any | null>(null);
const tempModules = ref<Lops2019OpintojaksonModuuliDto[] | undefined>(undefined);
const editointiStore = ref<EditointiStore | null>(null);

// Computed properties
const laajaAlaisetSorted = computed(() => {
  return _.sortBy(laajaAlaisetKoodit.value, 'koodiArvo');
});

const editable = computed({
  get: () => editointiStore.value?.data.value,
  set: (data) => editointiStore.value?.setData(data)
});

const isLoading = computed(() => {
  return editointiStore.value?.isLoading?.value || false;
});

const opetussuunnitelmaStoreRef = computed(() => {
  return store.value;
});

const versionumero = computed(() => {
  return _.parseInt(_.get(route, 'query.versionumero') as any);
});

// Methods
const remove = async (data: any) => {
  return editointiStore.value?.remove();
};

const init = async () => {
  cache.value = await PerusteCache.of(_.parseInt(route.params.id as string));
  try {
    laajaAlaisetKoodit.value = (await Opetussuunnitelmat.getKoodistonKoodit(
      opsId.value,
      KoodistoLops2019LaajaAlaiset)).data;
  }
  catch (err) {
    console.error(err);
  }
};

const oppiaineFilter = (oppiaine) => {
  return !_.some(paikallisestiSallitutLaajennokset(), (laajennos) =>
    _.startsWith(oppiaine.koodiUri, laajennos));
};

// Lifecycle
onMounted(async () => {
  await init();

  editointiStore.value = new EditointiStore(new OpintojaksoStore(
    opsId.value,
    route.params.opintojaksoId,
    versionumero.value,
    store.value, // Access the parent store
    route.params.opintojaksoId === 'uusi',
    _.get(route, 'query.oppiaineet') as string,
  ));
});

const laajaAlaistenKoodit = computed(() => {
  const lisatyt = _.map(editable.value?.laajaAlainenOsaaminen || [], 'koodi');
  return _.map(laajaAlaisetKoodit.value, lo => ({
    koodi: lo.koodiUri,
    nimi: lo.nimi,
    hasPaikallinenKuvaus: _.includes(lisatyt, lo.koodi),
  }));
});

const laajaAlaisetKooditByUri = computed(() => {
  return _.keyBy(laajaAlaistenKoodit.value, 'koodi');
});

const paikallisetOppiaineet = computed(() => {
  return _.chain(store.value.paikallisetOppiaineet)
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
});

const oppiaineet = computed(() => {
  return [
    ...cache.value?.peruste.oppiaineet || [],
    ...paikallisetOppiaineet.value,
  ] as Lops2019OppiaineDto[];
});

const laajuusJohdettavusTeksti = computed(() => {
  if (!_.isEmpty(editable.value?.moduulit) && !_.isEmpty(editable.value?.paikallisetOpintojaksot)) {
    return `(${$t('johdetaan-moduuleista-ja-opintojaksoista')})`;
  }
  else if (!_.isEmpty(editable.value?.moduulit) && lisalaajuus.value > 0) {
    return `(${_.toLower($t('moduulit') as string)} ${laajuusModuuleista.value} ${$t('op')}, ${_.toLower($t('lisalaajuus') as string)} ${lisalaajuus.value} ${$t('op')})`;
  }
  else if (!_.isEmpty(editable.value?.moduulit)) {
    return `(${$t('johdetaan-moduuleista')})`;
  }
  else if (!_.isEmpty(editable.value?.paikallisetOpintojaksot)) {
    return `(${$t('johdetaan-opintojaksoista')})`;
  }

  return '';
});

const laajuus = computed(() => {
  let result: number = _.chain(editable.value?.oppiaineet || [])
    .filter((oppiaine) => !_.includes(_.map(paikallistenOpintojaksojenOppiaineet.value, 'koodi'), oppiaine.koodi))
    .filter('laajuus')
    .map('laajuus')
    .map(_.parseInt)
    .sum()
    .value();
  if (editable.value && editable.value.moduulit && !_.isEmpty(editable.value.moduulit)) {
    result += _.chain(editable.value.moduulit)
      .map('koodiUri')
      .map((uri: string) => moduulitMap.value[uri].laajuus)
      .map(_.parseInt)
      .sum()
      .value();
  }
  result += _.chain(editable.value?.paikallisetOpintojaksot || [])
    .map('laajuus')
    .sum()
    .value();

  return result;
});

const oppiaineetJaOppimaarat = computed(() => {
  return _.chain(oppiaineet.value)
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
    .value();
});

const oppiaineetMap = computed(() => {
  return _.keyBy(oppiaineetJaOppimaarat.value, 'koodi.uri');
});

const oppiaineidenModuulit = computed(() => {
  return _.chain(oppiaineetJaOppimaarat.value)
    .map((oa: any) => {
      if (oa.perusteenOppiaineUri) {
        return {
          ...oa,
          moduulit: oppiaineetMap.value[oa.perusteenOppiaineUri].moduulit,
        };
      }
      else {
        return oa;
      }
    })
    .value();
});

const oppiaineidenModuulitMap = computed(() => {
  return _.chain(oppiaineidenModuulit.value)
    .keyBy('koodi.uri')
    .value();
});

const moduulit = computed(() => {
  return _.chain(oppiaineetJaOppimaarat.value)
    .map((oa) => _.map(oa.moduulit, (moduuli) => ({
      ...moduuli,
      oppiaineUri: oa.koodi!.uri,
    })))
    .flatten()
    .sortBy(...koodiSorters())
    .value() as (Lops2019ModuuliDto & { oppiaineUri: string })[];
});

const moduulitMap = computed(() => {
  return _.chain(moduulit.value)
    .keyBy('koodi.uri')
    .value();
});

const filteredOppiaineet = computed(() => {
  return _.chain(oppiaineetJaOppimaarat.value)
    .filter((org) => Kielet.search(oppiaineQuery.value, org.nimi))
    .map('koodi.uri')
    .value();
});

const oppiaineetModuuliTaiIlman = computed(() => {
  return _.chain(editable.value?.oppiaineet || [])
    .filter((oppiaine) => !_.includes(_.map(paikallistenOpintojaksojenOppiaineet.value, 'koodi'), oppiaine.koodi))
    .value();
});

const paikallistenOpintojaksojenOppiaineet = computed(() => {
  return _.chain(editable.value?.paikallisetOpintojaksot || [])
    .map('oppiaineet')
    .flatMap()
    .value();
});

const lisalaajuus = computed(() => {
  return (editable.value?.oppiaineet || []).reduce((acc, { laajuus }) => acc + (laajuus || 0), 0);
});

const laajuusModuuleista = computed(() => {
  return laajuus.value - lisalaajuus.value;
});

const opintojaksonOppiaineet = computed(() => {
  return _.chain(editable.value?.oppiaineet || [])
    .map(({ koodi }) => koodi)
    .sortBy(...koodiSorters() as any[])
    .uniq()
    .map((uri: string) => {
      if (oppiaineetMap.value[uri]?.parentUri) {
        return [oppiaineetMap.value[uri].parentUri, uri];
      }
      else {
        return [uri];
      }
    })
    .flatten()
    .map((uri: string) => {
      return {
        ...oppiaineetMap.value[uri],
      };
    })
    .value();
});

const getOppiaineTieto = (oppiaineet: any[], tieto: string): any => {
  if (oppiaineet && oppiaineet.length > 0) {
    const result = _.chain(oppiaineet)
      .filter(oppiaine => oppiaine && oppiaine[tieto] && oppiaine[tieto].kuvaus)
      .map(oppiaine => oppiaine[tieto])
      .head()
      .value();
    return result || null;
  }

  return null;
};

const opintojaksonOppiaineidenTiedot = computed(() => {
  return _.chain(editable.value?.oppiaineet || [])
    .map(({ koodi }) => koodi)
    .sortBy(...koodiSorters() as any[])
    .uniq()
    .map((uri: string) => {
      let oppiaineet = [oppiaineetMap.value[uri]];
      if (oppiaineetMap.value[uri]?.parentUri) {
        oppiaineet = [oppiaineetMap.value[uri], oppiaineetMap.value[oppiaineetMap.value[uri].parentUri!]];
      }

      if ((oppiaineetMap.value[uri] as any)?.perusteenOppiaineUri) {
        const perusteenOppiaine = oppiaineetMap.value[(oppiaineetMap.value[uri] as any).perusteenOppiaineUri];
        let perusteenOppiaineenParent;
        if (perusteenOppiaine?.parentUri) {
          perusteenOppiaineenParent = oppiaineetMap.value[perusteenOppiaine.parentUri!];
        }
        oppiaineet = [oppiaineetMap.value[uri], perusteenOppiaine, perusteenOppiaineenParent];
      }

      return {
        nimi: oppiaineetMap.value[uri]?.nimi,
        arviointi: getOppiaineTieto(oppiaineet, 'arviointi'),
        laajaAlaisetOsaamiset: getOppiaineTieto(oppiaineet, 'laajaAlaisetOsaamiset'),
        opiskeluymparistoTyotavat: getOppiaineTieto(oppiaineet, 'opiskeluymparistoTyotavat'),
      };
    })
    .value();
});

const editoitavaOpintojaksoValittuToisessaOpintojaksossa = computed(() => {
  return !_.isEmpty(_.filter(store.value.opintojaksot, opintojakso => _.includes(_.map(opintojakso.paikallisetOpintojaksot, 'koodi'), editable.value?.koodi)));
});

const oppiaineetJoiltaValittuModuuli = computed(() => {
  return _.chain(oppiaineidenModuulit.value)
    .filter(oppiaineMod => _.some(_.map(oppiaineMod.moduulit, 'koodi.uri'), (oppainemoduri) => _.includes(_.map(editable.value?.moduulit || [], 'koodiUri'), oppainemoduri)))
    .map('koodi.uri')
    .value();
});

const paikallistenOppiaineidenOpintojaksot = computed(() => {
  if (editoitavaOpintojaksoValittuToisessaOpintojaksossa.value) {
    return [];
  }

  return _.chain(editable.value?.oppiaineet || [])
    .filter('isPaikallinenOppiaine')
    .map((oppiaine) => {
      return {
        oppiaine,
        opintojaksot: _.chain(store.value.opintojaksot)
          // valittavalla ei saa olla paikallisia opintojaksoja (ei saa olla parentti)
          .filter((opintojakso) => _.isEmpty(opintojakso.paikallisetOpintojaksot))
          // valittavassa opintojaksossa on editoitavan opintojakson oppiaine
          .filter((opintojakso) => _.includes(_.map(opintojakso.oppiaineet, 'koodi'), oppiaine.koodi))
          // valittava ei ole editoitava itse
          .filter((opintojakso) => opintojakso.koodi !== editable.value?.koodi)
          .value(),
      };
    })
    .filter(oppiaine => !_.isEmpty(oppiaine.opintojaksot))
    .reject(oppiaine => _.includes(oppiaineetJoiltaValittuModuuli.value, oppiaine.oppiaine.koodi))
    .sortBy(...koodiSorters() as any[])
    .value();
});

const esitettavaPaikallistenOppiaineidenOpintojaksot = computed(() => {
  return _.chain(editable.value?.oppiaineet || [])
    .filter('isPaikallinenOppiaine')
    .map((oppiaine) => {
      return {
        oppiaine,
        opintojaksot: _.filter(editable.value?.paikallisetOpintojaksot || [], (paikallinenOpintojakso) => _.includes(_.map(paikallinenOpintojakso.oppiaineet, 'koodi'), oppiaine.koodi)),
      };
    })
    .filter(oppiaineOpintojakso => !_.isEmpty(oppiaineOpintojakso.opintojaksot))
    .sortBy(...koodiSorters() as any[])
    .value();
});

const toggleLaajuus = (oa, value) => {
  oa.isModuuliton = value;
  if (value && editable.value) {
    tempModules.value = editable.value.moduulit && editable.value.moduulit.length > 0 ? editable.value.moduulit : undefined;
    editable.value = {
      ...editable.value,
      moduulit: _.reject(editable.value.moduulit, moduuli => {
        const moduulikoodit = _.map(oppiaineidenModuulitMap.value[oa.koodi]?.moduulit || [], 'koodi.uri');
        return _.includes(moduulikoodit, moduuli.koodiUri);
      }) as any[],
    };
  }
  else if (tempModules.value) {
    editable.value = {
      ...editable.value,
      moduulit: tempModules.value,
    };
  }
};

const poistaLaaja = async (laaja) => {
  if (await $vahvista('vahvista-poisto')) {
    if (editable.value) {
      const filtered = _.reject(editable.value.laajaAlainenOsaaminen || [],
        (lo) => laaja.koodi === lo.koodi);
      editable.value = {
        ...editable.value,
        laajaAlainenOsaaminen: filtered,
      };
    }
  }
};

const addLaaja = ({ koodi }) => {
  if (editable.value) {
    editable.value = {
      ...editable.value,
      laajaAlainenOsaaminen: [
        ...(editable.value.laajaAlainenOsaaminen || []),
        { koodi },
      ],
    };
  }
};

const updateOppiaineet = (koodit: string[]) => {
  if (!editable.value) return;

  const vanhat = _.map(editable.value.oppiaineet, 'koodi');
  const uudet = _.filter(koodit, koodi => !_.includes(vanhat, koodi));

  const filteredModuulit = _.filter(editable.value.moduulit, moduuli => {
    const moduuliurit = _.chain(koodit)
      .map(koodi => oppiaineidenModuulitMap.value[koodi]?.moduulit || [])
      .flatMap()
      .map('koodi.uri')
      .value();
    return _.includes(moduuliurit, moduuli.koodiUri);
  }) as any[];

  const filteredOppiaineet = _.filter(editable.value.oppiaineet, (oppiaine) => _.includes(koodit, oppiaine.koodi));
  const updatedOppiaineet = [
    ...filteredOppiaineet,
    ..._.map(uudet, koodi => ({
      koodi,
      laajuus: 0,
      isPaikallinenOppiaine: _.includes(_.map(paikallisetOppiaineet.value, 'koodi.uri'), koodi),
      isModuuliton: _.isEmpty(oppiaineidenModuulitMap.value[koodi]) || _.isEmpty(oppiaineidenModuulitMap.value[koodi]?.moduulit),
    })),
  ];

  const filteredPaikallisetOpintojaksot = _.filter(editable.value.paikallisetOpintojaksot, paikallinenopintojakso =>
    _.some(paikallinenopintojakso.oppiaineet, oppiaine => _.includes(koodit, oppiaine.koodi)));

  editable.value = {
    ...editable.value,
    moduulit: filteredModuulit,
    oppiaineet: updatedOppiaineet,
    paikallisetOpintojaksot: filteredPaikallisetOpintojaksot,
  };
};

const isModuuliton = (oa: OpintojaksonOppiaine) => {
  return _.isEmpty(editable.value?.moduulit) || _.isEmpty(oppiaineidenModuulitMap.value[oa.koodi]) || _.isEmpty(oppiaineidenModuulitMap.value[oa.koodi]?.moduulit);
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

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
