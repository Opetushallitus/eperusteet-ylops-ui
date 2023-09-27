<template>
<div>
  <ep-button @click="openModal()" icon="add" :variant="buttonVariant" buttonClass="text-decoration-none">
    <span>{{ $t(addButtonText) }}</span>
  </ep-button>
  <b-modal ref="oppimaaralisaysModal"
           id="oppimaaralisays"
           size="lg"
           centered
           :ok-disabled="okDisabled"
           @hidden="clear"
           @show="show"
           @ok="save"
           static lazy>
    <template v-slot:modal-title>
      {{ $t(addText) }}
    </template>

    <ep-form-content :showHeader="false">
      <h3>{{$kaanna(oppiaine.nimi)}}</h3>
      <ep-select class="mb-5"
                 v-model="valittuOppimaara"
                 :items="oppimaaratTyhjalla"
                 :is-editing="true"
                 :enable-empty-option="false">
        <template slot-scope="{ item }">
          {{ $kaanna(item.nimi) }}
        </template>
      </ep-select>
    </ep-form-content>

    <ep-form-content name="nimi" v-if="valittuOppimaara && (isKieli || valittuOppimaara.tyhjanimi)">
      <ep-field class="mb-5" v-model="nimi" :is-editing="true" :validation="$v.nimi"/>
    </ep-form-content>

    <template v-slot:modal-cancel>
      {{ $t('peruuta')}}
    </template>
    <template v-slot:modal-ok>
      {{ $t(addText)}}
    </template>

  </b-modal>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Mixins, Watch } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import { OppiaineSuppeaDto, Oppiaineet, PerusteOppiaineDto, KopioOppimaaraDto, UnwrappedOpsVuosiluokkakokonaisuusDto, Vuosiluokkakokonaisuudet } from '@shared/api/ylops';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

@Component({
  components: {
    EpButton,
    EpField,
    EpSelect,
    EpFormContent,
  },
  validations: {
    valittuOppimaara: {
      required,
    },
    nimi: {
      [Kielet.getSisaltoKieli.value]: {
        required,
      },
    },
  },
})
export default class EpOppimaaraLisays extends Mixins(EpRoute, EpOpsComponent, validationMixin) {
  @Prop({ required: true })
  private oppiaine!: OppiaineSuppeaDto;

  @Prop({ required: true })
  private resetNavi!: Function;

  @Prop({ required: false, default: 'link' })
  private buttonVariant!: string;

  private perusteenOppiaine: PerusteOppiaineDto | null = null;
  private vuosiluokkakokonaisuus: UnwrappedOpsVuosiluokkakokonaisuusDto | null = null;

  private nimi: object | null = null;
  private valittuOppimaara: OppiaineSuppeaDto | null = null;

  get addText() {
    return this.isUskonto ? 'lisaa-muu-uskonto' : 'lisaa-kielitarjonta';
  }

  get addButtonText() {
    return this.isUskonto ? 'lisaa-uskonnon-oppimaara' : 'lisaa-kielitarjonta';
  }

  get okDisabled() {
    return this.$v.$invalid;
  }

  get isUskonto() {
    return this.oppiaine.koodiArvo === 'KT';
  }

  get isKieli() {
    return _.includes(['VK', 'TK'], this.oppiaine.koodiArvo);
  }

  openModal() {
    (this.$refs['oppimaaralisaysModal'] as any).show();
  }

  @Watch('valittuOppimaara')
  valittuOppimaaraChange(val) {
    if (val) {
      if (val.tyhjanimi) {
        this.nimi = {};
      }
      else {
        this.nimi = val.nimi;
      }
    }
  }

  get muuUskontoNimi() {
    let nimi = {};
    Object.assign(nimi, ..._.map(UiKielet, kieli => {
      return {
        [kieli]: this.$t('muu-uskonto'),
      };
    }));
    return nimi;
  }

  get oppimaarat() {
    if (this.perusteenOppiaine) {
      return _.chain(this.perusteenOppiaine.oppimaarat)
        .filter(oppimaara => _.includes(_.map(oppimaara?.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'), _.get(this.vuosiluokkakokonaisuus, '_tunniste')))
        .sortBy('koodiUri')
        .value();
    }
  }

  get oppimaaratTyhjalla() {
    if (this.perusteenOppiaine) {
      if (this.isUskonto) {
        return [
          {
            nimi: this.muuUskontoNimi,
            tyhjanimi: true,

          },
          ...this.oppimaarat as PerusteOppiaineDto[],
        ];
      }
      else {
        return this.oppimaarat;
      }
    }
  }

  async show() {
    this.perusteenOppiaine = (await Oppiaineet.getPerusteSisalto(this.opsId, (this.oppiaine.id as number))).data;
    this.vuosiluokkakokonaisuus = (await Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuus(this.opsId, _.toNumber(this.$route.params.vlkId))).data;
  }

  async save() {
    const kopio = {
      omaNimi: this.nimi as { [key: string]: string; },
      tunniste: this.valittuOppimaara?.tunniste,
    } as KopioOppimaaraDto;

    try {
      const uusi = (await Oppiaineet.addOppimaara((this.ops.id as number), (this.oppiaine.id as number), kopio)).data;

      await this.resetNavi();

      this.$router.push({
        name: 'perusopetusoppiaine',
        params: {
          ...this.$route.params,
          oppiaineId: '' + uusi.id,
        },
      });
    }
    catch (err) {
      this.$fail(this.$t('tallennus-epaonnistui') as string);
      this.$fail(err.response.data.syy);
    }
  }

  clear() {
    this.valittuOppimaara = null;
  }
}

</script>

<style scoped lang="scss">

  ::v-deep .ep-button {

    .teksti {
      padding-left: 0px !important;
    }
  }

</style>
