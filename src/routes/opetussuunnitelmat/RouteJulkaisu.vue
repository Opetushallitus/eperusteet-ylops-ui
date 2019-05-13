<template lang="pug">

div.content

</template>

<script lang="ts">

import { EpContent, EpDatepicker, EpEditointi, EpField, EpFormContent, EpSelect, EpToggle } from '@/components';

import EpOpsRoute from '@/mixins/EpOpsRoute';

import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import _ from 'lodash';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { Component } from 'vue-property-decorator';
import { opsTiedotValidator } from '@/validators/ops';
import { Kielet } from '@/stores/kieli';

@Component({
  components: {
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
}
</script>

<style scoped lang="scss">
</style>
