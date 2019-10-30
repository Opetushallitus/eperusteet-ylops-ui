<template>
  <ep-main-view>
    <template slot="icon">
      <ep-icon class="float-right" icon="question" background-color="#CE52C6"></ep-icon>
    </template>

    <template slot="header">
      <h2>{{$t('virhe-nakyma-otsikko') }}</h2>
    </template>

    <div slot="custom-content">
      <div class="virhekuva">
        <img src="img/images/virhe.svg" :alt="$t('virhekuva')">
      </div>
      <p v-if="error">{{$t (error.viesti)}}: {{error.virhe}}</p>

      <ep-form-content name="virhe-nakyma-kuvaus">
        <ep-content v-model="virheteksti" layout="simplified" :is-editable="!sent" help="virhe-nakyma-selite"></ep-content>
      </ep-form-content>

      <div class="d-flex flex-row-reverse">
        <div class="ml-4">
          <ep-button
            v-if="!sent"
            :show-spinner="sending"
            @click="lahetaVirheteksti">{{$t('virhe-nakyma-laheta')}}</ep-button>
        </div>
        <div class="align-self-center">
          <router-link :to="{ name: 'root'}">{{ $t('palaa-etusivulle') }}</router-link>
        </div>
      </div>
    </div>
  </ep-main-view>

</template>

<script lang="ts" >
import { Component, Vue, Mixins } from 'vue-property-decorator';
import { createLogger } from '@/stores/logger';
import { success, fail, info } from '@/utils/notifications';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpField from '@/components/forms/EpField.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpButton from '@/components/EpButton/EpButton.vue';

const logger = createLogger('Virhe');

@Component({
  components: {
    EpMainView,
    EpField,
    EpContent,
    EpFormContent,
    EpButton,
  },
} as any)
export default class VirheRoute extends Vue {
  private error: any = {};
  private virheteksti: string = '';
  private sending = false;
  private sent = false;

  public mounted() {
    try {
      this.error = (this.$route.query as any);
    }
    catch (err) {
      logger.log(err);
    }
  }

  public async lahetaVirheteksti() {
    try {
      this.sending = true;
      await this.delay(2000);

      this.sent = true;
      success('virhe-nakyma-lahetetty');

    } catch(err) {
      logger.log('Virhe virheen lähetyksessä: ' + err);
      fail('virhe-nakyma-lahetys-virhe', err);
      this.sent = false;
    } finally {
      this.sending = false;
    }

  }

  public delay(ms) {
    return new Promise(res => {
      setTimeout(res, ms);
      // throw new Error('errori');
    });
  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.confirm-buttons::after {
  clear: both;
}

.virhekuva {
  img {
    width: 100%;
  }
  padding: 0 10% 0 10%;
}


</style>
