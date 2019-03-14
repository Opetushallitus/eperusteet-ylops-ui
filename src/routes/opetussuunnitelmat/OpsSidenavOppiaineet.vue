<template lang="pug">
ul.navigation
  router-link.oppiainelinkki.router-link-exact-active(:to="{ 'name': 'opsTiedot' }" tag="li")
    fas(icon="chevron-left")
    a.btn.btn-link {{ $t('oppiaineet') }}
</template>

<style scoped lang="scss" src="./sidenav.scss"></style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'ops-sidenav-oppiaineet',
})
export default class OpsSidenavOppiaineet extends Vue {

}
</script>
