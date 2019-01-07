<template>
  <div class="about">
    <h1>This is an about page</h1>
    <pre>{{ tiedot }}</pre>
    <button @click="setKayttajanimi">Click</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kayttajat } from '@/stores/kayttaja';


@Component
export default class Home extends Vue {
  get tiedot() {
    return Kayttajat.tiedot;
  }

  private setKayttajanimi() {
    Kayttajat.fetchTiedot();
  }
}
</script>
