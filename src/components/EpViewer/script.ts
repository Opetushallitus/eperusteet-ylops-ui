import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import _ from 'lodash';

import Popover from 'bootstrap-vue/es/components/popover/popover.js';
import katex from 'katex';

@Component({
  name: 'EpViewer',
})
export default class EpViewer extends Vue {
  @Prop() private value!: string;

  // OPS:n käsitteet (käsitemodulia varten)
  @Prop({ default: () => {} })
  private opsKasitteet!: object;

  private timeoutId: number | undefined = undefined;
  private toolTipInstances:any = [];

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

  private haeKasiteData(el: HTMLElement) {
    const avain = el.getAttribute('data-viite');
    return {
      title: _.get(this.opsKasitteet, `${avain}.title`, ''),
      content: _.get(this.opsKasitteet, `${avain}.content`, ''),
    };
  }

  private luoSisaltoSlot(content: string) {
    const SlotBuilder = Vue.component('popover-slot', {
      render: (createElement) => {
        return createElement('div', {
          domProps: {
            innerHTML: content,
          },
        });
      },
    });
    const slotInstance = new SlotBuilder();
    slotInstance.$mount();
    return (slotInstance as any)._vnode;
  }

  private reRenderAbbr() {
    // Poistetaan edelliset tooltip:t
    this.toolTipInstances.forEach(instance => {
      instance.$destroy();
    });
    (this.$refs.tooltipContainer as HTMLElement).innerHTML = '';

    // Luodaan tooltip:t abbr elementeille
    let refCnt = 1;
    this.$el.querySelectorAll('abbr').forEach(el => {
      // Annetaan abbr elementille ID, johon popover tarraa kiinni
      refCnt++;
      el.id = el.id ? el.id : `abbr-ref-${refCnt}`;

      // Haetaan käsitteen otsikko ja sisältö
      const { title, content } = this.haeKasiteData(el);
      if (title !== '' || content !== '') {
        // Luodaan itse popover
        const CoClass = Vue.extend(Popover);
        const instance = new CoClass({
          propsData: {
            title,
            target: el.id,
            placement: 'bottomright',
          },
        });
        instance.$slots.default = [this.luoSisaltoSlot(content)];
        instance.$mount();

        this.toolTipInstances.push(instance);

        // Liitetään popover komponenttiin
        (this.$refs.tooltipContainer as HTMLElement).appendChild(instance.$el);
      }
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

  @Watch('opsKasitteet')
  private onKasiteChange(dst, src) {
    this.reRenderAbbr();
  }
}
