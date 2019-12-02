<template>
<div>
  <ep-spinner v-if="!isInitialized"></ep-spinner>
  <div class="editointikontrolli" v-else>
    <div class="ylapaneeli" v-sticky sticky-offset="{ top: 50 }" sticky-z-index="500">
      <div class="d-flex align-items-center">
        <div class="p2 flex-fill headerline">
          <slot name="header"
                :isEditing="ctrls.isEditing"
                :data="state.data"
                :validation="$v && $v.state && $v.state.data"></slot>
        </div>
        <div class="p2" v-if="!ctrls.isEditing">
          <div class="muokattu" v-if="latest">
            {{ $t('muokattu') }}: {{ $sdt(latest.pvm) }}, {{ latest.muokkaajaOid }}
          </div>
        </div>
        <div class="p2">
          <div class="floating-editing-buttons">
            <ep-button class="ml-4"
                       v-if="ctrls.isEditing"
                       @click="ctrls.cancel()"
                       :disabled="state.disabled"
                       variant="link">
              <slot name="peruuta">{{ $t('peruuta') }}</slot>
            </ep-button>
            <ep-button class="ml-4"
                       @click="ctrls.save()"
                       v-if="ctrls.isEditing"
                       :disabled="state.disabled || ($v && $v.state && $v.state.data.$invalid)"
                       variant="primary"
                       :show-spinner="state.isSaving"
                       :help="saveHelpText">
              <slot name="tallenna">{{ $t('tallenna') }}</slot>
            </ep-button>
            <b-dropdown class="ml-4 mr-4"
                        v-if="dropDownValinnatVisible"
                        size="md"
                        variant="link"
                        :disabled="state.disabled"
                        toggle-class="text-decoration-none"
                        no-caret="no-caret"

                        right>
              <template slot="button-content"><fas icon="ellipsis-h"></fas></template>
              <b-dropdown-item @click="ctrls.remove()"
                               key="poista"
                               :disabled="!hooks.remove || state.disabled">
                <slot name="poista">{{ poistoteksti }}</slot>
              </b-dropdown-item>
            </b-dropdown>
            <ep-button id="editointi-muokkaus"
                       v-tutorial
                       variant="link"
                       v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
                       @click="ctrls.start()"
                       v-if="!ctrls.isEditing && ctrls.isEditable"
                       icon="pen"
                       :show-spinner="state.isSaving"
                       :disabled="state.disabled">
              <slot name="muokkaa">{{ $t('muokkaa') }}</slot>
            </ep-button>
            <!-- TODO: replace with chat icon-->
            <ep-round-button class="ml-2"
                             :disabled="state.disabled"
                             v-if="hasKeskusteluSlot"
                             @click="toggleSidebarState(1)"
                             icon="ukk"
                             variant="lightblue"></ep-round-button>
            <ep-round-button class="ml-2"
                             :disabled="state.disabled"
                             id="editointi-muokkaus-question"
                             v-tutorial
                             v-if="hasOhjeSlot"
                             @click="toggleSidebarState(2)"
                             icon="question"
                             variant="green"></ep-round-button>
            <ep-round-button class="ml-2"
                             :disabled="state.disabled"
                             v-if="hasPerusteSlot"
                             @click="toggleSidebarState(3)"
                             icon="valtakunnalliset-perusteet"
                             variant="pink"></ep-round-button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="state.data">
      <div class="threads">
        <div class="actual-content">
          <div class="sisalto">
            <slot :isEditing="ctrls.isEditing" :data="state.data" :validation="$v.state.data"></slot>
          </div>
        </div>
        <div class="rightbar rb-keskustelu" v-if="hasKeskusteluSlot && sidebarState === 1">
          <div class="rbheader"><b>{{ $t('keskustelu') }}</b></div>
          <div class="rbcontent">
            <slot name="keskustelu" :isEditing="ctrls.isEditing" :data="state.data" :validation="$v.state.data"></slot>
          </div>
        </div>
        <div class="rightbar rb-ohje" v-if="hasOhjeSlot && sidebarState === 2">
          <div class="rbheader"><b>{{ $t('ohje') }}</b></div>
          <div class="rbcontent">
            <slot name="ohje" :isEditing="ctrls.isEditing" :validation="$v.state.data" :data="state.data"></slot>
          </div>
        </div>
        <div class="rightbar rb-peruste" v-if="hasPerusteSlot && sidebarState === 3">
          <div class="rbheader"><b>{{ $t('perusteen-teksti') }}</b></div>
          <div class="rbcontent">
            <slot name="peruste" :isEditing="ctrls.isEditing" :validation="$v.state.data" :data="state.data"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script lang="ts">
