<template>
  <component :is="tag" @click="handleClick" :class="{ 'router-link-exact-active': isExactRoute }">
    <div class="menu-item w-100" v-if="to">
      <router-link :to="to">
        <slot />
      </router-link>
    </div>
    <slot v-else/>
  </component>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { Kielet } from '@shared/stores/kieli';
import { SideMenuEntry } from '@shared/tyypit';

@Component
export default class OpsSidenavLink extends Vue {
  @Prop()
  private to!: any;

  @Prop()
  private click: any;

  @Prop({ default: null })
  private clickParams: any;

  @Prop({ default: 'li' })
  private tag!: string;

  @Prop()
  private itemData!: SideMenuEntry;

  private linkRoute: any = null;

  mounted() {
    if (this.to) {
      this.resolveRoute();
    }
  }

  private handleClick(e) {
    if (this.click) {
      this.click(this.clickParams ? this.clickParams : this.itemData);
      e.preventDefault();
    }
  }

  private resolveRoute() {
    if (!this.$route) {
      return;
    }

    this.linkRoute = this.$router.resolve({
      name: this.to.name,
      params: {
        ...this.to.params,
        lang: Kielet.getUiKieli.value,
        id: this.$route.params.id,
      },
      query: this.to.query,
    });

    this.$el.querySelectorAll('a').forEach(el => {
      el.href = this.linkRoute.href;
    });
  }

  private get isExactRoute() {
    const path = _.get(this.linkRoute, 'resolved.path', null);
    return (path && this.$route.fullPath === path);
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

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
  .menu-item {
    font-size: 14px;
    padding-top: 0px;
    padding-bottom: 14px;
    a {
      color: #000;

      &.router-link-exact-active {
        font-weight: 700;
        color: #0041DC;
      }
    }
  }
</style>
