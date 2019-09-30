<template lang="pug">

div.content
  h2.opsnimi {{ $kaanna(nimi) }}
  div(v-html="$t('julkaisuohje')")

  .vaihe
    h3 {{ $t('validointi') }}
    .kategoriat
      .kategoria(v-for="category in kooste")
        ep-collapse(:expanded-by-default="false")
          h4(slot="header")
            span.iconspan.mr-2
              fas.warning(v-if="category.hasFatal", icon="exclamation", fixed-width)
              fas(
                v-else,
                :class="category.hasWarning ? 'warning' : 'success'",
                icon="check",
                fixed-width)
            span.saanto {{ $t(category.key) }}
          .validointi(v-for="validation in category.value")
            span {{ $t(validation.kuvaus) }} ({{ $kaanna(validation.nimi) }})

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
              opetussuunnitelma-store="opetussuunnitelmaStore",
              v-model="ops.kuvaus",
              help="ops-kuvaus-ohje")

  .vaihe
    ep-collapse(tyyppi="uusi-julkaisu")
      h3(slot="header")  {{ $t('uusi-julkaisu') }}
      div(v-if="true || isValid")
        ep-content(
          opetussuunnitelma-store="opetussuunnitelmaStore",
          v-model="uusiJulkaisu.julkaisutiedote",
          help="uuden-julkaisun-tiedote",
          layout="simplified",
          :is-editable="true")
        button.btn.btn-primary(@click="julkaise()") {{ $t('julkaise') }}
      .alert.alert-warning(v-else) {{ $t('opetussuunnitelman-tarkistukset-julkaisu') }}

  .vaihe
    ep-collapse(tyyppi="julkaisuhistoria")
      h3(slot="header") {{ $t('julkaisuhistoria') }}
      .alert.alert-info(v-if="julkaisuhistoria.length === 0") {{ $t('opetussuunnitelmaa-ei-viela-julkaistu') }}
      div(v-else)
        table.table.table-striped
          thead
            tr
              th {{ $t('versio') }}
              th {{ $t('luontihetki') }}
              th {{ $t('tiedote') }}
          tbody
            tr(v-for="julkaisu in julkaisuhistoria")
              td {{ julkaisu.revision }}
              td {{ $ago(julkaisu.luotu) }}
              td(v-html="$kaanna(julkaisu.tiedote)")


</template>

<script lang="ts">

import { EpCollapse, EpButton, EpContent, EpDatepicker, EpEditointi, EpField, EpFormContent, EpSelect, EpToggle } from '@/components';

import EpOpsRoute from '@/mixins/EpOpsRoute';

import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import _ from 'lodash';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Component } from 'vue-property-decorator';
import { opsTiedotValidator } from '@/validators/ops';

import { Kielet } from '@/stores/kieli';
import { Lops2019ValidointiDto, UusiJulkaisuDto } from '@/tyypit';


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
  private uusiJulkaisu: UusiJulkaisuDto = {};

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
    this.julkaisut = await this.store.getJulkaisut();
  }

  async julkaise() {
    const julkaisu = await this.store.julkaise(this.uusiJulkaisu);
    this.julkaisut.unshift(julkaisu);
  }

}
</script>

<style scoped lang="scss">

.content {
  padding: 15px 50px 50px 50px;

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
