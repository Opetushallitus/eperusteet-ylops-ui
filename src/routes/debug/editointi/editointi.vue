<template lang="pug">
div
  h2 Osan editointi
  ep-editointi(:hooks="hooks")
    template(slot-scope="scope")
      div
        h3 Nimi
        ep-content(v-model="scope.data.nimi" :is-editable="scope.isEditing")
        h3 Kuvaus
        ep-content(v-model="scope.data.kuvaus" :is-editable="scope.isEditing")
        h2 Data:
        pre {{ scope.data }}
</template>
<script lang="ts" src="./script.ts"></script>
