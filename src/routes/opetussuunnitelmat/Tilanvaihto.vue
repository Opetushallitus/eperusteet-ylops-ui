<template lang="pug">

div(v-if="mahdollisetTilat")
  ep-button(v-b-modal.tilanvaihtomodal)
    | {{ $t('vaihda-tilaa') }}

  b-modal(
    ref="modal",
    id="tilanvaihtomodal",
    size="lg"
    title="testi")
    template(slot="modal-header")
      | {{ $t('vaihda-tilaa') }}

    template(slot="modal-footer")
      ep-button(@click="tallenna()", :disabled="!selected", :show-spinner="isUpdating") 
        | {{ $t('ok') }}
      ep-button(@click="peruuta()", :disabled="isUpdating") 
        | {{ $t('peruuta') }}

    .tilat
      button(v-for="tila in mahdollisetTilat", @click="vaihdaTila(tila)")
        .tila(:class="{ 'tila-selected': selected === tila }")
          .ikoni(:class="'ikoni-' + tila")
            .kuvake
              fas(v-if="tila === 'julkaistu'" icon="glass-cheers")
              fas(v-else-if="tila === 'poistettu'" icon="file-archive")
              fas(v-else-if="tila === 'valmis'" icon="thumbs-up")
              fas(v-else icon="pencil-ruler")
            .nimi {{ $t('tilanimi-' + tila) }}
          .tiedot {{ $t('tilakuvaus-' + tila) }}
div(v-else)
  ep-spinner

</template>

<script lang="ts">
import EpButton from '@/components/EpButton/EpButton.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpRoute from '@/mixins/EpRoute';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import _ from 'lodash';
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { Kielet } from '@/stores/kieli';
import { YlopsKoulutustyypit } from '@/utils/perusteet';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { sallittuSiirtyma } from '@/utils/tilat';

import {
  Ulkopuoliset,
  Opetussuunnitelmat,
} from '@/api';

import {
  OpetussuunnitelmaInfoDto,
  OpetussuunnitelmaLuontiDto,
  LokalisoituTekstiDto,
  Kieli,
} from '@/tyypit';

@Component({
  components: {
    EpInput,
    EpSpinner,
    EpButton,
  },
})
export default class Tilanvaihto extends Vue {

  @Prop({ required: true })
  private onSave!: (tila: string) => Promise<boolean>;

  @Prop({ required: true })
  private value!: string;

  private isUpdating: boolean = false;
  private selected: string | null = null;

  get mahdollisetTilat() {
    return sallittuSiirtyma(this.value);
  }

  private async tallenna() {
    this.isUpdating = true;
    try {
      if (this.selected && await this.onSave(this.selected)) {
        // this.$emit('input', tila);
        (this.$refs.modal as any).hide();
      }
    }
    catch (err) {
    }
    finally {
      this.isUpdating = false;
    }
  }

  private peruuta() {
    this.selected = null;
    (this.$refs.modal as any).hide();
  }

  private async vaihdaTila(tila: string) {
    this.selected = tila;
  }

}

</script>

<style lang="scss" src="./tilanvaihto.scss" />
