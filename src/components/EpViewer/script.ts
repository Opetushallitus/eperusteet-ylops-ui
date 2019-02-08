import { Component, Prop, Vue } from 'vue-property-decorator';
import katex from 'katex';

@Component({
  name: 'EpViewer',
})
export default class EpViewer extends Vue {
    @Prop() private value!: string;

    private timeoutId: number | undefined = undefined;

    public mounted() {
      this.reRenderKatex();
    }

    public updated() {
      // Debounce render katex method, as it's quite time consuming
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.reRenderKatex();
      }, 150);
    }

    private reRenderKatex() {
      this.$el.querySelectorAll('span.math-tex').forEach( (el) => {
        if (el.textContent) {
          const text: string = el.textContent;
          katex.render(text, el as HTMLElement);
        }
      } );
    }
}
