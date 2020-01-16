<template>
<div class="kasitteet">
  <div class="ylapaneeli d-flex align-items-center">
    <h2 class="otsikko">{{ $t('kasitteet') }}</h2>
  </div>
  <ep-spinner v-if="isLoading"></ep-spinner>
  <div class="sisalto" v-else>
    <div class="otsikko-toiminnot">
      <ep-search class="mb-3" v-model="hakusana"></ep-search>
      <div class="lisaysnappi"><button @click="avaaMuokkausModal(null)"><fas class="mr-2" icon="plussa"></fas><span>{{ $t('lisaa-kasite') }}</span></button></div>
    </div>
    <div class="kasitelista">
      <div class="kasite" v-for="(k, idx) in suodatettuTermisto" :key="idx">
        <ep-content class="termi" :class="{ closed: k.closed, open: !k.closed }" :value="k.kasite.termi" layout="simplified"></ep-content>
        <ep-content class="selitys" :class="{ closed: k.closed, open: !k.closed }" :value="k.kasite.selitys" layout="simplified"></ep-content>
        <div class="toiminnot"><button class="btn btn-link" @click="avaaPoistoModal(k.kasite)"><fas :icon="['far','trash-alt']" fixed-width="fixed-width"></fas></button><button class="btn btn-link" @click="avaaMuokkausModal(k.kasite)"><fas icon="pen" fixed-width></fas></button>
          <button class="btn btn-link" @click="k.closed = !k.closed">
            <fas icon="chevron-down" v-if="k.closed" fixed-width></fas>
            <fas icon="chevron-up" v-else fixed-width></fas>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Käsitteen poisto modal-->
  <b-modal class="backdrop" id="kasitteenPoistoModal" ref="kasitteenPoistoModal" @ok="poistaKasite" :lazy="true" size="lg"><span class="mr-2">{{ $t('haluatko-poistaa-kasitteen') }}</span><template slot="modal-cancel">{{ $t('peruuta') }}</template><template slot="modal-ok">{{ $t('poista') }}</template></b-modal>
  <!-- Käsitteen luomisen ja muokkaamisen modaali-->
  <b-modal class="backdrop" id="kasitteenLuontiModal" ref="kasitteenLuontiModal" @ok="tallennaKasite" :no-close-on-backdrop="true" :no-enforce-focus="true" :lazy="true" :ok-disabled="validation.$invalid" size="lg"><template slot="modal-title"><span class="mr-2">{{ kasite.id ? $t('muokkaa-kasitetta') : $t('lisaa-uusi-kasite') }}</span><!-- Sisällön kieli--><b-dropdown class="float-right" size="sm"><template slot="button-content"><span>{{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}</span></template>
    <b-dropdown-item
      @click="valitseSisaltoKieli(kieli)" v-for="kieli in sovelluksenKielet" :key="kieli" :disabled="kieli === sisaltoKieli">{{ kieli }}</b-dropdown-item>
  </b-dropdown>
  </template>
    <ep-form-content name="kasite-termi">
      <ep-input v-model="kasite.termi" type="localized" help="kasite-termi-ohje" :validation="validation.termi" :is-editing="true"></ep-input>
    </ep-form-content>
    <ep-form-content name="kasite-selitys">
      <ep-content v-model="kasite.selitys" help="kasite-selitys-ohje" :validation="validation.selitys" :is-editable="true" layout="simplified"></ep-content>
    </ep-form-content>
    <ep-form-content name="alaviite">
      <ep-toggle v-model="kasite.alaviite">{{ $t('merkitse-kasite-alaviitteeksi') }}</ep-toggle>
    </ep-form-content><template slot="modal-cancel">{{ $t('peruuta') }}</template><template slot="modal-ok">{{ kasite.id ? $t('tallenna') : $t('lisaa-kasite') }}</template></b-modal>
</div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss" scoped></style>
