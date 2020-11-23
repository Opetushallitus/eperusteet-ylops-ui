<template>
  <div class="imageselector">
    <ep-spinner v-if="isLoading" />
    <div v-else>
      <div>
        <div class="imgselect" v-if="!imageData">
          <div class="mb-4">{{$t('kuvalisays-modal-selite')}}</div>
          <ep-form-content name="valitse-kuva">
            <vue-select
              :disabled="options.length === 0"
              v-model="selected"
              :filter-by="filterBy"
              :placeholder="options.length > 0 ? $t('valitse') : $t('ei-lisattyja-kuvia')"
              :options="options"
              label="id"
              :clearable="true">
              <template #selected-option="option">
                <img class="preview-selected" :src="option.src">
              </template>
              <template #option="option">
                <img class="preview" :src="option.src">
                {{ option.nimi }}
              </template>
            </vue-select>
          </ep-form-content>
        </div>

        <div v-if="!selected || imageData">
          <ep-kuva-lataus v-model="imageData" :saved="imageSaved" @saveImage="saveImage" @cancel="peruuta"></ep-kuva-lataus>
        </div>

        <div v-if="selected || imageData">
          <ep-form-content name="kuvateksti" class="mt-3">
            <ep-field v-model="kuvateksti" @input="onKuvatekstichange" :is-editing="true" :validation="$v.kuvateksti"/>
          </ep-form-content>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import VueSelect from 'vue-select';
import { IAttachmentWrapper } from '@/stores/kuvat';
import { LiiteDto, Api, DokumenttiDto } from '@shared/api/ylops';

import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { Kielet } from '@shared/stores/kieli';
import EpKuvaLataus, { ImageData } from '@shared/components/EpKuvaLataus/EpKuvaLataus.vue';

@Component({
  components: {
    EpSpinner,
    VueSelect,
    EpFormContent,
    EpField,
    EpKuvaLataus,
  },
  validations: {
    kuvateksti: {
      [Kielet.getSisaltoKieli.value]: {
        required,
      },
    },
  },
} as any)
export default class ImageModal extends Mixins(validationMixin) {
  @Prop({ required: true })
  private loader!: IAttachmentWrapper;

  @Prop({ required: true })
  private value!: {value?: string};

  @Prop({ required: true })
  private kuvatekstiProp!: {};

  private imageSaved: boolean = false;
  private imageData: ImageData | null = null;
  private isLoading = true;
  private files: LiiteDto[] = [];
  private kuvateksti: any = {};

  async mounted() {
    this.kuvateksti = {
      [Kielet.getSisaltoKieli.value]: this.kuvatekstiProp,
    };

    try {
      this.isLoading = true;
      this.files = await this.loader.hae();
    }
    catch (er) {
      throw er;
    }
    finally {
      this.isLoading = false;
    }
  }

  get id() {
    return (this as any)._uid;
  }

  get options() {
    return this.files;
  }

  private filterBy(option, label, search) {
    return (option.nimi || '')
      .toLowerCase()
      .indexOf(search.toLowerCase()) > -1;
  }

  private async saveImage() {
    if (this.imageData) {
      const formData = new FormData();
      formData.append('file', this.imageData.file);
      formData.append('nimi', this.imageData.file.name);
      formData.append('width', _.toString(this.imageData.width));
      formData.append('height', _.toString(this.imageData.height));
      try {
        const tallenettuId = await Api.post(this.loader.endpoint(), formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        this.imageSaved = true;
        this.files = await this.loader.hae();
        this.selected = { id: tallenettuId.data };

        (this as any).$success('kuva-tallennettu-onnistuneesti');
      }
      catch (err) {
        (this as any).$fail('kuva-lisays-epaonnistui');
      }
    }
  }

  set selected(liite: any) {
    if (liite) {
      this.$emit('input', liite.id);
      this.$v.$touch();
    }
    else {
      this.$emit('input', null);
    }
  }

  get selected() {
    const it = _.findIndex(this.files, f => f.id === this.value.value);
    if (it >= 0) {
      return this.files[it];
    }
  }

  private onKuvatekstichange(kuvateksti) {
    this.$emit('onKuvatekstichange', kuvateksti[Kielet.getSisaltoKieli.value]);
  }

  private peruuta() {
    this.imageData = null;
    this.selected = null;
    this.imageSaved = false;
  }
}

</script>

<style scoped lang="scss">
.imageselector {
  .imgselect {
    margin-bottom: 12px;
  }

  label.uploadbtn {
    width: 100%;
  }

  img.preview-selected {
    width: 100%;
  }

  img.preview {
    width: 40%;
  }

  img.esikatselukuva {
    width: 100%;
    margin-bottom: 10px;
    border: 3px solid #eee;
  }

  input {
    margin-bottom: 10px;
  }

  .buttons {
    width: 100%;
  }

  /deep/ #fileInput {
    display: none;
  }
}
</style>
