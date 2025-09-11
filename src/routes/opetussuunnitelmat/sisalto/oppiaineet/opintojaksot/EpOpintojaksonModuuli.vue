<template>
<div class="moduulibox" role="button" :class="{'moduulibox-valittu': valittu, 'selectable': isEditing}" @click="toggle()" @keyup.enter="toggle()" tabindex="0" :title="moduuliNimi">
  <div class="name">{{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})</div>
  <div class="bottom">
    <div class="d-flex bd-highlight justify-content-end">
      <div class="px-2 info">
        <span class="op">{{ moduuli.laajuus }} {{ $t('opintopiste') }}</span>
        <ep-color-indicator :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'">
        </ep-color-indicator>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { Lops2019OpintojaksonModuuliDto, Lops2019ModuuliDto, Lops2019OpintojaksoDto } from '@shared/api/ylops';
import EpRoute from '@/mixins/EpRoute';
import _ from 'lodash';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpColorIndicator,
  },
})
export default class EpOpintojaksonModuuli extends Mixins(EpRoute) {
  @Prop({ required: true })
  private moduuli!: Lops2019ModuuliDto;

  @Prop({ required: false })
  private value!: Lops2019OpintojaksonModuuliDto[];

  @Prop({ default: false })
  private isEditing!: boolean;

  get moduuliNimi() {
    return Kielet.kaanna((this.moduuli as any).nimi);
  }

  get koodi() {
    try {
      return this.moduuli!.koodi!.uri!;
    }
    catch (err) {
      return null;
    }
  }

  get valittu() {
    return this.koodi && this.koodit[this.koodi];
  }

  get koodit() {
    return _.keyBy(this.value, 'koodiUri');
  }

  public toggle() {
    if (!this.isEditing) {
      return;
    }

    const koodiUri = this.koodi;
    if (koodiUri) {
      if (this.koodit[koodiUri]) {
        this.$emit('input', _.reject(this.value, x => x.koodiUri === koodiUri));
      }
      else {
        this.$emit('input', [
          ...this.value,
          { koodiUri },
        ]);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.moduulibox {
  background-color: #E6F6FF;
  height: 161px;
  margin: 0;
  padding: 20px 10px 44px 20px;
  position: relative;
  width: 158px;
  color: $blue-darken-1;
  user-select: none;
  border-radius: 10px;
  box-shadow: 2px 3px 4px 1px rgba(0,26,88,0.1);
  outline: none;

  &.selectable {
    cursor: pointer;
  }

  &:hover {
    background-color: #C3EAFF;
  }

  .name {
    text-overflow: ellipsis;
    overflow: hidden;
    font-weight: bold;
    height: 100px;

    &::-webkit-scrollbar {
      width: 0.5em;
    }
    &::-webkit-scrollbar-track {
      background-color: $blue-lighten-4;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $blue-lighten-3;
      border-radius: 0.5em;
    }
  }

  .bottom {
    width: 100%;
    padding: 10px;
    position: absolute;
    left: 0;
    bottom: 0;

    .icon {
      display: inline-block;
      outline: none;
      color: #3367E3;
    }

    .icon-editing {
      cursor: pointer;
    }

    .info {
      .op {
        padding: 0 5px 0 0;
      }
    }
  }
}

.moduulibox-valittu {
  color: white;
  animation: fade 0.1s linear;
  background-color: #3367E3;

   &:hover {
    background-color: #3367E3;
  }

  .name {
    &::-webkit-scrollbar-track {
      background-color: $light-blue;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $dark-blue;
    }
  }

  .bottom {
    .icon {
      color: white;
    }
  }
}

</style>
