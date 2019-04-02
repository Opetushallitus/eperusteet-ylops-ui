<template lang="pug">
div(v-if="value")
  .tree
    draggable.drag-area(
      :class="(!value[childField] || value[childField].length === 0) && 'drag-area-empty'",
      :value="value[childField]",
      v-bind="options",
      @input="update",
      handle=".handle",
      @start="drag = true",
      @stop="drag = false")
      .level(
        v-if="value[childField]",
        v-for="sub in value[childField]",
        :key="sub.id")
        .item
          .box
            span.icon.mr-2
              fas.handle(icon="sort")
            slot(name="default", :item="sub")
            span.ml-2
              | {{ value.id }} <- {{ sub.id }}
          .subitems
            route-jarjestys(
              :value="sub",
              :group="group",
              :child-field="childField",
              @input="changed($event)")
              template(
                slot="default",
                slot-scope="scope")
                slot(name="default", v-bind="scope")

</template>

<script lang="ts">
import { Mixins, Prop, Component } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import draggable from 'vuedraggable';
import { RecursiveTreeItem } from '@/tyypit';
import _ from 'lodash';

@Component({
  name: 'route-jarjestys',
  components: {
    draggable,
  },
})
export default class RouteJarjestys extends Mixins(EpRoute) {
  @Prop({ required: true })
  private value!: RecursiveTreeItem;

  @Prop({ required: true })
  private childField!: string;

  @Prop({ default: null })
  private group!: string | null;

  private drag = false;

  changed(data: any, wat: any) {
    const idx = _.findIndex(this.value[this.childField], { id: data.id });
    if (idx > -1) {
      const lapset = [...this.value[this.childField]];
      lapset[idx] = data;
      this.$emit('input', {
        ...this.value,
        lapset,
      });
    }
  }

  update(data: any) {
    this.$emit('input', {
      ...this.value,
      [this.childField]: data,
    });
  }

  get options() {
    return {
      animation: 300,
      group: this.group,
      disabled: false,
      ghostClass: 'placeholder',
    };
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

.tree {
  .level {
    &:first-child {
      margin-top: 7px;
    }

    .item {
      .box {
        background: $blue-lighten-4;
        margin: 0px 7px 0px 7px;
        padding: 10px;
        border: 1px dashed $blue-lighten-3;

        .icon {
          color: $blue-lighten-3;
          cursor: pointer;
        }

        .text {
          color: $blue-lighten-1;
        }
      }

      .subitems {
        margin-left: 40px;
      }

    }
  }
}
</style>
