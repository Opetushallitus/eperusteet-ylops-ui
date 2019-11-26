<template lang="pug">
div#app(v-if="!isInitializing")
  router-link(:to="{ name: 'kommentit' }") Kommentit
  router-view
  notifications(style="margin-right: 6px; margin-top: 90px" position="top right" :max="3")
  ep-comments
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { KieliStore } from '@shared/stores/kieli';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@/utils/delay';
import { notify } from '@/utils/notifications';
import EpComments from '@/components/EpComments/EpComments.vue';


@Component({
  components: {
    EpComments,
  },
})
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

<style lang="scss" src="./styles/app.scss">
</style>
