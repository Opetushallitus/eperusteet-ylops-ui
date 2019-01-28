import { Component, Prop, Vue } from 'vue-property-decorator';

import { Kielet } from '@/stores/kieli';

import EpContentBase from '@/components/EpContentBase/EpContentBase.vue';

@Component({
  components: {
    EpContentBase,
  },
})
export default class EpContent extends Vue {
    @Prop() private value!: string | object;
    @Prop() private isEditable!: boolean;

    get contentValue() {
      if (typeof this.value === 'string') {
        return this.value;
      }

      const kieli = Kielet.getSisaltoKieli();
      if (this.value.hasOwnProperty(kieli)) {
          return (this.value as any)[kieli];
      }

      return '';
    }
}