import _ from 'lodash';
import { Watch, Component, Mixins, Prop } from 'vue-property-decorator';
import {
  editointi,
  EditointiKontrolli,
  EditointiKontrolliConfig,
} from '@/stores/editointi';
import EpVersioModaali from './EpVersioModaali.vue';
import '@shared/stores/kieli';
import { validationMixin } from 'vuelidate';
import Sticky from 'vue-sticky-directive';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpRoundButton from '@/components/EpButton/EpRoundButton.vue';
import { setItem, getItem } from '@/utils/localstorage';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';

@Component({
  validations() {
    return {
      state: {
        data: {
          ...(this as any).validator,
        },
      },
    };
  },
  directives: {
    oikeustarkastelu,
    Sticky,
  },
  components: {
    EpButton,
    EpRoundButton,
    EpSpinner,
    EpVersioModaali,
  },
} as any)
export default class EpEditointi extends Mixins(validationMixin) {
  @Prop({ required: true })
  private hooks!: EditointiKontrolliConfig;

  @Prop({ default: null })
  private validator!: any | null;

  @Prop({ required: false })
  private type!: string | null;

  private sidebarState = 0;

  private ctrls: EditointiKontrolli | null = null;
  private state: any = null;
  private isInitialized = false;

  get poistoteksti() {
    if(!this.type) {
      return this.$t('poista');
    }

    return this.$t('poista-'+this.type);
  }

  get dropDownValinnatVisible() {
    return this.ctrls!.isEditing && !(!this.hooks.remove || this.state.disabled);
  }

  get hasKeskusteluSlot() {
    return this.$scopedSlots.keskustelu;
  }

  get hasPerusteSlot() {
    return this.$scopedSlots.peruste;
  }

  get hasOhjeSlot() {
    return this.$scopedSlots.ohje;
  }

  toggleSidebarState(val: number) {
    if (val === this.sidebarState) {
      this.sidebarState = 0;
    }
    else {
      this.sidebarState = val;
    }
    setItem('ep-editointi-sidebar-state', {
      value: this.sidebarState,
    });
  }

  get saveHelpText() {
    const vuelidate = this.$v as any;
    if (this.state.disabled) {
      return 'tallenna-kaynnissa';
    }
    else if (this.state.disabled) {
      return 'tallenna-tila-virhe-ohje';
    }
    else if (vuelidate.state.data.$invalid) {
      return 'tallenna-validointi-virhe-ohje';
    }
    else {
      return '';
    }
  }

  @Watch('state.data')
  private changed(newValue: any, oldValue: any) {
    this.$emit('input', newValue);
  }

  public async mounted() {
    this.ctrls = editointi({ ...this.hooks });
    await this.ctrls.init();
    this.state = this.ctrls.state;
    this.isInitialized = true;

    const sidebarState = await getItem('ep-editointi-sidebar-state') as any;
    if (sidebarState) {
      this.sidebarState = sidebarState!.value;
    }
  }

  get current() {
    return _.first(this.historia);
  }

  get latest() {
    return _.first(this.historia);
  }

  get historia() {
    const revs = this.ctrls!.state!.revisions || [];
    return _.map(this.ctrls!.state!.revisions, (rev, index) => ({
      ...rev,
      index: revs.length - index,
    }));
  }
}

</script>
<style scoped lang="scss">
@import '../../styles/variables';

.floating-editing-buttons {
  // background: rgba(30, 73, 207, 0.8);
  // bottom: 0px;
  // left: 0px;
  // padding: 10px;
  // position: fixed;
  // width: 100%;
  // z-index: 1000;
}

.editointikontrolli {
  margin-top: 4px;

  .ylapaneeli {
    background: #fff;
    border-bottom: 1px solid #eee;
    padding: 5px 15px 5px 15px;

    .headerline {
      padding-right: 50px;
    }

    .upper-buttons {
      min-width: 240px;
    }

    .muokattu, .muokkaaja {
      color: #555;
      margin-right: 20px;
    }
  }

  .sisalto {
    margin-bottom: 5px;
    padding: 15px;
  }

  .alapaneeli {

    .lower-buttons {
    }
  }

  .threads {
    height: 100%;
    display: flex;

    .rightbar {
      border-left: 1px solid #eee;
      min-width: 460px;
      max-width: 460px;
      min-height: 100vh;
      height: 100%;

      .rbheader {
        padding: 20px;
      }

      .rbcontent {
        min-height: 100vh;
        height: 100%;
        font-size: 80%;
      }
    }

    .rb-ohje {
      .rbheader { background: #fcddf9; }
      .rbcontent { background: #fbf1fa; }
    }

    .rb-keskustelu {
      .rbheader { background: #ccd9f8; }
      .rbcontent { background: #f2f5fd; }
    }

    .rb-peruste {
      .rbheader { background: #d4ebdc; }
      .rbcontent { background: #f4faf6; }
    }

    .actual-content {
      width: 100%;
    }
  }
}
</style>
