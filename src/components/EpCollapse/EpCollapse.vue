<template>
<div>
  <hr v-if="first" />
  <div class="ep-collapse" v-if="!disableHeader">
    <!-- Button tagia ei voida käyttää, sillä ml-auto ei toimi.-->
    <!-- Käytetään button rolea saavutettavuuden takaamiseksi.-->
    <div class="collapse-button d-flex"
         @click="toggle()"
         @keyup.enter="toggle()"
         role="button"
         tabindex="0"
         :aria-expanded="toggled">
      <div class="align-self-start">
        <div class="header">
          <slot name="header"></slot>
        </div>
      </div>
      <div class="ml-auto align-self-start">
        <fas fixed-width icon="chevron-up" v-if="toggled"></fas>
        <fas fixed-width icon="chevron-down" v-else></fas>
      </div>
    </div>
    <div v-if="toggled">
      <slot></slot>
    </div>
  </div>
  <slot v-else></slot>
  <hr />
</div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { setItem, getItem } from '@/utils/localstorage';
import _ from 'lodash';

@Component
export default class EpCollapse extends Vue {
  @Prop({ default: true })
  private expandedByDefault!: boolean;

  @Prop({ default: false })
  private disableHeader!: boolean;

  @Prop({ default: '' })
  private tyyppi!: string;

  @Prop({ default: false})
  private first!: boolean;

  private toggled = false;

  isToggled() {
    try {
      if (this.tyyppi) {
        const item = getItem('toggle-' + this.tyyppi);
        if (_.isObject(item)) {
          return (item as any).toggled;
        }
      }
      return true;
    }
    catch (err) {
      return true;
    }
  }

  mounted() {
    this.toggled = this.tyyppi
      ? this.isToggled()
      : this.expandedByDefault;
  }

  toggle() {
    this.toggled = !this.toggled;
    if (this.tyyppi) {
      setItem('toggle-' + this.tyyppi, {
        toggled: this.toggled,
      });
    }
  }
}
</script>
<style scoped lang="scss">
@import '@/styles/_variables.scss';

.ep-collapse {

  padding: 27px 0 27px 0;

  .collapse-button {
    cursor: pointer;
    outline: none;
  }

  .header {
    user-select: none;
  }

  hr {
    margin: 0px;
  }

}
</style>
