<template>
<div>
  <ep-spinner v-if="!isInitialized"></ep-spinner>
  <div class="editointikontrolli" v-else>
    <div v-sticky sticky-z-index="500">
      <div class="ylapaneeli">
        <div class="d-flex align-items-center flex-md-row flex-column justify-content-between align-self-center">
          <div class="d-flex flex-wrap flex-xl-nowrap">
            <div class="headerline">
              <slot name="header"
                    :isEditing="ctrls.isEditing"
                    :data="state.data"
                    :validation="$v && $v.state && $v.state.data"></slot>
            </div>
            <div class="muokattu d-flex flex-wrap align-self-start pb-2" v-if="!ctrls.isEditing && latest">
              <div class="d-flex">
                <slot name="additional-info" :data="state.data"></slot>
                <div class="text-truncate">{{ $t('muokattu') }}: {{ $sdt(latest.pvm) }}, {{ nimi }}</div>
              </div>
            </div>
          </div>
          <div class="d-flex flex-nowrap align-self-start justify-content-end muokkaus-container">
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
            <b-dropdown class="mx-4"
                        v-if="editointiDropDownValinnatVisible"
                        size="md"
                        variant="link"
                        :disabled="state.disabled"
                        toggle-class="text-decoration-none"
                        no-caret="no-caret"
                        right>
              <template slot="button-content">
                <EpMaterialIcon>more_horiz</EpMaterialIcon>
              </template>
              <b-dropdown-item @click="ctrls.remove()"
                                key="poista"
                                :disabled="!hooks.remove || state.disabled">
                <slot name="poista">{{ poistoteksti }}</slot>
              </b-dropdown-item>
            </b-dropdown>
            <slot name="muokkaa-content" :data="state.data">
              <ep-button id="editointi-muokkaus"
                          variant="link"
                          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
                          @click="ctrls.start()"
                          v-if="!ctrls.isEditing && ctrls.isEditable && !versiohistoriaVisible && !ctrls.isCopyable"
                          :show-spinner="state.isSaving"
                          :disabled="state.disabled">
                <EpMaterialIcon class="mr-1" :background="'inherit'" :color="'inherit'">edit</EpMaterialIcon>
                <slot name="muokkaa">{{ $t('muokkaa') }}</slot>
              </ep-button>
            </slot>
            <ep-button id="editointi-kopiointi"
                      variant="link"
                      v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
                      @click="copy()"
                      v-if="!ctrls.isEditing && ctrls.isCopyable"
                      :show-spinner="state.isSaving"
                      :disabled="state.disabled">
              <EpMaterialIcon class="mr-1" :background="'inherit'" :color="'inherit'">edit</EpMaterialIcon>
              <slot name="kopioi-teksti">{{ $t('kopioi-muokattavaksi') }}</slot>
            </ep-button>
            <slot name="more-content">
              <b-dropdown class="mx-4"
                          v-if="katseluDropDownValinnatVisible && !ctrls.isCopyable && ctrls.isEditable"
                          size="md"
                          variant="link"
                          :disabled="state.disabled"
                          toggle-class="text-decoration-none"
                          no-caret="no-caret"
                          right
                          v-oikeustarkastelu="{ oikeus: 'luku' }">
                <template slot="button-content">
                  <EpMaterialIcon>more_horiz</EpMaterialIcon>
                </template>
                <b-dropdown-item :disabled="!hooks.preview || state.disabled">
                  {{ $t('esikatsele-sivua') }}
                </b-dropdown-item>
                <b-dropdown-item :disabled="!hooks.validate || state.disabled">
                  {{ $t('validoi') }}
                </b-dropdown-item>
                <b-dropdown-item :disabled="!hooks.history || state.disabled">
                  <ep-versio-modaali :value="current"
                                      :versions="historia"
                                      :current="current"
                                      :per-page="10"
                                      @restore="ctrls.restore($event)" />
                </b-dropdown-item>
              </b-dropdown>
            </slot>
            <ep-round-button class="ml-2"
                              :disabled="state.disabled"
                              id="editointi-muokkaus-comments"
                              v-if="hasKeskusteluSlot"
                              @click="toggleSidebarState(1)"
                              icon="comment"
                              variant="lightblue fa-flip-horizontal"></ep-round-button>
            <ep-round-button class="ml-2"
                              :disabled="state.disabled"
                              id="editointi-muokkaus-question"
                              v-if="hasOhjeSlot"
                              @click="toggleSidebarState(2)"
                              icon="question_mark"
                              variant="green"></ep-round-button>
            <ep-round-button class="ml-2"
                              :disabled="state.disabled"
                              v-if="hasPerusteSlot"
                              @click="toggleSidebarState(3)"
                              icon="account_balance"
                              variant="pink"></ep-round-button>
          </div>
        </div>
      </div>
      <div class="d-flex align-items-center versiohistoria" v-if="versiohistoriaVisible">
        <div class="headerline">
          <span>{{ $t('muokkaushistoria') }}: {{ $t('versionumero') }} {{ versionumero }}</span>
        </div>
        <div class="flex-fill">
          <b-pagination :value="versionumero"
                        @input="updateVersionumero"
                        :total-rows="versions"
                        :per-page="1"
                        :hide-goto-end-buttons="true"
                        size="sm"
                        class="mb-0">
            <template v-slot:prev-text>
              <EpMaterialIcon>chevron_left</EpMaterialIcon>
            </template>
            <template v-slot:next-text>
              <EpMaterialIcon>chevron_right</EpMaterialIcon>
            </template>
          </b-pagination>
        </div>
        <div class="floating-editing-buttons">
          <ep-button variant="link" icon="menu">
            <ep-versio-modaali :value="current"
                               :versions="historia"
                               :current="current"
                               :per-page="10"
                               @restore="ctrls.restore($event)">
              {{ $t('palaa-listaan') }}
            </ep-versio-modaali>
          </ep-button>
          <ep-button variant="link"
                     icon="keyboard_return"
                     @click="ctrls.restore({ numero: current.numero, routePushLatest: true })">
            {{ $t('palauta-tama-versio') }}
          </ep-button>
          <div class="btn">
            <router-link :to="{ query: {} }">
              <EpMaterialIcon :background="'inherit'" :color="'inherit'">close</EpMaterialIcon>
            </router-link>
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
        <div class="rightbar rb-keskustelu" v-if="hasKeskusteluSlot && this.sidebarState === 1">
          <div class="rbheader"><b>{{ $t('keskustelu') }}</b></div>
          <div class="rbcontent" id="keskustelu-sisalto">
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
import { validationMixin } from 'vuelidate';
import Sticky from 'vue-sticky-directive';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { editointi, EditointiKontrolli, EditointiKontrolliConfig } from '@/stores/editointi';
import { setItem, getItem } from '@/utils/localstorage';
import EpVersioModaali from './EpVersioModaali.vue';
import '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { Kommentit } from '@shared/stores/kommentit';
import EpRoundButton from '@shared/components/EpButton/EpRoundButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  directives: {
    Sticky,
    oikeustarkastelu,
  },
  components: {
    EpButton,
    EpRoundButton,
    EpSpinner,
    EpVersioModaali,
    EpMaterialIcon,
  },
  validations() {
    return {
      state: {
        data: {
          ...(this as any).validator,
        },
      },
    };
  },
} as any)
export default class EpEditointi extends Mixins(validationMixin) {
  @Prop({ required: true })
  private hooks!: EditointiKontrolliConfig;

