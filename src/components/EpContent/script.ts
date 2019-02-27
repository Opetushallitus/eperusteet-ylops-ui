import { Component, Prop, Vue } from 'vue-property-decorator';

import { Kielet } from '@/stores/kieli';

import EpContentBase from '@/components/EpContentBase/EpContentBase.vue';


@Component({
  components: {
    EpContentBase,
  },
})
export default class EpContent extends Vue {
  @Prop({ required: true })
  private value!: string | object;

  @Prop({
    default: false,
  })
  private isEditable!: boolean;

  get contentValue() {
    if (!this.value) {
      return '';
    }

    if (typeof this.value === 'string') {
      return this.value;
    }

    const kieli = Kielet.getSisaltoKieli();
    return (this.value as any)[kieli];
  }

  private handleContentChange(content: string) {
    if (typeof this.value === 'string') {
      this.$emit('input', content);
      return;
    }

    // Jos alkuperäinen arvo oli objekti, luodaan objektista uusi kopio ja
    // korvataan siitä kyseisen sisältökielen mukainen arvo. Kts:
    // https://github.com/vuejs/vue/issues/4373#issuecomment-279826554
    const kieli = Kielet.getSisaltoKieli();
    this.$emit('input', { ...this.value, [kieli]: content });
  }
}
