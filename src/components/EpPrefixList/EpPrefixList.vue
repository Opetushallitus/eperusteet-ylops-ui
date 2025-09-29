<template>
  <div v-if="props.isEditable">
    <div
      v-for="(alue, alueIdx) in internal"
      :key="alueIdx"
      class="alue"
    >
      <div class="alue-editing">
        <div class="header">
          <div class="row">
            <div class="col-sm-6">
              <ep-input
                v-model="alue.nimi"
                :help="props.arvot + '-nimi'"
                :placeholder="$t(props.arvot + '-nimi')"
                :is-editing="true"
              />
            </div>
            <div class="col-sm-6">
              <div class="actions">
                <ep-button
                  variant="danger"
                  icon="close"
                  @click="poistaIndeksi(internal, alueIdx)"
                >
                  {{ $t('poista-alue-' + props.arvot) }}
                </ep-button>
              </div>
            </div>
          </div>
        </div>
        <div class="kohde">
          <ep-input
            v-model="alue[props.kohde]"
            :help="props.kohde"
            :is-editing="true"
          />
        </div>
        <div class="arvot">
          <VueDraggable
            class="arvot-group"
            v-bind="options"
            :list="alue[props.arvot]"
          >
            <div
              v-for="(item, idx) in alue[props.arvot]"
              :key="idx"
              class="arvo arvot-group-item"
            >
              <!-- fas.handle(icon="sort")-->
              <div class="text">
                <ep-input
                  v-model="item[props.arvo]"
                  :is-editing="true"
                />
              </div>
              <div class="actions">
                <ep-button
                  variant="danger"
                  icon="close"
                  @click="poistaIndeksi(alue[props.arvot], idx)"
                >
                  {{ $t('poista') }}
                </ep-button>
              </div>
            </div>
          </VueDraggable>
          <ep-button
            icon="add"
            @click="lisaaArvo(alue)"
          >
            {{ $t('lisaa-arvo-' + props.arvo) }}
          </ep-button>
        </div>
      </div>
    </div>
    <ep-button
      v-if="hasMultiple"
      icon="add"
      @click="lisaaAlue()"
    >
      {{ $t('lisaa-alue-' + props.arvot) }}
    </ep-button>
  </div>
  <div v-else>
    <div
      v-for="(alue, alueIdx) in internal"
      :key="alueIdx"
      class="alue"
    >
      <div class="header">
        <ep-input
          v-model="alue.nimi"
          :is-editing="props.isEditable"
        />
      </div>
      <div class="kohde">
        <ep-input
          v-model="alue[props.kohde]"
          :is-editing="props.isEditable"
        />
      </div>
      <ul class="arvot">
        <li
          v-for="(item, idx) in alue[props.arvot]"
          :key="idx"
          class="arvo"
        >
          <ep-input
            :model-value="props.arvo ? item[props.arvo] : item"
            :is-editing="false"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';

import { VueDraggable } from 'vue-draggable-plus';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';

import { $t } from '@shared/utils/globals';

const props = withDefaults(
  defineProps<{
    isEditable?: boolean;
    modelValue: any;
    kohde?: string;
    arvot?: string;
    arvo?: string;
  }>(), {
    isEditable: false,
    kohde: 'kohde',
    arvot: 'arvot',
    arvo: '',
  });

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const hasMultiple = computed(() => {
  return _.isArray(sanitized.value);
});

const sanitized = computed(() => {
  if (_.isArray(props.modelValue)) {
    return props.modelValue;
  }
  else {
    return [props.modelValue];
  }
});

const internal = computed({
  get() {
    return sanitized.value;
  },
  set(value: any) {
    emit('update:modelValue', value);
  },
});

const options = computed(() => {
  return {
    // handle: '.handle',
    animation: 300,
    disabled: false,
  };
});

const poistaIndeksi = (arr: any[], alueIdx: number) => {
  arr.splice(alueIdx, 1);
};

const lisaaAlue = () => {
  internal.value.push({
    nimi: {},
    [props.kohde]: {},
    [props.arvot]: [],
  });
};

const lisaaArvo = (alue: any) => {
  alue[props.arvot].push(props.arvo
    ? { [props.arvo]: {} }
    : {});
};
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables.scss';

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
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }

  }
}
</style>
