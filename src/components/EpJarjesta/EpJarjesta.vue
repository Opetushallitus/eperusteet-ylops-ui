<template>
<draggable v-bind="options" tag="div" class="tree-container" :value="value" @input="emitter" :key="value.length">
  <div v-for="(node, idx) in value" :key="idx">
    <div class="box" :class="node.$uusi && 'new-box'">
      <span class="chapter">
        {{ prefix }}{{ idx + 1 }}
      </span>
      <span class="name">
        <slot :node="node"></slot>
      </span>
      <div
        v-if="node[childField] && node[childField].length > 0"
        class="actions"
        role="button"
        tabindex="0"
        @click="toggle(idx)"
        @keyup.enter="toggle(idx)"
        :aria-expanded="!node.$closed">
        <fas v-if="node.$closed" icon="chevron-down"></fas>
        <fas v-else icon="chevron-up"></fas>
      </div>
    </div>
    <div class="children" v-if="!node.$closed">
      <ep-jarjesta
          v-model="node[childField]"
          :is-editable="isEditable"
          :prefix="prefix + (idx + 1) + '.'"
          :child-field="childField"
          :group="group">
        <slot v-for="(_, name) in $slots" :name="name" :slot="name"></slot>
        <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="data">
          <slot :name="name" v-bind="data" />
        </template>
      </ep-jarjesta>
    </div>
  </div>
</draggable>
</template>

<script lang="ts">

import { Vue, Mixins, Prop, Component } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import draggable from 'vuedraggable';
import { RecursiveTreeItem } from '@/tyypit';
import _ from 'lodash';

@Component({
  components: {
    draggable,
  },
})
export default class EpJarjesta extends Vue {
  @Prop({
    required: false,
    type: String,
    default: '',
  })
  private prefix!: string;

  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  private isEditable!: boolean;

  @Prop({
    required: false,
    type: Array,
    default: null,
  })
  private value!: any[];

  @Prop({
    required: false,
    default: 'lista',
  })
  private childField!: string;

  @Prop({ default: null })
  private group!: string | null;

  get options() {
    return {
      animation: 300,
      group: this.group,
      disabled: !this.isEditable,
      ghostClass: 'placeholder',
    };
  }

  toggle(idx) {
    Vue.set(this.value[idx], '$closed', !this.value[idx].$closed);
    this.emitter(this.value);
  }

  emitter(value) {
    this.$emit('input', value);
  }

}
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.flip-move {
  transition: transform 0.5s;
}

.placeholder {
  opacity: 0.5;
}

.drag-area-empty {
  min-height: 7px;
}

.children {
  margin-left: 26px;
}

.box {
  min-height: 40px;
  max-width: 512px;
  min-width: 312px;
  border: 1px solid #CCD9F8;
  border-radius: 4px;
  background-color: rgba(230,246,255,0.6);
  padding: 7px 20px 7px 20px;
  margin-bottom: 10px;
  cursor: grab;

  .actions {
    float: right;
    cursor: pointer;
  }

  .chapter {
    color: #668DEA;
    font-size: 16px;
    margin-right: 8px;
  }

  &.new-box {
    background-color: rgba(210,226,255,1.0);
    border: 1px solid #ACB9F8;
  }
}




</style>
