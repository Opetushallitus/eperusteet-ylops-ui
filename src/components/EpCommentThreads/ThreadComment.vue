<template>
  <div class="kommentti p-3">
    <div class="topbar d-flex align-items-center justify-content-between">
      <div class="pvm">{{ $ago(innerValue.luotu || new Date()) }}</div>
      <div class="actions" v-if="innerValue.tunniste">
        <b-dropdown variant="link" right no-caret>
          <template v-slot:button-content>
            <fas slot="button-content" icon="ellipsis-h" />
          </template>
          <b-dropdown-item @click="muokkaa">
            {{ $t('muokkaa') }}
          </b-dropdown-item>
          <b-dropdown-item @click="poista">
            {{ $t('poista') }}
          </b-dropdown-item>
          <!-- <b-dropdown-item @click="reply(innerValue.tunniste)"> -->
          <!--   {{ $t('vastaa') }}                                  -->
          <!-- </b-dropdown-item>                                    -->
        </b-dropdown>
      </div>
    </div>
    <div class="nimi">{{ nimi }}</div>
    <div class="viesti mt-1">
      <div v-if="editable">
        <textarea
          :placeholder="$t('kirjoita-viesti')"
          class="editori"
          v-model="innerValue.sisalto"></textarea>
      </div>
      <div v-else>
        {{ innerValue.sisalto }}
      </div>
    </div>
    <div class="toiminnot" v-if="editable">
      <div class="d-flex flex-row-reverse">
        <b-button
          @click="tallenna"
          variant="primary">{{ $t('tallenna') }}</b-button>
        <b-button
          @click="peruuta"
          variant="default">{{ $t('peruuta') }}</b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Watch, Component, Prop, Vue } from 'vue-property-decorator';
import { KommenttiDto, KayttajanTietoDto } from '@shared/api/ylops';

@Component({
  name: 'ThreadComment',
})
export default class ThreadComment extends Vue {
  @Prop({ required: true })
  value!: KommenttiDto;

  // @Prop({ required: true, type: Function })
  // private reply!: (uusi: KommenttiDto) => Promise<void>;

  @Prop({ required: true, type: Function })
  private save!: (uusi: KommenttiDto) => Promise<KommenttiDto>;

  @Prop({ required: true, type: Function })
  private remove!: (uusi: KommenttiDto) => Promise<KommenttiDto>;

  isEditing: boolean = false;

  private innerValue: KommenttiDto | null = null;

  @Watch('value', { immediate: true })
  updateValue(val) {
    this.innerValue = { ...this.value };
  }

  get nimi() {
    return this.innerValue?.nimi || this.innerValue?.muokkaaja || this.$t('tuntematon-kayttaja');
  }

  get editable() {
    return this.isEditing || !this.value.tunniste;
  }

  get isNew() {
    return !!this.value.luoja;
  }

  async poista() {
    await this.remove(this.value);
  }

  async muokkaa() {
    this.isEditing = true;
  }

  async peruuta() {
    this.isEditing = false;
    if (!this.value.tunniste) {
      await this.poista();
    }
    else {
      this.updateValue(this.value);
    }
  }

  async tallenna() {
    if (!this.innerValue) {
      return;
    }
    await this.save({
      ...this.value,
      sisalto: this.innerValue.sisalto,
    });
    this.isEditing = false;
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.kommentti {
  background: #fff;
  height: 100%;
  box-shadow: 0 2px 4px 0 rgba(207, 207, 207, 0.5);
  border: 1px solid #eee;
  // border-radius: 10px;

  .topbar {
    height: 10px;

    .pvm {
      color: #555;
    }

    .actions {
      color: #28344F;
    }
  }

  .nimi {
    color: #28344F;
    font-weight: 600;
    font-size: 1.2em;
  }

  .viesti {
    color: #575757;

    textarea.editori {
      border: 1px solid #ccc;
      min-height: 4em;
      overflow: auto;
      resize: vertical;
      width: 100%;
    }

  }
}

.subthreads {
  margin-left: 20px;
}

</style>
