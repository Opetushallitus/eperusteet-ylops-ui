<template>
<div class="tekstiviite" v-if="hooks">
  <div class="kappale">
    <ep-editointi :hooks="hooks">
      <template slot="ohje" slot-scope="{ isEditing, data }">
        <div class="sidepad">
          <p>{{ $t('ohje-tekstikapale') }}</p>
          <p>{{ $t('ohje-tekstikapale-perusteteksti') }}</p>
          <div class="ohjeet" v-if="data.ohjeet.length > 0">
            <div class="ohje" v-for="ohje in data.ohjeet" :key="ohje.id">
              <ep-content v-model="ohje.teksti" :is-editable="allowOhjeEdit && isEditing">
              </ep-content>
            </div>
          </div>
        </div>
      </template>
      <template slot="keskustelu" slot-scope="{ }">
        <span>
        </span>
      </template>
      <template slot="peruste" slot-scope="{ }">
        <div class="sidepad">
          <p v-if="perusteenTeksti && perusteenTeksti.perusteenOsa" v-html="$kaanna(perusteenTeksti.perusteenOsa.teksti)" />
        </div>
      </template>
      <template slot="header" slot-scope="{ isEditing, data }">
        <div class="otsikko">
          <ep-field v-if="data.tov.tekstiKappale" help="tekstikappale-nimi-ohje" v-model="data.tov.tekstiKappale.nimi" :is-header="true" :is-editing="isEditing">
          </ep-field>
        </div>
      </template>
      <template slot-scope="{ isEditing, data }">
        <div class="teksti">
          <span comment-uuid="data.tov.tekstiKappale.tunniste">
            <div class="spacing">
            </div>
            <ep-collapse tyyppi="perusteteksti" v-if="(isEditing || data.tov.naytaPerusteenTeksti) && perusteenTeksti && perusteenTeksti.perusteenOsa">
              <h5 slot="header">{{ $t('perusteen-teksti') }}</h5>
              <p class="perusteteksti" v-html="$kaanna(perusteenTeksti.perusteenOsa.teksti)">
              </p>
              <div class="alert alert-info" v-if="!isEditing && !$kaanna(perusteenTeksti.perusteenOsa.teksti)">{{ $t('perusteen-sisaltoa-ei-maaritetty') }}</div>
              <div v-if="isEditing">
                <b-form-checkbox v-model="data.tov.naytaPerusteenTeksti">{{ $t('nayta-perusteen-teksti') }}</b-form-checkbox>
              </div>
            </ep-collapse>
            <div class="spacing">
            </div>
            <ep-collapse>
              <template #header>
                <h5>{{ $t('paikallinen-teksti') }}</h5>
              </template>
              <ep-content layout="normal" v-model="data.tov.tekstiKappale.teksti" :is-editable="isEditing">
              </ep-content>
              <div class="alert alert-info" v-if="!isEditing && !$kaanna(data.tov.tekstiKappale.teksti)">{{ $t('paikallista-sisaltoa-ei-maaritetty') }}</div>
            </ep-collapse>
          </span>
        </div>
      </template>
    </ep-editointi>
  </div>
</div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoute';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

import EpRoot from '@/mixins/EpRoot';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import {
  EpButton,
  EpCollapse,
  EpContent,
  EpEditointi,
  EpField,
  EpFormContent,
  EpInput,
} from '@/components';

import {
  Lops2019Perusteet,
  Ohjeet,
  OpetussuunnitelmanSisalto,
} from '@/api';

import {
  Puu,
  OhjeDto,
  PerusteTekstiKappaleViiteDto,
} from '@/tyypit';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpFormContent,
    EpField,
    EpInput,
  },
})
export default class RouteTekstikappale extends Mixins(EpRoute) {
  private ohjeet: OhjeDto[] = [];
  private perusteenTeksti: PerusteTekstiKappaleViiteDto | null = null;
  private nimi: any = {};
  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: async () => this.isUusi(),
    source: {
      load: this.load,
      save: this.save,
    },
    remove: this.remove,
  };

  async remove(data: any) {
    await Opetussuunnitelma.removeTeksti(data.tov);
    this.$router.push({
      name: 'opsTiedot',
      // params: {
      //   ...this.$route.params,
      // },
    });
  }

  get isPohja() {
    return Opetussuunnitelma.opetussuunnitelma!.tyyppi as string === 'pohja';
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

  async isUusi() {
    return this.$route.params.osaId === 'uusi';
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
      const ohjeet = await Ohjeet.getTekstiKappaleOhje(teksti.tekstiKappale!.tunniste as string);
      const result = {
        tov: _.omit(_.cloneDeep(teksti), 'lapset'),
        ohjeet: ohjeet.data || [],
      } as any;

      if (_.isEmpty(result.ohjeet)) {
        result.ohjeet.push({});
      }

      if (teksti.perusteTekstikappaleId) {
        this.perusteenTeksti = (await Lops2019Perusteet.getAllLops2019PerusteTekstikappale(this.opsId, teksti.perusteTekstikappaleId)).data as PerusteTekstiKappaleViiteDto;
      }
      this.breadcrumb('tekstikappale', teksti.tekstiKappale!.nimi);
      return result;
    }
  }

  private async save({ tov, ohjeet }) {
    if (await this.isUusi()) {
      await Opetussuunnitelma.addTeksti(tov, _.parseInt(this.$route.params.parentId));
    }
    else {
      await Opetussuunnitelma.saveTeksti(tov);
      await Promise.all(_.map(ohjeet, (ohje) => Opetussuunnitelma.saveOhje({
        ...ohje,
        kohde: tov.tekstiKappale.tunniste,
      })));
    }
  }

  private async addAlikappale(parent: Puu) {
    const uusi = await Opetussuunnitelma.addTeksti({}, parent.id);
    this.$router.push({
      name: 'tekstikappale',
      params: {
        ...this.$route.params,
        osaId: '' + uusi.id,
      },
    });
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.badges {
  .badge {
    margin: 4px;
  }
}

.tekstiviite {
  .kappale {
    .otsikko {
      margin-bottom: 0;
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

    .spacing {
      margin-bottom: 20px;
    }

    .perusteteksti {
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

}
</style>
