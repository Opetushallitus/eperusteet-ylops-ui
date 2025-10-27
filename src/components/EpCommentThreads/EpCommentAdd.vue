<template>
  <div
    v-if="style"
    id="comment-add-box"
    ref="box"
    :style="style"
  >
    <div class="commentbox">
      <b-button
        v-if="onAdd"
        variant="primary"
        @click="onAdd"
      >
        {{ lisaaKommenttiTeksti }}
      </b-button>
    </div>
  </div>
  <span v-else />
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import _ from 'lodash';
import { Kommentit } from '@/stores/kommentit';
import EpRoundButton from '@shared/components/EpButton/EpRoundButton.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  onAdd: () => Promise<void>;
}>();

const box = useTemplateRef('box');

const lisaaKommenttiTeksti = $t('lisaa-kommentti');

const bounds = computed(() => {
  return Kommentit.bounds.value;
});

const style = computed(() => {
  if (bounds.value) {
    return {
      left: window.scrollX + bounds.value.x + 5 + 'px',
      top: window.scrollY + bounds.value.bottom + 10 + 'px',
    };
  }
  else {
    return null;
  }
});
</script>

<style lang="scss" scoped>

#comment-add-box {
  position: absolute;
  user-select: none;

  .commentbox {
    padding: 9px;
    background: #fff;
    border: 1px solid #d5d5d5;
    box-shadow: 3px 3px 8px #999;
  }
}

</style>
