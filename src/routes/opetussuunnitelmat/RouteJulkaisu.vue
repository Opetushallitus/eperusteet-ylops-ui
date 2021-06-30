<template>
<div class="content">
  <div v-html="$t('julkaisuohje')">
  </div>
  <ep-spinner v-if="!validointi" />
  <div v-else>
    <div class="vaihe" v-if="kooste && kooste.length > 0">
      <h3>{{ $t('validointi') }}</h3>
      <div class="kategoriat">
        <div class="kategoria" v-for="(category, idx) in kooste" :key="idx">
          <ep-collapse :expanded-by-default="false">
            <h4 slot="header">
              <span class="iconspan mr-2">
                <fas class="warning" v-if="category.hasFatal" icon="huutomerkki-ympyra" fixed-width>
                </fas>
                <fas v-else :class="category.hasWarning ? 'warning' : 'success'" icon="checkmark-ympyra" fixed-width>
                </fas>
              </span>
              <span class="saanto">{{ $t(category.key) }}</span>
            </h4>
            <div class="validointi" v-for="(validation, vidx) in category.value" :key="vidx + (idx + 1) * 1000">
              <router-link v-if="validation.meta" :to="{name: validation.meta.route.type, params: validation.meta.route.meta}">
                <span>{{ $t(validation.kuvaus) }} ({{ $kaanna(validation.nimi) }})</span>
              </router-link>
              <span v-else>{{ $t(validation.kuvaus) }} ({{ $kaanna(validation.nimi) }})</span>
            </div>
          </ep-collapse>
        </div>
      </div>
    </div>
    <div class="vaihe" v-if="isValid">
      <h3>{{ $t('tiedot') }}</h3>
      <div>
        <div class="row">
          <div class="col-md-6">
            <ep-form-content name="ops-nimi">
              <ep-field help="ops-nimi-ohje" v-model="ops.nimi">
              </ep-field>
            </ep-form-content>
          </div>
          <div class="col-md-6">
            <ep-form-content name="peruste">
              <ep-field v-model="ops.perusteenDiaarinumero">
              </ep-field>
            </ep-form-content>
          </div>
          <div class="col-md-6">
            <ep-form-content name="julkaisukielet">
              <ep-select help="ops-julkaisukielet-ohje" v-model="ops.julkaisukielet" :items="kielet" :multiple="true">
              </ep-select>
            </ep-form-content>
          </div>
          <div class="col-md-6" v-if="isOps">
            <ep-form-content name="ops-hyvaksyjataho">
              <ep-field help="ops-hyvaksyjataho-ohje" v-model="ops.hyvaksyjataho" type="string">
              </ep-field>
            </ep-form-content>
          </div>
          <div class="col-md-6" v-if="isOps">
            <ep-form-content name="ops-hyvaksymispvm">
              <ep-datepicker v-model="ops.paatospaivamaara" help="ops-hyvaksymispvm-ohje">
              </ep-datepicker>
            </ep-form-content>
          </div>
          <div class="col-md-6" v-if="isOps && julkaisuhistoria && julkaisuhistoria.length > 0">
            <ep-form-content name="esikatsele-opetussuunnitelmaa">
              <ep-external-link :url="esikatseluUrl"></ep-external-link>
            </ep-form-content>
          </div>
          <div class="col-md-12">
            <ep-form-content name="ops-kuvaus">
              <ep-content opetussuunnitelma-store="opetussuunnitelmaStore"
                          layout="simplified"
                          v-model="ops.kuvaus"
                          help="ops-kuvaus-ohje">
              </ep-content>
            </ep-form-content>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isValid">
      <h3>{{ $t('uusi-julkaisu') }}</h3>
      <b-form-group :label="$t('julkaisun-tiedote')">
        <div class="font-size-08 mb-2">{{$t('tiedote-naytetaan-tyoryhmalle-taman-sivun-julkaisuhistoriassa')}}</div>
        <ep-content v-model="uusiJulkaisu.julkaisutiedote"
                    layout="simplified"
                    :is-editable="true" />
        <EpJulkaisuButton class="mt-3" :julkaise="julkaise" v-oikeustarkastelu="'hallinta'"/>
      </b-form-group>
    </div>

    <EpJulkaisuHistoria :julkaisut="julkaisuhistoria" :palauta="palautaJulkaisu">
      <div slot="empty">{{ $t('opetussuunnitelmaa-ei-viela-julkaistu') }}</div>
    </EpJulkaisuHistoria>

  </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component } from 'vue-property-decorator';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019ValidointiDto, UusiJulkaisuDto } from '@shared/api/ylops';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpJulkaisuHistoria from '@shared/components/EpJulkaisuHistoria/EpJulkaisuHistoria.vue';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpField,
    EpFormContent,
    EpSelect,
    Tilanvaihto,
    EpSpinner,
    EpJulkaisuHistoria,
    EpExternalLink,
    EpJulkaisuButton,
  },
})
export default class RouteJulkaisu extends EpOpsRoute {
  private hooks: EditointiKontrolliConfig | null = null;
  private validointi: Lops2019ValidointiDto | null = null;
  private isOpen: { [key: string]: boolean } = {};
  private showKooste = false;
  private uusiJulkaisu: UusiJulkaisuDto = {
    julkaisutiedote: {},
  };

