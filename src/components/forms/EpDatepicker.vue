<template lang="pug">
div
  under-construction
</template>

<script lang="ts">

import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import _ from 'lodash';
import UnderConstruction from '@/routes/UnderConstruction.vue';


@Component({
  components: {
    UnderConstruction,
  },
})
export default class EpDatepicker extends Vue {

}
</script>

<style scoped lang="scss">
</style>
