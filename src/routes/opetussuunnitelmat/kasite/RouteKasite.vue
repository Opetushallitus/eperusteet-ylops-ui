<template lang="pug">
.kasitteet
  .ylapaneeli
    div.otsikko {{ $t('kasitteet') }}

  ep-spinner(v-if="isLoading")
  div.sisalto(v-else)
    .otsikko-toiminnot
      ep-search(v-model="hakusana")
      .lisaysnappi
        button(@click="avaaLuontiModal")
          fas.mr-2(icon="plus-circle")
          span {{ $t('lisaa-kasite') }}

    .kasitelista
      .kasite(v-for="k in suodatettuTermisto")
        ep-content.termi(:value="k.kasite.termi")
        ep-content.selitys(:class="{ closed: k.closed, open: !k.closed }", :value="k.kasite.selitys")
        .toiminnot
          button.btn.btn-link(@click="k.closed = !k.closed")
            fas(icon="chevron-down", v-if="k.closed")
            fas(icon="chevron-up", v-else)
          button.btn.btn-link(@click="avaaMuokkausModal(k.kasite)")
            fas(icon="pen")
          button.btn.btn-link(@click="poistaKasite(k.kasite)")
            fas(icon="times")

  // Käsitteen luomisen ja muokkaamisen modaali
  b-modal.backdrop(
    id="terminLuontiModal",
    ref="terminLuontiModal",
    @ok="tallennaKasite",
    :no-close-on-backdrop="true",
    :no-enforce-focus="true",
    :lazy="true",
    :ok-disabled="validation.$invalid",
    size="lg")
    template(slot="modal-title")
      span.mr-2 {{ kasite.id ? $t('muokkaa-kasitetta') : $t('lisaa-uusi-kasite') }}
      // Sisällön kieli
      b-dropdown.float-right(size="sm")
        template(slot="button-content")
          span {{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}
        b-dropdown-item(
          @click="valitseSisaltoKieli(kieli)",
          v-for="kieli in sovelluksenKielet",
          :key="kieli",
          :disabled="kieli === sisaltoKieli") {{ kieli }}
    ep-form-content(name="kasite-termi")
      ep-input(
        v-model="kasite.termi",
        type="localized",
        help="kasite-termi-ohje",
        :validation="validation.termi",
        :is-editing="true")
    ep-form-content(name="kasite-selitys")
      ep-content(
        v-model="kasite.selitys",
        help="kasite-selitys-ohje",
        :validation="validation.selitys",
        :is-editable="true")
    ep-form-content(name="alaviite")
      b-form-checkbox(v-model="kasite.alaviite") {{ $t('merkitse-kasite-alaviitteeksi') }}
    template(slot="modal-cancel") {{ $t('peruuta') }}
    template(slot="modal-ok") {{ kasite.id ? $t('tallenna') : $t('lisaa-kasite') }}

</template>

<script lang="ts" src="./script.ts"></script>

<style lang="scss" scoped>
.kasitteet {
  margin-top: 4px;

  .ylapaneeli {
    border-bottom: 1px solid #eee;
    font-size: 90%;
    font-weight: 600;
    padding: 8px 5px;

    .otsikko {
      font-size: 150%;
    }
  }

  .sisalto {
    padding: 10px;
  }
}

.otsikko-toiminnot {
  display: flex;

  .has-search {
    flex: 1 1 0%;
  }

  .lisaysnappi {
    flex: 1 1 20%;
    text-align: right;

    button {
      border: 0;
      outline: 0;
      background-color: transparent;

      span {
        vertical-align: text-top;
      }

      svg {
        width: 25px;
        height: 25px;
        vertical-align: middle;
        color: #0041dc;
      }
    }
  }
}

.kasitelista {
  display:flex;
  flex-wrap: wrap;
}

.kasite:nth-child(odd) {
  background-color: #f3f3f3;
}

.kasite {
  padding: 5px 15px;
  display: flex;
  align-items: top;
  width: 100%;
  line-height: 2.5em;

  .termi {
    flex-grow: 2;
    font-weight: 600;
    width: 6em;
    min-width: auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .selitys {
    margin-left: 10px;
    flex-grow: 6;
    width: 10em;
    min-width: auto;
    overflow: hidden;
    line-height: 1.5em;

    /deep/ img {
      max-width: 100%;
    }
  }

  .selitys.open {
    margin-top: 0.5em;
  }

  .selitys.closed {
    height: 2.5em;
    line-height: 2.5em;
    white-space: nowrap;
    text-overflow: ellipsis;

    /deep/ p {
      margin: 0;
    }
  }

  .toiminnot {
    flex-grow: 1;
    text-align: right;
    width: 3em;
  }
}

</style>
