<template>
  <div class="imageselector">
    <ep-spinner v-if="isLoading" />
    <div v-else>
      <div v-if="image">
        <img class="esikatselukuva" :src="image.preview" alt="esikatselu">
        <input :placeholder="$t('nimi')" class="form-control" type="text" v-model="nimi">
        <b-button-group class="buttons">
          <b-button variant="primary" @click="upload" :disabled="!nimi">
            {{ $t('lataa-uusi') }}
          </b-button>
          <b-button variant="warning" @click="peruuta">
            {{ $t('peruuta') }}
          </b-button>
        </b-button-group>
      </div>
      <div v-else>
        <div class="imgselect">
          <vue-select
            v-model="selected"
            :filter-by="filterBy"
            :placeholder="$t('valitse-kuva')"
            @input="onSelect"
            :options="options">
            <template #selected-option="option">
              <img class="preview-selected" :src="option.src">
            </template>
            <template #option="option">
              <img class="preview" :src="option.src">
              {{ option.nimi }}
            </template>
          </vue-select>
        </div>
        <div>
          <label role="button" class="btn btn-primary uploadbtn">
            <input style="display: none" ref="imageInput" type="file" @change="onImageInput">
            <fas icon="upload"></fas>
            {{ $t('lisaa-kuva') }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';
import VueSelect from 'vue-select';

import { IAttachmentWrapper } from '@/stores/kuvat';
import { LiiteDto } from '@/tyypit';
import { Api } from '@/api';
import { info } from '@/utils/notifications';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';


@Component({
  components: {
    EpSpinner,
    VueSelect,
  },
})
export default class ImageModal extends Vue {
  @Prop({ required: true })
  private loader!: IAttachmentWrapper;

  @Prop({ required: true })
  private value!: string;

  private isAdding = true;
  private hasImage: any = false;
  private image: any = null;
  private nimi: string = '';
  private isLoading = true;
  private data: LiiteDto[] = [];
  private files: LiiteDto[] = [];
  private selected: any = null;

  async mounted() {
    try {
      this.isLoading = true;
      this.files = await this.loader.hae();
      const it = _.findIndex(this.files, f => f.id === this.value);
      if (it >= 0) {
        this.selected = this.files[it];
      }
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

  private async upload() {
    const formData = new FormData();
    formData.append('file', this.image.file);
    formData.append('nimi', this.nimi);
    formData.append('width', this.image.width);
    formData.append('height', this.image.height);
    try {
      await Api.post(this.loader.endpoint(), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      info('kuva-lisatty');
    }
    catch (err) {
      err('kuva-lisays-epaonnistui');
    }
  }

  private onSelect(liite) {
    this.$emit('input', liite ? liite.id : '');
  }

  private peruuta() {
    this.image = null;
  }

  private onImageInput() {
    const imgi = this.$refs.imageInput;
    const file = (imgi as any).files[0];
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const img = new Image();
      img.onload = () => {
        this.image = {
          file,
          width: img.width,
          height: img.height,
          preview: reader.result,
        };
      };
      img.src = reader.result as any;
    });
    if (file) {
      reader.readAsDataURL(file);
    }
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
