<template lang="pug">
.form-group.form-content(v-if="isEditing")
  label {{ $t(name) }}:
  div(v-if="items")
    select.form-control(
      v-model="model"
      :multiple="multiple")
      option(disabled value="null")
      option(v-for="item in items" :value="item")
        slot(name="item")
          span {{ $kaanna(item) }}
    small(v-if="help").form-text.text-muted {{ $t(help) }}
  ep-spinner(v-else)
.form-content(v-else)
  label {{ $t(name) }}:
  ul
    li(v-for="item in model")
      slot(name="item")
        span {{ $kaanna(item) }}
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpInput from '@/components/forms/EpInput.vue';

@Component({
  components: {
    EpContent,
    EpInput,
  },
})
export default class RouteTiedot extends Vue {
  @Prop({ required: true })
  private name!: string;

  @Prop({ required: true })
  private items!: any[];

  @Model('change', { required: true })
  private model!: any;

  @Prop({ default: '' })
  private help!: string;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: false })
  private multiple!: boolean;

}
</script>

<style scoped lang="scss">

@import './style.scss';

.form-content {
  padding: 20px;

  label {
    font-weight: 600;
  }

  .form-data {
    margin-top: -5px;
    padding-left: 2px;
  }
}

</style>
