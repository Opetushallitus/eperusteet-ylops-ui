<template>
  <div>
    <div v-if="perityvatPohjatCount > 0">
      <div v-for="(pohja, idx) in ops.periytyvatPohjat" :key="'per' + (idx + 1)" class="d-flex">
        <EpMaterialIcon v-if="idx > 0"
                        size="22px"
                        :color="'#555'"
                        :style="{ marginLeft: ((idx - 1) * 25) + 'px' }">
          subdirectory_arrow_right
        </EpMaterialIcon>
        <router-link v-if="pohja.id"
                     :to="{ name:'opsTiedot', params: { id: pohja.id } }"
                     target="_blank"
                     rel="noopener noreferrer">
          <span>{{ $kaanna(pohja.nimi) }}</span>
        </router-link>
        <span v-else>{{ $kaanna(pohja.nimi) }}</span>
      </div>
    </div>
    <div>
      <EpMaterialIcon v-if="perityvatPohjatCount > 0"
                      class="mr-1"
                      size="22px"
                      :color="'#555'"
                      :style="{ marginLeft: ((perityvatPohjatCount - 1) * 25) + 'px' }">
        subdirectory_arrow_right
      </EpMaterialIcon>
      <span class="current-ops">{{ $kaanna(ops.nimi) }}</span>
    </div>
    <div v-if="ops.joissaPohjana && ops.joissaPohjana.length > 0" class="d-flex">
      <EpMaterialIcon class="mr-1"
                      size="22px"
                      :color="'#555'"
                      :style="{ marginLeft: (perityvatPohjatCount * 25) + 'px' }">
        subdirectory_arrow_right
      </EpMaterialIcon>
      <div>
        <div v-for="(pohjana, idx2) in ops.joissaPohjana" :key="'joi' + (idx2 + 1)">
          <div v-if="idx2 < 3 || showKaikkiJoissaPohjana">
            <router-link v-if="pohjana.id"
                         :to="{ name:'opsTiedot', params: { id: pohjana.id } }"
                         target="_blank"
                         rel="noopener noreferrer">
              <span>{{ $kaanna(pohjana.nimi) }}</span>
            </router-link>
            <span v-else>{{ $kaanna(pohjana.nimi) }}</span>
          </div>
        </div>
        <div v-if="ops.joissaPohjana.length > 3"
             @click="toggleOpsitJoissaPohjana()"
             class="nayta-btn">
          <span v-html="showKaikkiJoissaPohjana ? $t('nayta-vahemman') : $t('nayta-kaikki')"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpMaterialIcon,
  },
})
export default class OpsPohjat extends Vue {
  @Prop({ required: true })
  private ops!: any;

  private showKaikkiJoissaPohjana: boolean = false;

  get perityvatPohjatCount() {
    return this.ops.periytyvatPohjat?.length || 0;
  }

  toggleOpsitJoissaPohjana() {
    this.showKaikkiJoissaPohjana = !this.showKaikkiJoissaPohjana;
  }
}
</script>

<style scoped lang="scss">

.current-ops {
  font-weight: 600;
}

.nayta-btn {
  margin-top: 5px;
  color: #3367E3;
  font-weight: 600;
  cursor: pointer;
}
</style>
