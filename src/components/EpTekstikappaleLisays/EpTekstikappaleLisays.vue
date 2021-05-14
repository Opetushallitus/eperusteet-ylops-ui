<template>
<div>
  <ep-button v-b-modal.tekstikappalelisays variant="link" buttonClass="text-decoration-none" :paddingx="false">
     <fas class="mr-2" icon="plussa" />
    <span>{{ $t('uusi-tekstikappale') }}</span>
  </ep-button>
  <b-modal ref="tekstikappalelisaysModal"
           id="tekstikappalelisays"
           size="lg"
           centered
           :ok-disabled="okDisabled"
           @hidden="clear"
           @ok="save">
    <template v-slot:modal-title>
      {{ $t('lisaa-uusi-tekstikappale') }}
    </template>

    <ep-form-content name="tekstikappale-nimi-ohje">
      <ep-field class="mb-5" v-model="otsikko" :is-editing="true" />
    </ep-form-content>

    <ep-form-content name="ylaotsikko" v-if="tekstikappaleet.length > 0">
      <ep-select class="mb-5"
                 v-model="valittuTekstikappale"
                 :items="tekstikappaleet"
                 :is-editing="true"
                 :enable-empty-option="tyhjaValinta">
        <template slot-scope="{ item }">
          {{ item.item.prefix + ' ' + $kaanna(item.item.objref.nimi) }}
        </template>
      </ep-select>
    </ep-form-content>

    <template v-slot:modal-cancel>
      {{ $t('peruuta')}}
    </template>
    <template v-slot:modal-ok>
      {{ $t('lisaa-tekstikappale')}}
    </template>

  </b-modal>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Mixins } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import { Puu } from '@shared/api/ylops';
import { LokalisoituTekstiDto, SideMenuEntry } from '@shared/tyypit';

@Component({
  components: {
    EpButton,
    EpField,
    EpSelect,
    EpFormContent,
  },
})
export default class EpTekstikappaleLisays extends Mixins(EpRoute, EpOpsComponent) {
  private otsikko: LokalisoituTekstiDto = {};
  private valittuTekstikappale: any = {};

  @Prop({ required: true })
  private tekstikappaleet!: SideMenuEntry[];

  @Prop({ required: false, type: Boolean, default: false })
  private tyhjaValinta!: boolean;

  get okDisabled() {
    return _.isEmpty(this.otsikko);
  }

  async save() {
    const newTekstikappale = {
      tekstiKappale: {
        nimi: this.otsikko,
      },
    };

    const uusi = await this.store.addTeksti(newTekstikappale as Puu, this.valittuTekstikappale?.route?.params?.osaId);

    this.$router.push({
      name: 'tekstikappale',
      params: {
        ...this.$route.params,
        osaId: '' + uusi.id,
      },
    });
  }

  clear() {
    this.otsikko = {};
    this.valittuTekstikappale = {};
  }
}

</script>

<style scoped lang="scss">

</style>
