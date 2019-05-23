<template lang="pug">

ep-main-view
  template(slot="icon")
    ep-icon.float-right(icon="question", background-color="#CE52C6")

  // Rajaimet
  template(slot="header")
    h2 {{ $t('ukk') }}
    p {{ $t('ukk-kuvaus-nakyma') }}
    ep-spinner(v-if="isLoading")
    div(v-else)
      ep-search(v-model="rajain")
      p {{ $t('ukk-luoja-rajaus') }}:
      .form-check.form-check-inline(v-for="org in organisaatiot")
        input.form-check-input(:id="org.oid", type="checkbox", v-model="org.$checked")
        label.form-check-label(:for="org.oid") {{ $kaanna(org.nimi) }}
      p
        b-button.float-right(variant="link", @click="startKysymysModal(null)")
          fas.mr-2(icon="plus-circle")
          span {{ $t('lisaa-uusi-kysymys') }}

  // Kysymykset
  template(slot="custom-content")
    div.row(v-if="!isLoading", v-for="kysymys in kysymyksetFormatted", :key="kysymys.id")
      div.col.col-fixed
        // Todo: Toteuta profiililla uusi
        // Kysymys on uusi jos alle 30 päivää vanha
        //p.float-right(v-if="(new Date().getTime() - kysymys.luotu) / 1000 / 60 / 60 / 24 < 30") {{ $t('uusi') }}
      div.col
        .float-right
          button.btn.btn-link(@click="startKysymysModal(kysymys)")
            fas(icon="pen")
          button.btn.btn-link(@click="startRemoveKysymys(kysymys)")
            fas(icon="times")
        div
          p
            ep-aikaleima.text-secondary(:value="kysymys.luotu" type="ago")
          h5
            ep-kaanna(:value="kysymys.kysymys")
          p.text-secondary
            ep-kaanna(:value="kysymys.vastaus")
          //div
            a.pr-2.d-inline(href="")
              fas.mr-2(:icon="['far','comment']")
              span {{ $t('kommentoi') }}
            p.px-2.d-inline.qty {{ $t('kommenttia', { maara: 0 }) }}
          hr

  // Kysymyksen poiston vahvistus modal
  b-modal.backdrop(
    id="removeKysymys",
    ref="removeKysymys",
    @ok="deleteKysymys",
    :lazy="true",
    size="lg")
    span.mr-2 {{ $t('haluatko-poistaa-kysymyksen') }}
    template(slot="modal-cancel") {{ $t('peruuta') }}
    template(slot="modal-ok") {{ $t('poista') }}

  // Kysymyksen luomisen ja muokkaamisen modaali
  template(slot="after")
    b-modal.backdrop(
      id="createUpdateKysymys",
      ref="createUpdateKysymys"
      @ok="createUpdateKysymys",
      :no-close-on-backdrop="true",
      :no-enforce-focus="true",
      :lazy="true",
      :ok-disabled="validation.$invalid",
      size="lg")
      template(slot="modal-title")
        span.mr-2 {{ kysymys.$uusi ? $t('lisaa-uusi-kysymys') : $t('muokkaa-kysymys') }}
        // Sisällön kieli
        b-dropdown.float-right(size="sm")
          template(slot="button-content")
            span {{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}
          b-dropdown-item(
            @click="valitseSisaltoKieli(kieli)",
            v-for="kieli in sovelluksenKielet",
            :key="kieli",
            :disabled="kieli === sisaltoKieli") {{ kieli }}
      ep-form-content(name="kysymys-nimi")
        ep-content(
          v-model="kysymys.kysymys",
          help="kysymys-nimi-ohje",
          layout="simplified",
          :validation="validation.kysymys",
          :is-editable="true")
      ep-form-content(name="kysymys-vastaus")
        ep-content(
          v-model="kysymys.vastaus",
          help="kysymys-vastaus-ohje",
          layout="simplified",
          :validation="validation.vastaus",
          :is-editable="true")
      ep-form-content(name="nayta-organisaatioissa")
        ep-select(
          help="kysymys-organisaatiot-ohje",
          v-model="kysymys.organisaatiot",
          :validation="validation.organisaatiot",
          :is-editing="true",
          :items="organisaatiot",
          :multiple="true")
          template(slot-scope="{ item }")
            span {{ $kaanna(item.nimi) }}
      template(slot="modal-cancel") {{ $t('peruuta') }}
      template(slot="modal-ok") {{ kysymys.$uusi ? $t('lisaa-kysymys') : $t('tallenna') }}

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
