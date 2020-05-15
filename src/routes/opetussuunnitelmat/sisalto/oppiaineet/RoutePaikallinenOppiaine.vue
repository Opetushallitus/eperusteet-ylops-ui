<template>
<div id="scroll-anchor" v-if="hooks && !isLoading">
  <ep-editointi :hooks="hooks"
                v-model="editable"
                :validator="validator"
                :versionumero="versionumero"
                type="paikallinen-oppiaine">
    <template slot="header" slot-scope="{ data, }">
      <h2>{{ $kaanna(data.nimi) }}</h2>
    </template>
    <template slot="ohje" slot-scope="{ }">
      <div class="sidepad">
        <p>{{ $t('ohje-paikallinen-oppiaine') }}</p>
      </div>
    </template>
    <template slot="keskustelu" slot-scope="{ }">
      <span>
      </span>
    </template>
    <template v-slot:header="{ data, validation, isEditing }">
      <h2>{{ $kaanna(data.nimi) }}</h2>
    </template>
    <template v-slot="{ data, validation, isEditing }">
      <div class="content">
        <b-row v-if="isEditing">
          <b-col>
            <ep-form-content name="oppiaine-nimi-ohje">
              <ep-field v-model="data.nimi" :is-header="true" :validation="validation.nimi" :is-editing="isEditing">
              </ep-field>
            </ep-form-content>
          </b-col>
           <b-col />
        </b-row>
        <b-row>
          <b-col>
            <ep-form-content name="oppiainekoodi">
              <ep-oppiaine-selector
                v-model="data.perusteenOppiaineUri"
                :opetussuunnitelma-store="opetussuunnitelmaStore"
                :is-editable="isEditing"
                :multiple="false"
                :allow-oppiaine="true"
                :oppiaine-filter="oppiaineFilter" />
            </ep-form-content>
          </b-col>
          <b-col>
            <ep-form-content name="koodi">
              <ep-field help="oppiaine-koodi-ohje" v-model="data.koodi" :validation="validation.koodi" type="string" :is-editing="isEditing" />
            </ep-form-content>
          </b-col>
        </b-row>
        <div>
          <ep-collapse tyyppi="tehtava" :first="true">
            <h3 class="header" slot="header">{{ $t('tehtava') }}</h3>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="data.tehtava.kuvaus" :is-editable="isEditing" layout="normal"> </ep-content>
          </ep-collapse>
          <ep-collapse tyyppi="tavoitteet">
            <h3 class="header" slot="header">{{ $t('tavoitteet') }}</h3>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="data.tavoitteet.kuvaus" :is-editable="isEditing" layout="normal"> </ep-content>
            <div class="tavoitealueet">
              <ep-prefix-list v-model="data.tavoitteet.tavoitealueet" arvot="tavoitteet" arvo="tavoite" :is-editable="isEditing">
              </ep-prefix-list>
            </div>
          </ep-collapse>

          <ep-collapse tyyppi="laajaAlainenOsaaminen">
            <h3 class="header" slot="header">{{ $t('laaja-alaiset-sisallot') }}</h3>
            <laaja-alaiset-osaamiset
              v-model="data.laajaAlainenOsaaminen"
              :koodit="koodit"
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
                       icon="plussa"
                       @click="uusiOpintojakso()">{{ $t('uusi-opintojakso') }}</ep-button>
          </div>
        </div>
      </div>
    </template>
  </ep-editointi>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019PaikallinenOppiaineDto, Opetussuunnitelmat } from '@shared/api/ylops';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { Kielet } from '@shared/stores/kieli';
import { oppiaineValidator } from '@/validators/oppiaineet';
import * as defaults from '@/defaults';
import LaajaAlaisetOsaamiset from '@/routes/opetussuunnitelmat/sisalto/yhteiset/LaajaAlaisetOsaamiset.vue';

import { KoodistoLops2019LaajaAlaiset } from '@/utils/perusteet';
import { success } from '@/utils/notifications';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorIndicator,
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
  private oppiaineQuery = '';
  private editable: Lops2019PaikallinenOppiaineDto = {};
  private laajaAlaisetKoodit: any = null;
  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: this.editAfterLoad,
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

  async remove(data: any) {
    await this.store.removeOppiaine(data.id);
    this.$router.push({
      name: 'opsPoistetut',
      params: {
        tabIndex: '1',
      },
    });
  }

  async editAfterLoad() {
    return this.isUusi();
  }

  isUusi() {
    return this.$route.params.paikallinenOppiaineId === 'uusi';
  }

  async revisions() {
    if (await this.isUusi()) {
      return [];
    }
    else {
      return this.store.getPaikallinenOppiaineenHistoria(_.parseInt(this.$route.params.paikallinenOppiaineId));
    }
  }

  async restore(data, numero) {
    await this.store.revertPaikallinenOppiaineToVersion(_.parseInt(this.$route.params.paikallinenOppiaineId), numero);
    success('palautus-onnistui');
  }

  get koodit() {
    return _.sortBy(this.laajaAlaisetKoodit, 'koodiArvo');
  }

  get opintojaksot() {
    return _.chain(this.store.opintojaksot as any)
      .filter(oj => {
        return !!_(oj.oppiaineet)
          .map('koodi')
          .filter(koodi => koodi === this.editable.koodi)
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
        oppiaineet: this.editable.koodi,
      },
    });
  }

  get validator() {
    return oppiaineValidator([
      Kielet.getSisaltoKieli.value,
    ]);
  }

  oppiaineFilter(oppiaine) {
    return () => true;
  }

  get versionumero() {
    return _.parseInt(_.get(this, '$route.query.versionumero'));
  }

  async load() {
    let paikallinen = defaults.oppiaine();
    if (!await this.isUusi()) {
      const { paikallinenOppiaineId } = this.$route.params;
      const revisions = await this.store.getPaikallinenOppiaineenHistoria(_.parseInt(paikallinenOppiaineId));
      const rev = revisions[revisions.length - this.versionumero];
      if (this.versionumero && rev) {
        paikallinen = await this.store.getPaikallinenOppiaineVersion(_.parseInt(paikallinenOppiaineId), rev.numero as number);
      }
      else {
        paikallinen = await this.store.getPaikallinenOppiaine(_.parseInt(paikallinenOppiaineId));
      }
    }

    const { id } = this.$route.params;
    this.laajaAlaisetKoodit = (await Opetussuunnitelmat.getKoodistonKoodit(_.parseInt(id), KoodistoLops2019LaajaAlaiset)).data;

    paikallinen.tehtava = paikallinen.tehtava || {};
    paikallinen.arviointi = paikallinen.arviointi || {};
    paikallinen.tavoitteet = paikallinen.tavoitteet || {
      tavoitealueet: [],
    };
    return paikallinen;
  }

  async save(oppiaine: Lops2019PaikallinenOppiaineDto) {
    if (await this.editAfterLoad()) {
      const oa = await this.store.addOppiaine(oppiaine);
      return () => {
        this.$router.push({
          name: 'paikallinenOppiaine',
          params: {
            paikallinenOppiaineId: _.toString(oa.id),
          },
        });
      };
    }
    else {
      await this.store.savePaikallinenOppiaine(oppiaine);
    }
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

</style>
