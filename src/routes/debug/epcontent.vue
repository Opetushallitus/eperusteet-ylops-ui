<template lang="pug">
div
  h1 Debug (epcontent):
  hr
  epcontent(:isEditable="true", v-model="content1Value")
  span(v-html="content1Value")
  hr
  button(@click="content2Editable=true") Edit value
  epcontent(:isEditable="content2Editable", v-model="content2Value")
  span(v-html="content2Value")
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
      content1Value: 'Initially editable',

      content2Editable: false,
      content2Value: 'Initially <b>not</b> editable',
    };
  }
}
</script>
