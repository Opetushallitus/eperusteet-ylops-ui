<template>
<div style="display: none;">
</div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Vue, Prop, Watch, Mixins, Component } from 'vue-property-decorator';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpButton from '@/components/EpButton/EpButton.vue';


@Component({
  components: {
    EpSpinner,
    EpButton,
  },
})
export default class EpComments extends Vue {
  mounted() {

  }

  beforeDestroy() {
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}

.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}

.commentbar {
  position: absolute;
  right: 0;
  top: 0;
  background: blue;
  width: 300px;
  height: calc(100vh);
}
</style>

