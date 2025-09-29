<template>
  <div class="ketju">
    <div v-if="first">
      <div class="kommentti p-3">
        <div class="topbar d-flex align-items-center justify-content-between">
          <div class="pvm">
            {{ $ago(first.luotu || new Date()) }}
          </div>
        </div>
        <div class="nimi">
          {{ first.nimi }}
        </div>
        <div class="viesti mt-1">
          {{ first.sisalto }}
        </div>
      </div>
    </div>
    <div v-if="hasEllipsis">
      <div class="kommentti purettu pl-3 text-muted">
        <EpMaterialIcon>more_horiz</EpMaterialIcon>
      </div>
    </div>
    <div v-if="last">
      <div class="kommentti p-3">
        <div class="topbar d-flex align-items-center justify-content-between">
          <div class="pvm">
            {{ $ago(last.luotu || new Date()) }}
          </div>
        </div>
        <div class="nimi">
          {{ last.luoja }}
        </div>
        <div class="viesti mt-1">
          {{ last.sisalto }}
        </div>
      </div>
    </div>
    <div>
      <div class="kommentti purettu pl-1 text-muted">
        <b-button
          variant="link"
          @click="activateThread()"
        >
          <EpMaterialIcon>search</EpMaterialIcon>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { KommenttiDto } from '@shared/api/ylops';
import { Kommentit } from '@/stores/kommentit';
import _ from 'lodash';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  value: KommenttiDto[];
}>();

const nimi = computed(() => {
  if (!first.value) {
    return null;
  }
  return first.value?.nimi || first.value?.muokkaaja || $t('tuntematon-kayttaja');
});

const first = computed(() => {
  if (props.value) {
    return _.first(props.value);
  }
  else {
    return null;
  }
});

const last = computed(() => {
  if (_.size(props.value) > 1) {
    return _.last(props.value);
  }
  else {
    return null;
  }
});

const hasEllipsis = computed(() => {
  return _.size(props.value) > 2;
});

const showThread = () => {
  if (first.value?.thread) {
    Kommentit.scrollTo(first.value.thread);
  }
};

const activateThread = () => {
  if (first.value?.thread) {
    Kommentit.activateThread(first.value.thread);
  }
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.kommentti {
  background: #fff;
  height: 100%;
  box-shadow: 0 2px 4px 0 rgba(207, 207, 207, 0.5);
  border: 1px solid #eee;
  // border-radius: 10px;

  .topbar {
    height: 10px;

    .pvm {
      color: #555;
    }

    .actions {
      color: #28344F;
    }
  }

  .nimi {
    color: #28344F;
    font-weight: 600;
    font-size: 1.2em;
  }

  .viesti {
    color: #575757;

    textarea.editori {
      border: 1px solid #ccc;
      min-height: 4em;
      overflow: auto;
      resize: vertical;
      width: 100%;
    }

  }
}

.subthreads {
  margin-left: 20px;
}

.ketju {
  padding: 5px;
  margin-bottom: 10px;
}

.purettu {
  background: #fcfcfc;
}

</style>
