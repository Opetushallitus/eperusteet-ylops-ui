<template lang="pug">
footer
  .footer-content
    .row
      .col.col-slot
        img(src="../../../public/img/banners/oph_logo.png", slot="footer-logo")
      .col.col-slot
        b {{ $t('opetushallitus') }}
        ep-linkki(:url="$kaanna(linkit.oph)")
      .col.col-slot
        b {{ $t('opintopolku') }}
        ep-linkki(:url="$kaanna(linkit.opintopolku)")
      .col.col-slot
        b {{ $t('eperusteet') }}
        ep-linkki(:url="$kaanna(linkit.eperusteet)")
      .col.col-slot
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
        fi: "https://www.oph.fi/fi",
        sv: "https://www.oph.fi/sv",
      },
      opintopolku: {
        fi: "https://opintopolku.fi/wp/fi",
        sv: "https://studieinfo.fi/wp/sv/",
      },
      eperusteet: {
        fi: "https://eperusteet.opintopolku.fi/#/fi",
        sv: "https://eperusteet.opintopolku.fi/#/sv",
      },
      seloste: {
        fi: "https://opintopolku.fi/wp/tietosuojaseloste",
        sv: "https://studieinfo.fi/wp/dataskyddsbeskrivning/",
      }
    };
  }
}
</script>

<style scoped lang="scss">
footer {
  border-top: 1px solid #ccc;
  padding: 20px 0 0 0;

  .footer-content {
    max-width: 90%;
    margin: 0 auto;
    padding: 20px 0;

    .row {
      .col-slot {
        padding: 16px;
      }
    }
  }
}

</style>
