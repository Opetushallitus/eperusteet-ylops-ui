<template>
<div class="moduulibox" role="button" :class="valittu && 'moduulibox-valittu'" @click="toggle()" @keyup.enter="toggle()" tabindex="0">
  <div class="name">{{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})</div>
  <div class="bottom">
    <div class="d-flex bd-highlight">
      <div class="px-2 flex-grow-1">
        <div class="icon" v-if="isEditing" :class="isEditing && 'icon-editing'">
          <fas v-if="valittu" icon="check">
          </fas>
          <fas v-else icon="plus">
          </fas>
        </div>
      </div>
      <div class="px-2 info">
        <span class="op">{{ moduuli.laajuus }} {{ $t('opintopiste') }}</span>
        <ep-color-ball :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'">
        </ep-color-ball>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import EpColorBall from '@/components/EpColorBall/EpColorBall.vue';
import { Lops2019OpintojaksonModuuliDto, Lops2019ModuuliDto } from '@/tyypit';
import EpRoute from '@/mixins/EpRoute';
import _ from 'lodash';

@Component({
  components: {
    EpColorBall,
  },
})
export default class EpOpintojaksonModuuli extends Mixins(EpRoute) {
  @Prop({ required: true })
  private moduuli!: Lops2019ModuuliDto;

  @Prop({ required: true })
  private value!: Lops2019OpintojaksonModuuliDto[];

  @Prop({ default: false })
  private isEditing!: boolean;

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
@import "@/styles/_variables.scss";

.moduulibox {
  background-image: url('../../../../../../public/img/banners/moduuli.svg');
  height: 161px;
  margin: 0;
  padding: 20px 10px 44px 20px;
  position: relative;
  width: 158px;
  color: $blue-darken-1;
  user-select: none;
  cursor: pointer;

  .name {
    font-weight: bold;
    max-height: 76px;
    // overflow: auto;

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
  background-image: url('../../../../../../public/img/banners/moduuli_valittu.svg');
  color: white;
  animation: fade 0.1s linear;

  .name {
    &::-webkit-scrollbar-track {
      background-color: $light-blue;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $dark-blue;
    }
  }
}

@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>
