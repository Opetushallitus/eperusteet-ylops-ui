<template>
  <div v-if="style" :style="style" ref="box" id="comment-add-box">
    <div class="commentbox">
      <b-button
        v-if="onAdd"
        variant="primary"
        @click="onAdd">
        {{ $t('lisaa-kommentti') }}
      </b-button>
    </div>
  </div>
  <span v-else></span>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import { Kommentit } from '@/stores/kommentit';
import EpRoundButton from '@shared/components/EpButton/EpRoundButton.vue';


@Component({
  components: {
    EpRoundButton,
  },
})
export default class EpCommentAdd extends Vue {

  @Prop({ required: true })
  onAdd!: () => Promise<void>;

  get style() {
    if (this.bounds) {
      return {
        left: window.scrollX + this.bounds.x + 5 + 'px',
        top: window.scrollY + this.bounds.bottom + 10 + 'px',
      }
    }
    else {
      return null;
    }
  }

  get bounds() {
    return Kommentit.bounds.value;
  }

}
</script>

<style lang="scss" scoped>

#comment-add-box {
  position: absolute;
  user-select: none;

  .commentbox {
    padding: 9px;
    background: #fff;
    border: 1px solid #d5d5d5;
    box-shadow: 3px 3px 8px #999;
  }
}

</style>
