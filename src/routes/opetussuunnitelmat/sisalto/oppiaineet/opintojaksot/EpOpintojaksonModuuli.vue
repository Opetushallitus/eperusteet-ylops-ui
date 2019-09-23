<template lang="pug">
.moduulibox(:class="valittu && 'moduulibox-valittu'")
  .name {{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})
  .bottom
    .d-flex.bd-highlight
      .px-2.flex-grow-1
        .icon(v-if="isEditing",
          :class="isEditing && 'icon-editing'",
          @click="toggle()",
          @keyup.enter="toggle()",
          role="button",
          tabindex="0")
          fas(v-if="valittu", icon="check")
          fas(v-else, icon="plus")
      .px-2.info
        span.op {{ moduuli.laajuus }} {{ $t('opintopiste') }}
        ep-color-ball(:kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'")

</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { EpColorBall } from '@/components';
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
  padding: 40px 10px 44px 20px;
  position: relative;
  width: 158px;
  color: $blue-darken-1;
  user-select: none;

  .name {
    font-weight: bold;
    max-height: 76px;
    overflow: auto;

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
