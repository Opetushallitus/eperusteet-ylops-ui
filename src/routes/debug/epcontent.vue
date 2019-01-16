<template lang="pug">
div
  h1 Debug (epcontent):
  hr
  epcontent(:isEditable="true", v-model="editableValue")
  hr
  span(v-html="editableValue")
  hr
  epcontent(:isEditable="false", :value="fixedValue")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpContent from '@/components/EpContent/EpContent.vue';

@Component({
  components: {
    epcontent: EpContent,
  },
})

export default class EpContentDebug extends Vue {
  public data() {
    return {
      editableValue: 'Editable',
      fixedValue: '<b>Not</b> editable value',
    };
  }
}
</script>
