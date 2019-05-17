<template lang="pug">

div.content
  // .progress
    ep-chart(
      labelColor="white",
      :labelSize="32",
      :chartColor="graph.colorScheme",
      :value="graph.value")
  h2.opsnimi {{ $kaanna(nimi) }}
  p.julkaisuohje {{ $t('julkaisuohje') }}

  .vaihe
    h3 {{ $t('validointi') }}
    .kategoriat
      .kategoria(v-for="category in kooste")
        .otsikko(role="button", aria-pressed="false")
          span.iconspan.mr-2
            fas.warning(v-if="category.hasFatal", icon="exclamation")
            fas(
              v-else,
              :class="category.hasWarning ? 'warning' : 'success'",
              icon="check")
          span.saanto(@click="toggleCategory(category)") {{ $t(category.key) }}
          .float-right
            fas(v-if="isOpen[category.key]", icon="chevron-down")
            fas(v-else, icon="chevron-up")
        div(v-if="isOpen[category.key]")
          .validointi(v-for="validation in category.value")
            span {{ $t(validation.kuvaus) }} ({{ $kaanna(validation.nimi) }})
        div(v-else)

  // .vaihe
    h3 {{ $t('tiedot') }}
    div
      .row
        .col-md-6
          ep-form-content(name="ops-nimi")
            ep-field(
              help="ops-nimi-ohje",
              v-model="ops.nimi")
        .col-md-6
          ep-form-content(name="peruste")
            ep-field(v-model="ops.perusteenDiaarinumero")
        .col-md-6
          ep-form-content(name="julkaisukielet")
            ep-select(
              help="ops-julkaisukielet-ohje",
              v-model="ops.julkaisukielet",
              :items="kielet",
              :multiple="true")
        .col-md-6(v-if="isOps")
          ep-form-content(name="ops-hyvaksyjataho")
            ep-field(
              help="ops-hyvaksyjataho-ohje",
              v-model="ops.hyvaksyjataho",
              type="string")
        .col-md-6(v-if="isOps")
          ep-form-content(name="ops-hyvaksymispvm")
            ep-datepicker(
              v-model="ops.paatospaivamaara",
              help="ops-hyvaksymispvm-ohje")
        .col-md-12
          ep-form-content(name="ops-kuvaus")
            ep-content(
              v-model="ops.kuvaus",
              help="ops-kuvaus-ohje")

  .vaihe
    h3 {{ $t('uusi-julkaisu') }}
    div(v-if="isValid")
      ep-content(
        v-model="uusiJulkaisu.tiedote",
        help="uuden-julkaisun-tiedote",
        :is-editable="true")
      button.btn.btn-primary() {{ $t('julkaise') }}
    .alert.alert-warning(v-else) {{ $t('opetussuunnitelman-tarkistukset-julkaisu') }}

  .vaihe
    h3 {{ $t('julkaisuhistoria') }}
    .alert.alert-info(v-if="julkaisuhistoria.length === 0") {{ $t('opetussuunnitelmaa-ei-viela-julkaistu') }}

</template>

<script lang="ts">

import { EpButton, EpContent, EpDatepicker, EpEditointi, EpField, EpFormContent, EpSelect, EpToggle } from '@/components';

import EpOpsRoute from '@/mixins/EpOpsRoute';

import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import _ from 'lodash';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { Component } from 'vue-property-decorator';
import { opsTiedotValidator } from '@/validators/ops';
import { EpChart } from '@/components';
import { Kielet } from '@/stores/kieli';
import { Lops2019ValidointiDto } from '@/tyypit';

@Component({
  components: {
    EpButton,
    EpChart,
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpField,
    EpFormContent,
    EpSelect,
    EpToggle,
    Tilanvaihto,
  },
})
export default class RouteTiedot extends EpOpsRoute {
  private hooks: EditointiKontrolliConfig | null = null;
  private validointi: Lops2019ValidointiDto | null = null;
  private isOpen: { [key: string]: boolean } = {};
  private showKooste = false;
  private julkaisut: any[] = [];
  private uusiJulkaisu: any = {};

  get graph() {
    return {
      colorScheme: 'vihrea_sininen',
      value: 80,
    };
  }

  get nimi() {
    return this.ops.nimi;
  }

  get julkaisuhistoria() {
    return [];
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

  toggleCategory(category) {
    this.$set(this.isOpen, category.key, !this.isOpen[category.key]);
  }

  async init() {
    this.validointi = await Opetussuunnitelma.validate();
    this.julkaisut = await Opetussuunnitelma.getJulkaisut();
  }
}
</script>

<style scoped lang="scss">

.content {
  padding: 50px;

  .vaihe {
    margin-top: 60px;
    border-top: 1px solid #ccc;
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
