<template>
  <ep-home-tile icon="article" :route="vars.route">
    <template #header>
      <span>{{ $t(vars.header) }}</span>
    </template>
    <template #content>
      <ep-spinner v-if="countIsLoading"></ep-spinner>
      <div v-else>
        <table class="count-table">
          <tbody>
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
          </tbody>
        </table>
      </div>
    </template>
  </ep-home-tile>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEpRoot } from '@/mixins/EpRoot';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';

const props = withDefaults(
  defineProps<{
    keskeneraiset?: number;
    julkaistut?: number;
    isOps?: boolean;
    countIsLoading?: boolean;
  }>(), {
  keskeneraiset: 0,
  julkaistut: 0,
  isOps: true,
  countIsLoading: true,
});

const { isLoading, vahvista, loading, init, getMetaInfo } = useEpRoot();

const vars = computed(() => {
  if (props.isOps) {
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
});
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
