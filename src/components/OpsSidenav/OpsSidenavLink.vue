<template lang="pug">
li(@click="handleClick", :class="{ 'router-link-exact-active': isExactRoute }")
  slot
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Kielet } from '@/stores/kieli';

@Component
export default class OpsSidenavLink extends Vue {
  @Prop()
  private to!: any;

  @Prop()
  private click: any;

  @Prop()
  private itemData: any;

  private linkRoute: any = null;

  mounted() {
    if (this.to) {
      this.resolveRoute();
    }
  }

  private handleClick(e) {
    if (this.click) {
      this.click(this.itemData);
      e.preventDefault();
    }
  }

  private resolveRoute() {
    const lang = Kielet.getUiKieli();
    const id = this.$route.params.id;

    this.linkRoute = {
      name: this.to.name,
      params: {
        ...this.to.params,
        lang,
        id
      }
    };

    const href = this.$router.resolve(this.linkRoute).href;
    this.$el.querySelectorAll('a').forEach(el => {
      el.href = href;
    });
  }

  private get isExactRoute() {
    return (this.linkRoute && this.$route.fullPath === this.linkRoute.path);
  }

  @Watch('$route')
  onRouteChange(to, from) {
    // This happens for ex. when changing ui language
    if (this.to) {
      this.resolveRoute();
    }
  }

  @Watch('to')
  onToChange(to, from) {
    // This happens, when vue recycles component
    if (this.to) {
      this.resolveRoute();
    }
    else {
      this.linkRoute = null;
      this.$el.querySelectorAll('a').forEach(el => {
        el.removeAttribute('href');
      });
    }
  }
}
</script>
