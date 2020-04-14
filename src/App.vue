<template>
<div v-if="!isInitializing">
  <router-view />
  <notifications style="margin-right: 6px; margin-top: 90px;"
                 position="top right"
                 :max="3" />
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';

@Component
export default class App extends Vue {
  private isInitializing = true;

  public async mounted() {
    const loader = (this as any).$loading.show({
      color: '#2E5FD1',
    });

    await Kayttajat.init();
    await delay(500);
    this.isInitializing = false;
    loader.hide();
  }
}
</script>

<style lang="scss" src="@shared/styles/app.scss">
</style>
