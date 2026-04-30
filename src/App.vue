<template>
  <div class="minfull h-full">
    <router-view v-if="mounted" />
    <EpNotification />
    <EpConfirmService />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EpNotification from '@shared/components/EpNotification/EpNotification.vue';
import EpConfirmService from '@shared/components/EpConfirmService/EpConfirmService.vue';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { useLoading } from 'vue-loading-overlay';
import { loadingOptions } from '@shared/config/loading';
import { getKaannokset } from '@shared/api/eperusteet';

const $loading = useLoading({
  ...loadingOptions,
  opacity: 1,
});

const mounted = ref(false);

onMounted(async () => {
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
