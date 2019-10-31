<template lang="pug">
div
  ep-navigation(:tutoriaalistore="tutoriaalistore")
  .content
    .container
      .row
        //.col.col-fixed
          slot(name="icon")
        .col
          slot(name="header")
      .view-content(v-if="$slots['default']")
        .row
          //.col.col-fixed.col-new
          .col
            slot(name="default")
      slot(name="custom-content")
  slot(name="after")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

@Component({
  components: {
    EpNavigation,
  },
})
export default class EpMainView extends Vue {

  @Prop({required: true})
  private tutoriaalistore!: TutoriaaliStore;

}
</script>

<style scoped lang="scss">

@import "@/styles/_variables.scss";

.content {
  padding: 20px;
}

.col-fixed {
  flex: 0 0 $main-view-offset;
}

h5 {
  overflow-x: hidden;
}

.view-content {
  margin-top: 40px;
}

</style>