  @Prop({ default: null })
  private validator!: any | null;

  @Prop({ required: false })
  private type!: string | null;

  /// Tämä on esitettävä versionumero eikä rev.numero
  @Prop({ required: false, type: Number })
  private versionumero!: number | null;

  private sidebarState = 0;

  private ctrls: EditointiKontrolli | null = null;
  private state: any = null;
  private isInitialized = false;

  private updateVersionumero(versionumero) {
    this.$router.push({
      query: {
        versionumero,
      },
    });
  }

  get versions() {
    return this.historia.length - 1; // Ei näytetä nykyistä versiota
  }

  get poistoteksti() {
    if (!this.type) {
      return this.$t('poista');
    }

    return this.$t('poista-' + this.type);
  }

  get editointiDropDownValinnatVisible() {
    return this.ctrls!.isEditing && !this.state.disabled && this.hooks.remove && this.ctrls?.isEditable;
  }

  get katseluDropDownValinnatVisible() {
    return !this.ctrls!.isEditing
      && !this.state.disabled
      && !this.versiohistoriaVisible
      && (this.hooks.preview || this.hooks.validate || this.hooks.history);
  }

  get versiohistoriaVisible() {
    return this.current && this.current !== this.latest;
  }

  get hasKeskusteluSlot() {
    return this.$scopedSlots.keskustelu && !this.ctrls?.isEditing;
  }

