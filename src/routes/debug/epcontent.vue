<template lang="pug">
div
  h1 Debug (epcontent):
  hr
  ep-content(:isEditable="true"
    v-model="content1Value")
  span(v-html="content1Value")
  hr
  button(@click="content2Editable=true") Edit value
  ep-content(:isEditable="content2Editable"
    v-model="content2Value")
  span(v-html="content2Value")
  hr
  ep-content(v-model="content3Value")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpContent from '@/components/EpContent/EpContent.vue';

@Component({
  components: {
    EpContent,
  },
})
export default class EpContentDebug extends Vue {

  private content1Value: string = 'Initially editable';

  private content2Editable: boolean = false;
  private content2Value: string = 'Initially <b>not</b> editable';

  private content3Value: object = {
    _tunniste: 'xxxxxxxx-xxx-xxxx-xxxx-xxxxxxxxxxxx',
    fi: 'Testipohja',
    sv: 'Samma på svenska',
    _id: '1',
  };

}
</script>
