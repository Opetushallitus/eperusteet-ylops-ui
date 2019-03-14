<template lang="pug">
base-tile(icon="question", color="#CE52C6")
  template(slot="header")
    router-link(
      :to="{ name: 'useinkysytyt' }")
      | {{ $t('faq') }}
  template(slot="content")
    p {{ $t('faq-kuvaus') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
  },
})
export default class TileFaq extends Vue {

}
</script>
