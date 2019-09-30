<template>
<div v-if="hooks && !isLoading">
  <ep-editointi :hooks="hooks" v-model="editable" :validator="validator">
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
      <ep-field help="oppiaine-nimi-ohje" v-model="data.nimi" :is-header="true" :validation="validation.nimi" :is-editing="isEditing">
      </ep-field>
    </template>
    <template v-slot="{ data, validation, isEditing }">
      <div class="content">
        <b-row>
          <b-col>
            <ep-form-content name="oppiainekoodi">
              <ep-oppiaine-selector
                :opetussuunnitelma-store="opetussuunnitelmaStore"
                :is-editable="isEditing"
                :allowed="allowed"
                :multiple="false"
                v-model="data.perusteenOppiaineUri"
                :ops-id="$route.params.id" />
            </ep-form-content>
          </b-col>
          <b-col>
            <ep-form-content name="koodi">
              <ep-field help="oppiaine-koodi-ohje" v-model="data.koodi" :validation="validation.koodi" type="string" :is-editing="isEditing" />
            </ep-form-content>
          </b-col>
        </b-row>
        <div>
          <hr class="valiviiva" />
          <ep-collapse tyyppi="tehtava">
            <h4 class="header" slot="header">{{ $t('tehtava') }}</h4>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="data.tehtava.kuvaus" :is-editable="isEditing" layout="normal"> </ep-content>
          </ep-collapse>
          <hr class="valiviiva" />
          <ep-collapse tyyppi="tavoitteet">
            <h4 class="header" slot="header">{{ $t('tavoitteet') }}</h4>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="data.tavoitteet.kuvaus" :is-editable="isEditing" layout="normal"> </ep-content>
            <div class="tavoitealueet">
              <ep-prefix-list v-model="data.tavoitteet.tavoitealueet" arvot="tavoitteet" arvo="tavoite" :is-editable="isEditing">
              </ep-prefix-list>
            </div>
          </ep-collapse>
          <hr class="valiviiva" />
          <ep-collapse tyyppi="laajaAlainenOsaaminen">
            <h4 class="header" slot="header">{{ $t('laaja-alaiset-sisallot') }}</h4>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="data.laajaAlainenOsaaminen" :is-editable="isEditing" layout="normal"> </ep-content>
          </ep-collapse>
          <div v-if="!isEditing">
            <hr class="valiviiva" />
            <ep-collapse tyyppi="opintojaksot">
              <h4 class="header" slot="header">{{ $t('opintojaksot') }}</h4>
              <div class="block-container" v-for="opintojakso in opintojaksot" :key="opintojakso.id">
                <div class="oj-content pakollinen">
                  <span class="nimi">
                    <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: opintojakso.id } }">
                      {{ $kaanna(opintojakso.nimi) }}
                    </router-link>
                  </span>
                  <span class="pituus">{{ opintojakso.laajuus }} {{ $t('opintopiste') }}</span>
                </div>
              </div>
            </ep-collapse>
          </div>
        </div>
      </div>
    </template>
  </ep-editointi>
</div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import {
  EpButton,
  EpCollapse,
  EpColorBall,
  EpContent,
  EpEditointi,
  EpField,
  EpFormContent,
  EpMultiSelect,
  EpOppiaineSelector,
  EpPrefixList,
  EpSpinner,
} from '@/components';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019PaikallinenOppiaineDto } from '@/tyypit';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { oppiaineValidator } from '@/validators/oppiaineet';
import Multiselect from 'vue-multiselect';
import * as defaults from '@/defaults';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpOppiaineSelector,
    EpPrefixList,
    EpSpinner,
  },
})
export default class RouteOpintojakso extends Mixins(EpRoute, EpOpsComponent) {
  private oppiaineQuery = '';
  private editable: any = null;
  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: this.isUusi,
    remove: this.remove,
    source: {
      save: this.save,
      load: this.load,
    },
  };

  async remove(data: any) {
    await this.store.removeOppiaine(data.id);
    this.$router.push({
      name: 'opsPoistetut',
    });
  }

  async isUusi() {
    return this.$route.params.paikallinenOppiaineId === 'uusi';
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

  get validator() {
    return oppiaineValidator([
      Kielet.getSisaltoKieli(),
    ]);
  }

  get allowed() {
    return [
      'oppiaineetjaoppimaaratlops2021_vk1',
      'oppiaineetjaoppimaaratlops2021_vk2',
      'oppiaineetjaoppimaaratlops2021_vk3',
      'oppiaineetjaoppimaaratlops2021_vk4',
      'oppiaineetjaoppimaaratlops2021_vk5',
      'oppiaineetjaoppimaaratlops2021_vk6',
      'oppiaineetjaoppimaaratlops2021_vk7',
      'oppiaineetjaoppimaaratlops2021_vk8',
      'oppiaineetjaoppimaaratlops2021_vk9',
      'oppiaineetjaoppimaaratlops2021_vk10',
      'oppiaineetjaoppimaaratlops2021_ux',
    ];
  }

  public async load() {
    let paikallinen = defaults.oppiaine();
    if (!await this.isUusi()) {
      const { paikallinenOppiaineId } = this.$route.params;
      paikallinen = await this.store.getPaikallinenOppiaine(_.parseInt(paikallinenOppiaineId));
    }

    paikallinen.tehtava = paikallinen.tehtava || {};
    paikallinen.arviointi = paikallinen.arviointi || {};
    paikallinen.tavoitteet = paikallinen.tavoitteet || {
      tavoitealueet: [],
    };
    return paikallinen;
  }

  async save(oppiaine: Lops2019PaikallinenOppiaineDto) {
    if (await this.isUusi()) {
      await this.store.addOppiaine(oppiaine);
    }
    else {
      await this.store.savePaikallinenOppiaine(oppiaine);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

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
  border-radius: 30px;
  padding: 10px 20px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #e4f3cf;

  &.pakollinen {
    background-color: #eaf5fe;
  }

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
