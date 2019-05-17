<template lang="pug">
div(v-if="!isInitializing")
  router-view
  notifications(position="bottom right")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kielet, i18n } from '@/stores/kieli';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@/utils/delay';
import { notify } from '@/utils/notifications';

@Component
export default class App extends Vue {
  private isInitializing = true;

  public async mounted() {
    const loader = (this as any).$loading.show({
      color: '#2E5FD1',
    });

    await Kielet.init();
    await Kayttajat.init();
    await delay(500);
    this.isInitializing = false;
    loader.hide();
  }
}
</script>

<style lang="scss" src="./styles/app.scss">
</style>
