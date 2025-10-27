<template>
  <div
    id="scroll-anchor"
    class="content"
  >
    <div v-if="editointiStore">
      <ep-editointi
        :store="editointiStore"
        :versionumero="versionumero"
        type="opintojakso"
      >
        <template #muokkaa-content="{ data }">
          <template v-if="data.tuotuOpintojakso">
            <div class="muokkaus-esto align-self-center">
              {{ $t('et-voi-muokata-pohjan-opintojaksoa') }}
              <div
                v-if="data.opintojaksonOpetussuunnitelma"
                class="d-inline"
              >
                <b-button
                  id="muokkaus-esto"
                  variant="link"
                  @click="remove(data)"
                >
                  {{ $t('poista-opintojakso') }}
                </b-button>
              </div>
            </div>
          </template>
        </template>
        <template #ohje>
          <div class="sidepad">
            <p v-html="$t('ohje-opintojakso')" />
            <p v-html="$t('ohje-opintojakso-saannot')" />
          </div>
        </template>
        <template #keskustelu>
          <ep-comment-threads />
        </template>
        <template #header="{ data }">
          <h2 class="nimi mb-0">
            {{ $kaanna(data.nimi) || $t('opintojakso') }}
          </h2>
        </template>
        <template #default="{ data, validation, isEditing }">
          <div class="osio">
            <div class="row">
              <div class="col-md-6">
                <ep-form-content name="nimi">
                  <ep-field
                    v-model="data.nimi"
                    help="opintojakso-nimi-ohje"
                    :validation="validation.nimi"
                    :is-header="false"
                    :is-editing="isEditing"
                  />
                </ep-form-content>
              </div>
              <div class="col-md-6">
                <ep-form-content>
                  <div class="d-flex">
                    <label class="mr-1">{{ $t('koodi') }}</label>
                    <EpInfoPopover v-if="isEditing">
                      <div v-html="$t('koodiohje')" />
                    </EpInfoPopover>
                  </div>
                  <ep-field
                    v-model="data.koodi"
                    help="opintojakso-koodi-ohje"
                    type="string"
                    :validation="validation.koodi"
                    :is-editing="isEditing"
                  />
                </ep-form-content>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <ep-form-content name="oppiaineet">
                  <ep-oppiaine-selector
                    v-if="isEditing"
                    :is-editable="true"
                    :opetussuunnitelma-store="store"
                    :ops-id="opsId"
                    :validation="validation.oppiaineet"
                    :model-value="data.oppiaineet.map(x => x.koodi)"
                    :oppiaine-filter="oppiaineFilter"
                    @update:model-value="updateOppiaineet"
                  />
                  <div v-else>
                    <ul>
                      <li
                        v-for="(oa,index) in data.oppiaineet"
                        :key="index+'data.oppiaineet.select'"
                      >
                        {{ $kaanna(oppiaineetMap[oa.koodi].nimi) }}
                      </li>
                    </ul>
                  </div>
                </ep-form-content>
              </div>
              <div class="col-md-6">
                <ep-form-content name="opintopisteet">
                  <span>{{ laajuus }} {{ $t('opintopiste') }} {{ laajuusJohdettavusTeksti }}</span>
                </ep-form-content>
              </div>
            </div>
          </div>
          <hr v-if="isEditing">
          <div
            v-if="isEditing || data.moduulit.length > 0"
            class="osio"
          >
            <div class="alueotsikko">
              <h3>{{ $t('opintojakson-moduulit') }}</h3>
            </div>
            <div
              v-if="isEditing"
              class="oppiaineet"
            >
              <div
                v-for="(oa, index) in oppiaineetModuuliTaiIlman"
                :key="index+'oppiaineetModuuliTaiIlman'"
                class="mb-4"
              >
                <div class="d-flex moduuliotsikko">
                  <div
                    v-if="oppiaineetMap[oa.koodi]"
                    class="flex-grow-1"
                  >
                    {{ $kaanna(oppiaineetMap[oa.koodi].nimi) }}
                  </div>
                  <div
                    v-if="isEditing && !oa.isModuuliton"
                    class="moduulikuvaukset mr-5 d-inline-flex"
                  >
                    <div>
                      <ep-color-indicator kind="pakollinen" />
                      <span class="ml-2">{{ $t('pakollinen') }}</span>
                    </div>
                    <div>
                      <ep-color-indicator
                        class="ml-4"
                        kind="valinnainen"
                      />
                      <span class="ml-2">{{ $t('valinnainen') }}</span>
                    </div>
                  </div>
                  <ep-toggle
                    class="mb-2"
                    :model-value="oa.isModuuliton"
                    @update:model-value="toggleLaajuus(oa, $event)"
                  >
                    <span class="label">
                      {{ $t('ilman-moduuleita') }}
                    </span>
                  </ep-toggle>
                </div>
                <div
                  v-if="!oa.isModuuliton"
                  class="moduulit"
                >
                  <div
                    v-for="(moduuli, index) in oppiaineidenModuulitMap[oa.koodi].moduulit"
                    :key="index+'oppiaineetMap.moduulit'"
                    class="moduuli mb-2"
                  >
                    <ep-opintojakson-moduuli
                      v-model="data.moduulit"
                      :moduuli="moduuli"
                      :is-editing="true"
                      :opetussuunnitelma-store="store"
                    />
                  </div>
                </div>
                <div class="col-md-4 mt-3 px-0">
                  <ep-form-content :name="oa.isModuuliton ? 'laajuus' : 'lisalaajuus'">
                    <ep-field
                      v-model="oa.laajuus"
                      type="number"
                      :help="oa.isModuuliton ? 'oppiainekohtainen-laajuus-opintojaksossa' : 'oppiainekohtainen-lisalaajuus-opintojaksossa-kuvaus'"
                      :validation="validation.oppiaineet.$each.$response.$data[index].laajuus"
                      :is-header="false"
                      :is-editing="isEditing"
                    >
                      {{ $t('op') }}
                    </ep-field>
                  </ep-form-content>
                </div>
              </div>
            </div>
            <div
              v-if="!isEditing"
              class="oppiaineet"
            >
              <div
                v-if="editable && editable.moduulit"
                class="moduulit"
              >
                <div
                  v-for="(moduuli, index) in editable.moduulit"
                  :key="index+'editable.moduulit.oppiaineet'"
                  class="moduuli mb-2"
                >
                  <ep-opintojakson-moduuli
                    :moduuli="moduulitMap[moduuli.koodiUri]"
                    :model-value="data.moduulit"
                  />
                </div>
              </div>
            </div>
            <div
              v-if="editable.moduulit.length > 0"
              class="moduulilista"
            >
              <h4>{{ $t('valitut-moduulit') }}</h4>
              <div
                v-for="(moduuli, idx) in editable.moduulit"
                :key="idx+'editable.moduulit.moduulilista'"
              >
                <div class="d-flex">
                  <div class="p-2 flex-grow-1">
                    <EpMaterialIcon class="checked">
                      check
                    </EpMaterialIcon>
                    <span class="nimi">{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</span>
                  </div>
                  <div class="p-2">
                    <span class="laajuus">{{ moduulitMap[moduuli.koodiUri].laajuus }} {{ $t('opintopiste') }}</span>
                    <ep-color-indicator :kind="moduulitMap[moduuli.koodiUri].pakollinen ? 'pakollinen' : 'valinnainen'" />
                  </div>
                </div>
              </div>
              <div
                v-if="!isEditing"
                class="mt-3"
              >
                <ep-form-content name="lisalaajuus">
                  <span>{{ lisalaajuus }} {{ $t('op') }}</span>
                </ep-form-content>
              </div>
            </div>
          </div>
          <div
            v-if="editable.paikallisetOpintojaksot.length > 0 || (isEditing && paikallistenOppiaineidenOpintojaksot.length > 0)"
            class="osio"
          >
            <hr>
            <div class="alueotsikko">
              <h3>{{ $t('paikallisen-oppiaineen-opintojaksot') }}</h3>
            </div>
            <div class="oppiaineet">
              <div v-if="isEditing">
                <div
                  v-for="(oppiaineOpintojakso, index) in paikallistenOppiaineidenOpintojaksot"
                  :key="index+'paikallistenOppiaineidenOpintojaksot'"
                >
                  {{ $kaanna(oppiaineetMap[oppiaineOpintojakso.oppiaine.koodi].nimi) }}
                  <ep-opintojakso-select
                    v-model="editable.paikallisetOpintojaksot"
                    :options="oppiaineOpintojakso.opintojaksot"
                    :is-editing="isEditing"
                  />
                </div>
              </div>
              <div v-else>
                <div
                  v-for="(oppiaineOpintojakso, index) in esitettavaPaikallistenOppiaineidenOpintojaksot"
                  :key="index+'paikallistenOppiaineidenOpintojaksot'"
                >
                  {{ $kaanna(oppiaineetMap[oppiaineOpintojakso.oppiaine.koodi].nimi) }}
                  <ep-opintojakso-select
                    v-model="oppiaineOpintojakso.opintojaksot"
                    :is-editing="isEditing"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="osio">
            <ep-collapse
              tyyppi="opintojakson-tavoitteet"
              :first="true"
            >
              <template #header>
                <div class="alueotsikko">
                  <h3>{{ $t('tavoitteet') }}</h3>
                </div>
              </template>
              <div
                v-for="(moduuli, idx) in data.moduulit"
                :key="idx+'data.moduulit.tavoitteet'"
                class="perustesisalto"
              >
                <div class="moduuliotsikko">
                  <h4>{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</h4>
                </div>
                <ep-prefix-list
                  :model-value="moduulitMap[moduuli.koodiUri].tavoitteet"
                  kohde="kohde"
                  arvot="tavoitteet"
                />
              </div>

              <div
                v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot"
                :key="index+'h'"
              >
                <div
                  v-if="paikallinenOpintojakso.tavoitteet.length > 0"
                  class="perustesisalto"
                >
                  <div class="moduuliotsikko">
                    <h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4>
                  </div>
                  <ep-list
                    v-model="paikallinenOpintojakso.tavoitteet"
                    :is-editable="false"
                    lisays="lisaa-tavoite"
                    kentta="kuvaus"
                  />
                </div>
              </div>

              <div class="moduuliotsikko">
                <h4>{{ $t('paikallinen-lisays-tavoitteet') }}</h4>
              </div>
              <div
                v-if="!isEditing && data.tavoitteet && data.tavoitteet.length === 0"
                class="alert alert-info"
              >
                {{ $t('ei-paikallista-tarkennusta') }}
              </div>
              <ep-list
                v-model="data.tavoitteet"
                :is-editable="isEditing"
                lisays="lisaa-tavoite"
                kentta="kuvaus"
              />
            </ep-collapse>
          </div>

          <div class="osio">
            <ep-collapse tyyppi="opintojakson-keskeiset-sisallot">
              <template #header>
                <div class="alueotsikko">
                  <h3>{{ $t('keskeiset-sisallot') }}</h3>
                </div>
              </template>
              <div
                v-for="(moduuli, idx) in data.moduulit"
                :key="idx+'data.moduulit.keskeiset'"
                class="perustesisalto"
              >
                <div class="moduuliotsikko">
                  <h4>{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</h4>
                </div>
                <ep-prefix-list
                  :model-value="moduulitMap[moduuli.koodiUri].sisallot"
                  kohde="kohde"
                  arvot="sisallot"
                />
              </div>

              <div
                v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot"
                :key="index+'data.paikallisetOpintojaksot'"
              >
                <div
                  v-if="paikallinenOpintojakso.keskeisetSisallot.length > 0"
                  class="perustesisalto"
                >
                  <div class="moduuliotsikko">
                    <h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4>
                  </div>
                  <ep-list
                    v-model="paikallinenOpintojakso.keskeisetSisallot"
                    :is-editable="false"
                    lisays="lisaa-tavoite"
                    kentta="kuvaus"
                  />
                </div>
              </div>

              <div class="moduuliotsikko">
                <h4>{{ $t('paikallinen-lisays-keskeiset-sisallot') }}</h4>
              </div>
              <div
                v-if="!isEditing && data.keskeisetSisallot && data.keskeisetSisallot.length === 0"
                class="alert alert-info"
              >
                {{ $t('ei-paikallista-tarkennusta') }}
              </div>
              <ep-list
                v-model="data.keskeisetSisallot"
                :is-editable="isEditing"
                lisays="lisaa-keskeinen-sisalto"
                kentta="kuvaus"
              />
            </ep-collapse>
          </div>

          <div
            v-if="!isLuva"
            class="osio"
          >
            <ep-collapse tyyppi="opintojakson-laaja-alaiset">
              <template #header>
                <div class="alueotsikko">
                  <h3>{{ $t('laaja-alaiset-sisallot') }}</h3>
                </div>
              </template>

              <div
                v-for="(oppiaine, idx) in opintojaksonOppiaineidenTiedot"
                :key="idx+'opintojaksonOppiaineet'"
                class="perustesisalto"
              >
                <div v-if="oppiaine.laajaAlaisetOsaamiset && oppiaine.laajaAlaisetOsaamiset.kuvaus">
                  <div class="moduuliotsikko">
                    <h4 v-html="$kaanna(oppiaine.nimi)" />
                  </div>
                  <ep-content
                    layout="normal"
                    :model-value="oppiaine.laajaAlaisetOsaamiset.kuvaus"
                    help="ohje-lyhyt-laaja-alainen"
                  />
                </div>
                <!-- Todo: Tee parempi ratkaisu tähän -->
                <div v-else-if="oppiaine.laajaAlainenOsaaminen">
                  <div class="moduuliotsikko">
                    <h4 v-html="$kaanna(oppiaine.nimi)" />
                  </div>
                  <ep-content
                    v-for="(laajalainenosaaminen, index) in oppiaine.laajaAlainenOsaaminen"
                    :key="index+'oppiaine.laajaAlainenOsaaminen'"
                    layout="normal"
                    :model-value="laajalainenosaaminen.kuvaus"
                  />
                </div>
              </div>

              <div class="moduuliotsikko">
                <h4>{{ $t('paikallinen-lisays-opintojakso-laaja-alainen') }}</h4>
              </div>

              <div
                v-for="(lo, index) in data.laajaAlainenOsaaminen"
                :key="index+'laajaAlainenOsaaminen'"
                class="paikallinen-laaja-alainen"
              >
                <div>
                  <span v-if="laajaAlaisetKooditByUri[lo.koodi]">
                    <h5 class="d-inline">{{ $kaanna(laajaAlaisetKooditByUri[lo.koodi].nimi) }}</h5>
                    <b-button
                      v-if="isEditing"
                      variant="link"
                      @click.stop="poistaLaaja(lo)"
                    >
                      <EpMaterialIcon>close</EpMaterialIcon>
                    </b-button>
                  </span>
                </div>
                <ep-content
                  v-model="lo.kuvaus"
                  layout="normal"
                  :is-editable="isEditing"
                />
              </div>

              <div
                v-if="!isEditing && data.laajaAlainenOsaaminen.length === 0"
                class="alert alert-info"
              >
                {{ $t('ei-paikallista-tarkennusta') }}
              </div>
              <b-dropdown
                v-if="isEditing"
                :text="$t('lisaa-laaja-alainen-osaaminen')"
                variant="primary"
                class="mb-4"
              >
                <b-dropdown-item-button
                  v-for="(laaja, index) in laajaAlaistenKoodit"
                  :key="index+'addlaaja'"
                  :disabled="laaja.hasPaikallinenKuvaus"
                  @click="addLaaja(laaja)"
                >
                  {{ $kaanna(laaja.nimi) }}
                </b-dropdown-item-button>
              </b-dropdown>

              <div
                v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot"
                :key="index+'laaja'"
              >
                <div v-if="paikallinenOpintojakso.laajaAlainenOsaaminen && paikallinenOpintojakso.laajaAlainenOsaaminen.length > 0">
                  <div class="moduuliotsikko">
                    <h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4>
                  </div>
                  <div
                    v-for="(lo, index) in paikallinenOpintojakso.laajaAlainenOsaaminen"
                    :key="index+'paik-laaja-osa'"
                    class="paikallinen-laaja-alainen"
                  >
                    <div class="moduuliotsikko">
                      <span v-if="laajaAlaisetKooditByUri[lo.koodi]">
                        <h5>{{ $kaanna(laajaAlaisetKooditByUri[lo.koodi].nimi) }}</h5>
                      </span>
                    </div>
                    <ep-content
                      v-model="lo.kuvaus"
                      layout="normal"
                      :is-editable="false"
                    />
                  </div>
                </div>
              </div>
            </ep-collapse>
          </div>

          <div class="osio">
            <ep-collapse tyyppi="opintojakson-arviointi">
              <template #header>
                <div class="alueotsikko">
                  <h3>{{ $t('opintojakson-arviointi') }}</h3>
                </div>
              </template>

              <div
                v-for="(oppiaine, idx) in opintojaksonOppiaineidenTiedot"
                :key="idx+'op-arviointi'"
                class="perustesisalto"
              >
                <div v-if="oppiaine.arviointi && oppiaine.arviointi.kuvaus">
                  <div class="moduuliotsikko">
                    <h4 v-html="$kaanna(oppiaine.nimi)" />
                  </div>
                  <ep-content
                    layout="normal"
                    :model-value="oppiaine.arviointi.kuvaus"
                  />
                </div>
              </div>
              <div class="moduuliotsikko">
                <h4>{{ $t('paikallinen-lisays-opintojakso-arviointi') }}</h4>
              </div>
              <div
                v-if="!isEditing && !data.arviointi"
                class="alert alert-info"
              >
                {{ $t('ei-paikallista-tarkennusta') }}
              </div>
              <ep-content
                v-model="data.arviointi"
                layout="normal"
                :is-editable="isEditing"
              />

              <div
                v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot"
                :key="index+'paik-arviointi'"
                class="mt-4"
              >
                <div v-if="paikallinenOpintojakso.arviointi">
                  <div class="moduuliotsikko">
                    <h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4>
                  </div>
                  <ep-content
                    v-model="paikallinenOpintojakso.arviointi"
                    layout="normal"
                    :is-editable="false"
                  />
                </div>
              </div>
            </ep-collapse>
          </div>

          <div
            v-if="isLuva"
            class="osio"
          >
            <ep-collapse tyyppi="opiskeluymparisto-ja-tyotavat">
              <template #header>
                <div class="alueotsikko">
                  <h3>{{ $t('opiskeluymparisto-ja-tyotavat') }}</h3>
                </div>
              </template>

              <div
                v-for="(oppiaine, idx) in opintojaksonOppiaineidenTiedot"
                :key="idx+'op-opiskeluymparistoTyotavat'"
                class="perustesisalto"
              >
                <div v-if="oppiaine.opiskeluymparistoTyotavat && oppiaine.opiskeluymparistoTyotavat.kuvaus">
                  <div class="moduuliotsikko">
                    <h4 v-html="$kaanna(oppiaine.nimi)" />
                  </div>
                  <ep-content
                    layout="normal"
                    :model-value="oppiaine.opiskeluymparistoTyotavat.kuvaus"
                  />
                </div>
              </div>
              <div class="moduuliotsikko">
                <h4>{{ $t('paikallinen-lisays-opintojakso-opiskeluymparisto-ja-tyotavat') }}</h4>
              </div>
              <div
                v-if="!isEditing && !data.opiskeluymparistoTyotavat"
                class="alert alert-info"
              >
                {{ $t('ei-paikallista-tarkennusta') }}
              </div>
              <ep-content
                v-model="data.opiskeluymparistoTyotavat"
                layout="normal"
                :is-editable="isEditing"
              />

              <div
                v-for="(paikallinenOpintojakso, index) in data.paikallisetOpintojaksot"
                :key="index+'paik-opiskeluymparistoTyotavat'"
                class="mt-4"
              >
                <div v-if="paikallinenOpintojakso.opiskeluymparistoTyotavat">
                  <div class="moduuliotsikko">
                    <h4>{{ $kaanna(paikallinenOpintojakso.nimi) }}</h4>
                  </div>
                  <ep-content
                    v-model="paikallinenOpintojakso.opiskeluymparistoTyotavat"
                    layout="normal"
                    :is-editable="false"
                  />
                </div>
              </div>
            </ep-collapse>
          </div>

          <div class="osio">
            <ep-collapse
              tyyppi="opintojakson-vapaa-kuvaus"
              :border-bottom="false"
            >
              <template #header>
                <div class="alueotsikko">
                  <h3>{{ $t('opintojakson-vapaa-kuvaus') }}</h3>
                </div>
              </template>
              <div
                v-if="!isEditing && !data.kuvaus"
                class="alert alert-info"
              >
                {{ $t('ei-kuvausta') }}
              </div>
              <ep-content
                v-model="data.kuvaus"
                layout="normal"
                :is-editable="isEditing"
                help="ohje-lyhyt-vapaa-kuvaus"
              />
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
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Koulutustyyppi } from '@shared/tyypit';
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
const store = computed(() => props.opetussuunnitelmaStore);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);
const isLuva = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.koulutustyyppi as string === Koulutustyyppi.lukiovalmistavakoulutus);

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
  get: () => editointiStore.value?.data,
  set: (data) => editointiStore.value?.setData(data),
});

const isLoading = computed(() => {
  return editointiStore.value?.isLoading?.value || false;
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
  return _.chain(store.value.paikallisetOppiaineet.value)
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
  return !_.isEmpty(_.filter(store.value.opintojaksot.value, opintojakso => _.includes(_.map(opintojakso.paikallisetOpintojaksot, 'koodi'), editable.value?.koodi)));
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
        opintojaksot: _.chain(store.value.opintojaksot.value)
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
