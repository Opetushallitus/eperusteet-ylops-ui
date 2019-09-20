<template lang="pug">
footer
  .footer-content
    .row
      .col-lg.col-slot
        img(src="../../../public/img/banners/oph_logo.svg", slot="footer-logo")
      .col-md.col-slot
        b {{ $t('opetushallitus') }}
        ep-linkki(:url="$kaanna(linkit.oph)", icon="external-link-alt")
      .col-md.col-slot
        b {{ $t('opintopolku') }}
        ep-linkki(:url="$kaanna(linkit.opintopolku)", icon="external-link-alt")
      .col-md.col-slot
        b {{ $t('eperusteet') }}
        ep-linkki(:url="$kaanna(linkit.eperusteet)", icon="external-link-alt")
      .col-md.col-slot
        a(:href="$kaanna(linkit.seloste)") {{ $t('tietosuojaseloste') }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import EpLinkki from '@/components/EpLinkki.vue';


@Component({
  name: 'EpFooter',
  components: {
    EpLinkki,
  },
})
export default class EpFooter extends Vue {
  get linkit() {
    return {
      oph: {
        fi: 'https://www.oph.fi/fi',
        sv: 'https://www.oph.fi/sv',
      },
      opintopolku: {
        fi: 'https://opintopolku.fi/wp/fi',
        sv: 'https://studieinfo.fi/wp/sv/',
      },
      eperusteet: {
        fi: 'https://eperusteet.opintopolku.fi/#/fi',
        sv: 'https://eperusteet.opintopolku.fi/#/sv',
      },
      seloste: {
        fi: 'https://opintopolku.fi/wp/tietosuojaseloste',
        sv: 'https://studieinfo.fi/wp/dataskyddsbeskrivning/',
      }
    };
  }
}
</script>

<style scoped lang="scss">
footer {
  border-top: 1px solid #ccc;
  padding: 0;
  hyphens: none;

  img {
    width: 200px;
  }

  .footer-content {
    max-width: 90%;
    margin: 0 auto;
    padding: 20px 0;

    .row {
      align-items: center;
      .col-slot {
        padding: 16px;
      }
    }

  }
}

</style>
