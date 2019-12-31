<template>
<div>
  <ep-button v-b-modal.tekstikappalelisays variant="link" buttonClass="text-decoration-none">
     <fas class="mr-2" icon="plussa" />
    <span>{{ $t('uusi-tekstikappale') }}</span>
  </ep-button>
  <b-modal ref="tekstikappalelisaysModal" id="tekstikappalelisays" size="lg" :ok-disabled="okDisabled" @hidden="clear" @ok="save">
    <template v-slot:modal-title>
      {{ $t('lisaa-uusi-tekstikappale') }}
    </template>

    <ep-form-content name="tekstikappale-nimi-ohje">
      <ep-field class="mb-5" v-model="otsikko" :is-editing="true" />
    </ep-form-content>

    <ep-form-content name="ylaotsikko">
      <ep-select class="mb-5" v-model="valittuTekstikappale" :items="tekstikappaleet" :is-editing="true">
        <template slot-scope="{ item }">
          <span>{{ item.item.prefix + ' ' + $kaanna(item.item.objref.nimi) }}</span>
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
import { Prop, Component, Vue, Mixins } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpFormContent from'@shared/components/forms/EpFormContent.vue';
import _ from 'lodash';
import { TekstiKappaleViiteKevytDto, LokalisoituTekstiDto, SideMenuEntry } from '@/tyypit';
import { OpetussuunnitelmanSisalto } from '@/api';

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

  @Prop({required: true})
  private tekstikappaleet!: SideMenuEntry[];

  get okDisabled() {
    return _.isEmpty(this.otsikko) || _.isEmpty(this.valittuTekstikappale);
  }

  async save() {
    const newTekstikappale = {
      tekstiKappale: {
        nimi: this.otsikko,
      },
    };

    const uusi = await this.store.addTeksti(newTekstikappale, this.valittuTekstikappale.route.params.osaId);

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
