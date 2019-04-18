<template lang="pug">

div(v-if="isEditable")
  .alue(v-for="(alue, alueIdx) in internal")
    .alue-editing
      .header
        .row
          .col-sm-6
            ep-input(
              v-model="alue.nimi",
              :help="arvot + '-nimi'",
              :placeholder="$t(arvot + '-nimi')",
              :is-editing="true")
          .col-sm-6
            .actions
              ep-button(
                variant="danger",
                v-if="true",
                icon="times",
                @click="poistaIndeksi(internal, alueIdx)")
                | {{ $t('poista-alue-' + arvot) }}

      .kohde
        ep-input(
          v-model="alue[kohde]",
          :help="kohde",
          :is-editing="true")
      .arvot
        draggable(
          v-bind="options",
          class="arvot-group",
          :list="alue[arvot]")
          .arvo.arvot-group-item(v-for="(item, idx) in alue[arvot]", :key="idx")
            // fas.handle(icon="sort")
            .text
              ep-input(
                v-model="item[arvo]",
                :is-editing="true")
            .actions
              ep-button(
                variant="danger",
                v-if="true",
                icon="times",
                @click="poistaIndeksi(alue[arvot], idx)") {{ $t('poista') }}

        ep-button(
          v-if="true",
          icon="plus",
          @click="lisaaArvo(alue)") {{ $t('lisaa-arvo-' + arvo) }}

  ep-button(
    v-if="hasMultiple",
    icon="plus",
    @click="lisaaAlue()") {{ $t('lisaa-alue-' + arvot) }}

div(v-else)
  .alue(v-for="(alue, alueIdx) in internal")
    .header
      ep-input(
        v-model="alue.nimi",
        :is-editing="isEditable")
    .kohde
      ep-input(
        v-model="alue[kohde]",
        :is-editing="isEditable")
    ul.arvot
      li.arvo(v-for="item in alue[arvot]")
        ep-input(
          v-model="arvo ? item[arvo] : item",
          :is-editing="false")

      // .float-right
        ep-button(
          variant="danger",
          v-if="false",
          icon="times",
          @click="poistaArvo(alueIdx)")


</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { EpButton, EpContent, EpInput } from '@/components';
import _ from 'lodash';
import draggable from 'vuedraggable';

@Component({
  components: {
    draggable,
    EpButton,
    EpContent,
    EpInput,
  },
})
export default class EpPrefixList extends Vue {
  @Prop({ default: false })
  private isEditable!: boolean;

  @Prop({ required: true })
  private value!: any;

  @Prop({ default: 'kohde' })
  private kohde!: string;

  @Prop({ default: 'arvot' })
  private arvot!: string;

  @Prop({ default: '' })
  private arvo!: string;

  get hasMultiple() {
    return _.isArray(this.sanitized);
  }
  
  get sanitized() {
    if (_.isArray(this.value)) {
      return this.value;
    }
    else {
      return [this.value];
    }
  }

  get internal() {
    return this.sanitized;
  }

  set internal(value: any) {
    this.$emit('input', value);
  }

  get options() {
    return {
      // handle: '.handle',
      animation: 300,
      disabled: false,
    };
  }

  private poistaIndeksi(arr: any[], alueIdx: number) {
    arr.splice(alueIdx, 1);
  }

  private lisaaAlue() {
    this.internal.push({
      nimi: {},
      [this.kohde]: {},
      [this.arvot]: [],
    });
  }

  private lisaaArvo(alue: any) {
    alue[this.arvot].push(this.arvot
      ? { [this.arvo]: {}, }
      : {});
  }

}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';


.alue-editing {
  background: $color-light-background;
  padding: 20px;
}

.alue {
  margin-bottom: 40px;

  .header {
    font-weight: 600 !important;

    .actions {
      float: right;
    }
  }

  .kohde {
    font-style: italic;
  }

  ul.arvot {
    li.arvo {
      margin: 0;
    }
  }

  div.arvot {
    margin: 20px 0 0 40px;

    div.arvo {
      margin-bottom: 5px;
      display: flex;

      .text {
        width: calc(100% - 120px);
      }

      .actions {
        width: 119px;

        button {
          border-top-left-radius: 0px;
          border-bottom-left-radius: 0px;
        }
      }
    }

  }
}
</style>
