<template>
  <div class="about">
    <h1>This is an about page</h1>
    <pre>{{ tiedot }}</pre>
    <button @click="fetchKayttajanimi">Click</button>

    <div>
      <input type="text" v-model="name">
      <button @click="setKayttajanimi(name)">Aseta</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kayttajat } from '@/stores/kayttaja';


@Component
export default class Home extends Vue {
  private name: string = '';

  get tiedot() {
    return Kayttajat.tiedot;
  }

  private fetchKayttajanimi() {
    Kayttajat.fetchTiedot();
  }

}
</script>
