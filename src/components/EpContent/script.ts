import { Component, Prop, Vue } from 'vue-property-decorator';

import { Kieli } from '@/tyypit';
import { Kielet, UiKielet } from '@/stores/kieli';

import EpContentBase from '@/components/EpContentBase/EpContentBase.vue';

@Component({
  name: 'EpContent',
  components: {
    'ep-content-base': EpContentBase,
  },
})
export default class EpContent extends Vue {
    @Prop() private value!: string;
    @Prop() private isEditable!: boolean;
}
