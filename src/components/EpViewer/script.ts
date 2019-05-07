import { Component, Prop, Vue } from 'vue-property-decorator';
import Popover from 'bootstrap-vue/es/components/popover/popover.js';
import katex from 'katex';

@Component({
  name: 'EpViewer',
})
export default class EpViewer extends Vue {
    @Prop() private value!: string;

    private timeoutId: number | undefined = undefined;

    public mounted() {
      this.reRenderKatex();
      this.reRenderAbbr();
    }

    public updated() {
      // Debounce render katex/abbr methods, as they are quite time consuming
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.reRenderKatex();
        this.reRenderAbbr();
      }, 150);
    }

    private reRenderAbbr() {
      let refCnt = 1;
      this.$el.querySelectorAll('abbr').forEach(el => {
        if (!el.id) {
          el.id = `abbr-ref-${refCnt}`;
          refCnt++;
        }

        // Todo: Lisää tähän kyseisen käsitteen otsikko ja sisältö
        const CoClass = Vue.extend(Popover);
        const instance = new CoClass({
          propsData: {
            title: 'TODO: title',
            content: 'TODO: content',
            target: el.id,
            placement: 'bottomright',
          },
        });
        instance.$mount();
        (this.$refs.tooltipContainer as HTMLElement).appendChild(instance.$el);
      });
    }

    private reRenderKatex() {
      this.$el.querySelectorAll('span.math-tex').forEach(el => {
        if (el.textContent) {
          const text: string = el.textContent;
          katex.render(text, el as HTMLElement);
        }
      });
    }
}
