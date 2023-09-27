<template>
<div v-if="mahdollisetTilat">
  <ep-button v-b-modal.tilanvaihtomodal
             id="opetussuunnitelma-tilanvaihto"
             v-tutorial>{{ $t('vaihda-tilaa') }}</ep-button>
  <b-modal ref="modal" id="tilanvaihtomodal" size="lg" title="testi">
    <template slot="modal-title">{{ $t('vaihda-tilaa') }}</template>
    <template slot="modal-footer">
      <ep-button @click="tallenna()" :disabled="!selected" :show-spinner="isUpdating">{{ $t('ok') }}</ep-button>
      <ep-button @click="peruuta()" :disabled="isUpdating">{{ $t('peruuta') }}</ep-button>
    </template>
    <div class="tilat">
      <button v-for="(tila, idx) in mahdollisetTilat"
              :key="idx"
              @click="vaihdaTila(tila)"
              @dblclick="vaihdaTila(tila) && tallenna()"
              class="btn"
              type="button"
              tabindex="0">
        <div class="tila" :class="{ 'tila-selected': selected === tila }">
          <div class="ikoni" :class="'ikoni-' + tila">
            <div class="kuvake">
              <EpMaterialIcon v-if="tila === 'julkaistu'">verified</EpMaterialIcon>
              <EpMaterialIcon v-if="tila === 'poistettu'">archive</EpMaterialIcon>
              <EpMaterialIcon v-else-if="tila === 'valmis'">check</EpMaterialIcon>
              <EpMaterialIcon v-else>edit</EpMaterialIcon>
            </div>
            <div class="nimi">{{ $t('tilanimi-' + tila) }}</div>
          </div>
          <div class="tiedot">{{ $t('tilakuvaus-' + tila) }}</div>
        </div>
      </button>
    </div>
  </b-modal>
</div>
<div v-else>
  <ep-spinner />
</div>
</template>

<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { sallittuSiirtyma } from '@/utils/tilat';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpInput,
    EpSpinner,
    EpButton,
    EpMaterialIcon,
  },
})
export default class Tilanvaihto extends Vue {
  @Prop({ required: true })
  private onSave!: (tila: string) => Promise<boolean>;

  @Prop({ required: true })
  private value!: string;

  @Prop({ required: false })
  private isPohja!: boolean;

  private isUpdating: boolean = false;
  private selected: string | null = null;

  get mahdollisetTilat() {
    return sallittuSiirtyma(this.value, this.isPohja);
  }

  private async tallenna() {
    this.isUpdating = true;
    try {
      if (this.selected && await this.onSave(this.selected)) {
        // this.$emit('input', tila);
        const modal = (this.$refs.modal as any);
        if (modal) {
          (this.$refs.modal as any).hide();
        }
      }
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

<style scoped lang="scss">
.tilat {
  button {
    width: 100%;
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }

  .tila-selected {
    background: #e2e8ff;
  }

  .tila {
    min-width: 100%;
    display: flex;
    padding: 5px;

    &:hover {
      background: #edf3ff;
    }

    .ikoni {
      width: 120px;
      height: 80px;
      text-align: center;
      color: #fff;
      font-weight: bold;
      padding: 8px;
      margin: 2px;

      .kuvake {
        font-size: 26px;
      }

      .nimi {
      }
    }

    .ikoni-valmis { background: #008000; }
    .ikoni-luonnos { background: #FBB03B; }
    .ikoni-poistettu { background: #c44; }
    .ikoni-julkaistu { background: #008000; }

    .tiedot {
      width: 100%;
      padding: 5px 0 0 5px;
      text-align: left;
      font-size: 80%;
    }

  }
}
</style>