  get graph() {
    return {
      colorScheme: 'vihrea_sininen',
      value: 80,
    };
  }

  get nimi() {
    return this.ops.nimi;
  }

  get kielet() {
    return UiKielet;
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get julkaisuhistoria() {
    return _.reverse(_.sortBy(this.julkaisut, 'revision'));
  }

  get isValid() {
    return _.every(this.kooste, v => !v.hasFatal);
  }

  get kooste() {
    if (this.validointi) {
      return _(this.validointi.validoinnit)
        .map((value, key) => ({
          key,
          hasFatal: _.some(value, v => v.fatal && v.failed),
          hasWarning: _.some(value, v => v.failed),
          value: _.filter(value, v => v.failed),
        }))
        .value();
    }
    else {
      return [];
    }
  }

  avaaKooste() {
    this.showKooste = true;
  }

  async init() {
    this.validointi = await this.store.validate();
  }

  get julkaisut() {
    return this.store.julkaisut;
  }

  async julkaise() {
    try {
      const julkaisu = await this.store.julkaise(this.uusiJulkaisu);
      this.uusiJulkaisu.julkaisutiedote = {};
      this.$success(this.$t('julkaistu') as string);
    }
    catch (err) {
      this.$fail(this.$t('julkaisu-epaonnistui-' + err.response?.data?.syy) as string);
    }
  }

  get esikatseluUrl() {
    return buildEsikatseluUrl(this.kieli, `/opetussuunnitelma/${this.ops.id}/${koulutustyyppiTheme(this.ops.koulutustyyppi!)}/tiedot`);
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  async palautaJulkaisu(julkaisu) {
    try {
      await this.store.palautaJulkaisu(julkaisu);
      this.$success(this.$t('opetussuunnitelman-julkaisuversio-palautettu-julkiseksi') as string);
    }
    catch (err) {
      this.$fail(this.$t('palautus-epaonnistui') as string);
    }
  }
}
</script>

<style scoped lang="scss">

.content {
  padding: 15px 50px 50px 50px;

  .vaihe {
    margin-top: 60px;
    padding-top: 20px;
  }

  .actions {
    margin-top: 40px;
  }

  .opsnimi {
    text-align: center;
  }

  .progress {
    height: 140px;
    width: 140px;
    margin: 0 auto;
    background: white;
  }

  p.julkaisuohje {
    margin: 40px;
    text-align: center;
  }

  span.iconspan {
    min-width: 20px;
    display: inline-block;
    text-align: center;

    .failed {
      color: #ff6b27;
    }

    .warning {
      color: #ff6b27;
    }

    .success {
      color: #449013;
    }
  }

  .kategoriat {
    margin-top: 40px;

    .kategoria {
      margin-top: 20px;
      font-size: 120%;

      .otsikko {
        user-select: none;
        .saanto {
          cursor: pointer;
        }
      }

      .validointi {
        font-size: 80%;
        padding: 6px;
        padding-left: 32px;
      }
    }
  }
}

</style>
