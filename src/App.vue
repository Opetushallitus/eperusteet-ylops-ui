<template>
  <div class="minfull h-100">
    <router-view v-if="mounted" />
    <EpNotification />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import EpNotification from '@shared/components/EpNotification/EpNotification.vue';
import { Kayttajat } from '@/stores/kayttaja';
import { Ulkopuoliset } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import { useLoading } from 'vue-loading-overlay';
import { loadingOptions } from './utils/loading';
import { nextTick } from 'vue';
import { setGlobalBvModal } from '@shared/utils/globals';
import { getKaannokset } from '@shared/api/eperusteet';

const $loading = useLoading({
  ...loadingOptions,
  opacity: 1,
});

const mounted = ref(false);

onMounted(async () => {
  const instance = getCurrentInstance() as any;
  await nextTick();
  setGlobalBvModal(instance.ctx._bv__modal);

  const loading = $loading.show();
  Kielet.load(await getKaannokset());
  await Kayttajat.init();
  loading.hide();
  mounted.value = true;
});
</script>

<style lang="scss">
@import '@shared/styles/app.scss';

span[kommentti] {
  background: #ffe598;
  color: #000;
  cursor: pointer;
}

span[kommentti].active {
  background: #ffd900;
  color: #000;
  cursor: pointer;
}

span[kommentti="uusi-kommentti"]  {
  background: #ffd900;
  color: #000;
}
</style>
