<template>
  <base-tile icon="opetussuunnitelmasi" :route="vars.route">
    <template slot="header">
      <span>{{ $t(vars.header) }}</span>
    </template>
    <template slot="content">
      <ep-spinner v-if="countIsLoading"></ep-spinner>
      <div v-else>
        <table class="count-table">
          <tr>
            <td width="50%">
              <div class="bignumber">{{ keskeneraiset }}</div>
              <div class="description">{{ $t('keskeneraista') }}</div>
            </td>
            <td class="spacer" width="50%">
              <div class="bignumber">{{ julkaistut }}</div>
              <div class="description">{{ $t(vars.julkaistua) }}</div>
            </td>
          </tr>
        </table>
      </div>
    </template>
  </base-tile>
</template>

<script lang="ts">
import { Prop, Component, Mixins } from 'vue-property-decorator';
import EpRoot from '@/mixins/EpRoot';
import BaseTile from './BaseTile.vue';
import {
  EpContent,
  EpSpinner,
} from '@/components';
import { Opetussuunnitelmat } from '@/api';
import { delay } from '@/utils/delay';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';
import _ from 'lodash';

@Component({
  components: {
    BaseTile,
    EpContent,
    EpSpinner,
  },
  mixins: [EpRoot],
})
export default class TileOpetussuunnitelmat extends Mixins(EpRoot) {
  @Prop({
    default: () => 0,
  })
  private keskeneraiset!: number;

  @Prop({
    default: () => 0,
  })
  private julkaistut!: number;

  @Prop({
    default: () => true,
  })
  private isOps!: boolean;

  @Prop({
    default: true,
    type: Boolean
  })
  private countIsLoading: boolean = true;

  get vars() {
    if (this.isOps) {
      return {
        header: 'tile-opetussuunnitelmasi',
        julkaistua: 'julkaistua',
        route: {
          name: 'opetussuunnitelmaListaus',
        },
      };
    }
    else {
      return {
        header: 'tile-pohjasi',
        julkaistua: 'valmista',
        route: {
          name: 'pohjaListaus',
        },
      };
    }
  }
}
</script>

<style scoped lang="scss">
.ops {
  .ops-container {
    align-items: center;
  }

  .data {
    text-align: left;

    .name {
      font-weight: bold;
    }

    .tiedot {

      .description {
        font-size: 70%;
      }

      .muokattu {
        font-size: 70%;
      }
    }
  }
}

.count-table {
  width: 100%;

  .spacer {
    border-left: 1px solid #DADADA;;
  }

  td {
    padding: 8px;

    .bignumber {
      color: #28344F;
      font-size: 32px;
    }

    .description {
    }
  }
}

</style>