  get isEditing() {
    return this.ctrls && this.ctrls.isEditing;
  }

  @Watch('isEditing')
  onChangeEditing(newValue: number, oldValue: number) {
    Kommentit.setActive(!this.isEditing && this.sidebarState === 1);
  }

  @Watch('sidebarState')
  onChange(newValue: number, oldValue: number) {
    Kommentit.setActive(!this.isEditing && this.sidebarState === 1);
  }

  get hasPerusteSlot() {
    return this.$scopedSlots.peruste;
  }

  get hasOhjeSlot() {
    return this.$scopedSlots.ohje;
  }

  get stateData() {
    return this.ctrls?.state?.data;
  }

  private toggleSidebarState(val: number) {
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
    const vuelidate = (this as any).$v as any;
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

  get nimi() {
    if (this.latest?.kayttajanTieto) {
      return parsiEsitysnimi(this.latest?.kayttajanTieto);
    }
    return this.latest?.muokkaajaOid || '';
  }

  get current() {
    if (!_.isEmpty(this.historia)) {
      if (this.versionumero) {
        const current = this.historia[this.historia.length - this.versionumero];
        if (current) {
          return current;
        }
        else {
          // Poistetaan ei olemassa oleva versionumero tilasta
          let query = _.assign({}, this.$route.query);
          delete query.versionumero;
          this.$router.replace({ query });
        }
      }
      else {
        return this.latest;
      }
    }
  }

  get latest() {
    return _.first(this.historia);
  }

  get historia() {
    const revs = this.ctrls!.state!.revisions || [];
    return _.map(revs, (rev, index) => ({
      ...rev,
      index: revs.length - index,
    }));
  }

  async copy() {
    try {
      if (await this.vahvistaKopio()) {
        await this.ctrls!.copy();
      }
    }
    catch (err) {
      this.$fail(this.$t('kopion-luonti-epaonnistui') as string);
    }
  }

  public async vahvistaKopio() {
    const vahvistusSisalto = this.$createElement('div', {},
      [
        this.$createElement('strong', this.$t('tata-toimintoa-ei-voida-perua') as string),
      ],
    ).children;

    return this.$bvModal.msgBoxConfirm((vahvistusSisalto as any), {
      title: this.$t('varmista-kopiointi'),
      okVariant: 'primary',
      okTitle: this.$t('kopioi') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
      ...{} as any,
    });
  }
}

</script>
<style scoped lang="scss">
@import '@shared/styles/_variables';

.icon {
  vertical-align: bottom;
}

.editointikontrolli {
  margin-top: 4px;

  .ylapaneeli {
    background: #fff;
    border-bottom: 1px solid #E7E7E7;
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
      font-size: 0.85rem;
    }

    @media (max-width: 767.98px) {
        .muokkaus-container {
          width:100%;
          border-top: 1px solid #E7E7E7;
        }
    }
  }

  .versiohistoria {
    background-color: #E6F6FF;
    border-bottom: 1px solid #E7E7E7;
    padding: 2px 15px;
    color: #2B2B2B;

    .headerline {
      padding-right: 50px;
    }

    ::v-deep .pagination .page-item {
      &.active {
        .page-link {
          font-weight: 600;
          color: #575757;
        }
      }

      &.disabled {
        .page-link {
          color: #575757;
        }
      }

      & .page-link {
        background-color: transparent;
        border: none;
        color: #3367E3;
        font-weight: 400;
        font-size: 1rem;
      }
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
      min-height: calc(100%);

      .rbheader {
        padding: 20px;
      }

      .rbcontent {
        font-size: 80%;
        min-height: calc(100% - 64px);
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
