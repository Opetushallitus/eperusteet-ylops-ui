<template>
  <div
    id="scroll-anchor"
    class="content"
  >
    <div v-if="editointiStore">
      <ep-editointi :store="editointiStore">
        <template #header>
          <h2 class="otsikko">
            {{ $t('muokkaa-jarjestysta') }}
          </h2>
        </template>

        <template #default="{ isEditing, data, supportData }">
          <b-tabs v-model="tabIndex">
            <b-tab :title="$t('tekstikappaleet')">
              <div class="tree">
                <ep-jarjesta
                  v-model="data.tekstikappaleet.lapset"
                  :is-editable="isEditing"
                  child-field="lapset"
                  root-group="sisalto"
                  group="sisalto"
                  :allow-move="allowTekstikappaleMove"
                  :sortable="true"
                  :draggable-class="'root'"
                >
                  <template #default="{ node }">
                    <span v-if="isEditing">
                      {{ $kaanna(node.tekstiKappale.nimi) }}
                    </span>
                    <router-link
                      v-else
                      :to="{ name: 'tekstikappale', params: { osaId: node.id } }"
                    >
                      {{ $kaanna(node.tekstiKappale.nimi) }}
                    </router-link>
                    <EpMaterialIcon
                      v-if="node.liite"
                      v-b-popover="{content: $t('tekstikappale-naytetaan-liitteena'), trigger: 'hover'}"
                      size="20px"
                    >
                      attach_file
                    </EpMaterialIcon>
                    <EpMaterialIcon
                      v-if="node.piilotettu"
                      v-b-popover="{content: $t('tekstikappale-on-piilotettu'), trigger: 'hover'}"
                      size="20px"
                    >
                      visibility_off
                    </EpMaterialIcon>
                  </template>
                </ep-jarjesta>
              </div>
            </b-tab>

            <b-tab
              v-if="data.oppiaineet.length > 0"
              :title="supportData.isLops2019 ? $t('oppiaineet-ja-opintojaksot') : $t('oppiaineet')"
            >
              <div class="tree">
                <ep-jarjesta
                  v-model="data.oppiaineet"
                  :is-editable="isEditing"
                  child-field="lapset"
                  group="oppiaineet"
                  :unique-child-groups="true"
                >
                  <template #default="{ node }">
                    <span>
                      {{ $kaanna(node.nimi) }} <span v-if="node.koodi">({{ node.koodi }})</span>
                    </span>
                  </template>
                </ep-jarjesta>
              </div>
            </b-tab>
          </b-tabs>
        </template>
      </ep-editointi>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { JarjestysStore } from '@/stores/jarjestysStore';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const store = computed(() => props.opetussuunnitelmaStore);
const ops = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);
const route = useRoute();

const tabIndex = ref(0);
const editointiStore = ref<EditointiStore | null>(null);

const versionumero = computed(() => {
  return _.parseInt(route.query.versionumero as string);
});

onMounted(async () => {
  editointiStore.value = new EditointiStore(new JarjestysStore(
    opsId.value,
    versionumero.value,
    store.value,
    ops.value,
  ));
});

const allowTekstikappaleMove = (event: any) => {
  if (event.draggedContext.element.perusteTekstikappaleId) {
    if (event.from.classList.contains('root') && event.to.classList.contains('root')) {
      return true;
    }

    if (!event.from.classList.contains('root') && !event.to.classList.contains('root')) {
      return true;
    }
  }

  if (!event.draggedContext.element.perusteTekstikappaleId) {
    return true;
  }

  return false;
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.otsikko {
  margin-bottom: 0;
}

.tree {
  margin: 20px;
  .item {
    background: $blue-lighten-4;
    margin: 5px;
    padding: 10px;
    border: 1px dashed $blue-lighten-3;
    cursor: pointer;

    .icon {
      color: $blue-lighten-3;
    }

    .text {
      user-select: none;
      color: $blue-lighten-1;
    }
  }
}
</style>
