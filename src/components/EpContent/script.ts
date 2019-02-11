import { Component, Prop, Vue } from 'vue-property-decorator';

import { Kielet } from '@/stores/kieli';

import EpContentBase from '@/components/EpContentBase/EpContentBase.vue';

@Component({
  components: {
    EpContentBase,
  },
})
export default class EpContent extends Vue {
  @Prop({
    required: true,
  })
  private value!: string | object;

  @Prop({
    default: false,
  })
  private isEditable!: boolean;

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

  private handleContentChange(content:string) {
    if (typeof this.value === 'string') {
      this.$emit('input', content);
    }

    // Jos alkuperäinen arvo oli objekti, korvataan objektista vain
    // kyseisen sisältökielen mukainen arvo
    const kieli = Kielet.getSisaltoKieli();
    (this.value as any)[kieli] = content;
  }
}
