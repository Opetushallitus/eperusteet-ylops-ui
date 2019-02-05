import { Component, Prop, Vue } from 'vue-property-decorator';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { setItem, getItem } from '@/utils/localstorage';
import EpContent from '@/components/EpContent/EpContent.vue';
import * as _ from 'lodash';


// Fake data to be edited

if (!getItem('debugEditointiData')) {
  setItem('debugEditointiData', {
    nimi: {
      fi: '',
    },
    kuvaus: {
      fi: '',
    },
  });
}

async function save(newData: any) {
  setItem('debugEditointiData', newData);
}

async function load() {
  return getItem('debugEditointiData');
}

@Component({
  components: {
    EpEditointi,
    EpContent,
  },
})
export default class EditointiDebug extends Vue {
  private hooks: EditointiKontrolliConfig = {
    source: {
      load,
      save,
    },
  };
}

