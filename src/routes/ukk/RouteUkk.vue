<template>
<ep-main-view>
  <template slot="icon">
    <ep-icon class="float-right" icon="question" background-color="#CE52C6"></ep-icon>
  </template>

  <!-- Rajaimet-->
  <template slot="header">
    <h2>{{ $t('ukk') }}</h2>
    <p>{{ $t('ukk-kuvaus-nakyma') }}</p>
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <ep-search v-model="rajain">
      </ep-search>
      <p>{{ $t('ukk-luoja-rajaus') }}:</p>
      <div class="form-check form-check-inline" v-for="(org, idx) in organisaatiot" :key="idx">
        <input class="form-check-input" :id="org.oid" type="checkbox" v-model="org.$checked" />
        <label class="form-check-label" :for="org.oid">{{ $kaanna(org.nimi) }}</label>
      </div>
      <p>
      <b-button class="float-right" variant="link" @click="startKysymysModal(null)">
        <fas class="mr-2" icon="plus-circle">
        </fas>
        <span>{{ $t('lisaa-uusi-kysymys') }}</span>
      </b-button>
    </p>
  </div>
</template>

<!-- Kysymykset-->
<template slot="custom-content">
<div v-if="!isLoading">
  <div class="row" v-for="kysymys in kysymyksetFormatted" :key="kysymys.id">
    <div class="col">
      <div class="float-right">
        <button class="btn btn-link" @click="startKysymysModal(kysymys)">
          <fas icon="pen">
          </fas>
        </button>
        <button class="btn btn-link" @click="startRemoveKysymys(kysymys)">
          <fas icon="times">
          </fas>
        </button>
      </div>
      <div>
        <p>
        <ep-aikaleima class="text-secondary" :value="kysymys.luotu" type="ago">
        </ep-aikaleima>
        </p>
        <h5>
          <ep-kaanna :value="kysymys.kysymys">
          </ep-kaanna>
        </h5>
        <p class="text-secondary">
        <ep-kaanna :value="kysymys.vastaus">
        </ep-kaanna>
        </p>
        <hr />
      </div>
    </div>
  </div>
</div>
</template>

<!-- Kysymyksen poiston vahvistus modal-->
<b-modal class="backdrop" id="removeKysymys" ref="removeKysymys" @ok="deleteKysymys" :lazy="true" size="lg">
  <span class="mr-2">{{ $t('haluatko-poistaa-kysymyksen') }}</span>
  <template slot="modal-cancel">{{ $t('peruuta') }}</template>
  <template slot="modal-ok">{{ $t('poista') }}</template>
</b-modal>

<!-- Kysymyksen luomisen ja muokkaamisen modaali-->
<template slot="after">
  <b-modal class="backdrop" id="createUpdateKysymys" ref="createUpdateKysymys" @ok="createUpdateKysymys" :no-close-on-backdrop="true" :no-enforce-focus="true" :lazy="true" :ok-disabled="validation.$invalid" size="lg">
    <template slot="modal-title">
      <span class="mr-2">{{ kysymys.$uusi ? $t('lisaa-uusi-kysymys') : $t('muokkaa-kysymys') }}</span>
      <!-- Sisällön kieli-->
      <b-dropdown class="float-right" size="sm">
        <template slot="button-content">
          <span>{{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}</span>
        </template>
        <b-dropdown-item @click="valitseSisaltoKieli(kieli)" v-for="kieli in sovelluksenKielet" :key="kieli" :disabled="kieli === sisaltoKieli">{{ kieli }}</b-dropdown-item>
      </b-dropdown>
    </template>
    <ep-form-content name="kysymys-nimi">
      <ep-content v-model="kysymys.kysymys" help="kysymys-nimi-ohje" layout="simplified" :validation="validation.kysymys" :is-editable="true">
      </ep-content>
    </ep-form-content>
    <ep-form-content name="kysymys-vastaus">
      <ep-content v-model="kysymys.vastaus" help="kysymys-vastaus-ohje" layout="simplified" :validation="validation.vastaus" :is-editable="true">
      </ep-content>
    </ep-form-content>
    <ep-form-content name="nayta-organisaatioissa">
      <ep-select help="kysymys-organisaatiot-ohje" v-model="kysymys.organisaatiot" :validation="validation.organisaatiot" :is-editing="true" :items="organisaatiot" :multiple="true">
        <template slot-scope="{ item }">
          <span>{{ $kaanna(item.nimi) }}</span>
        </template>
      </ep-select>
    </ep-form-content>
    <template slot="modal-cancel">{{ $t('peruuta') }}</template>
    <template slot="modal-ok">{{ kysymys.$uusi ? $t('lisaa-kysymys') : $t('tallenna') }}</template>
  </b-modal>
</template>
</ep-main-view>
</template>
<script lang="ts" src="./script.ts"></script>
<style scoped lang="scss">

.qty {
  user-select: all;
}

.btn-link {
  text-decoration: none;
}

</style>
