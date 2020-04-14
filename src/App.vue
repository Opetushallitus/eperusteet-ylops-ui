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
import { notify } from '@/utils/notifications';
import EpComments from '@/components/EpComments/EpComments.vue';
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

<style lang="scss">
@import '@shared/styles/app.scss';

span[kommentti] {
  background: #ffe598;
  color: #000;
}

span[kommentti].active {
  background: #ffd900;
  color: #000;
}

span[kommentti="uusi-kommentti"]  {
  background: #ffd900;
  color: #000;
}
</style>
