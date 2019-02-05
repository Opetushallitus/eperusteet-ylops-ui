import { Component, Prop, Vue } from 'vue-property-decorator';
import katex from 'katex';

import 'katex/dist/katex.min.css';

@Component({
  name: 'EpViewer',
})
export default class EpViewer extends Vue {
    @Prop() private value!: string;

    public mounted() {
      this.reRenderKatex();
    }

    public updated() {
      this.reRenderKatex();
    }

    private reRenderKatex() {
      // FIXME: This method shouldn't trigger on every change, since it's quite time consuming

      this.$el.querySelectorAll('span.math-tex').forEach( (el) => {
        if (el.textContent) {
          const text: string = el.textContent;
          katex.render(text, el as HTMLElement);
        }
      } );
    }
}
