<template lang="pug">
div
  div(class="row tab-area-row")
    div(class="col-md")
      div(class="oph-tabs")
        router-link(
          :to="{ name: 'opsTiedot' }"
          tag="div"
          class="oph-tab-item") {{ $t('pohjan-tiedot') }}
        div(class="oph-tab-item oph-tab-item-is-active") {{ $t('yhteiset-osuudet') }}
</template>

<style scoped lang="scss" src="./style.scss"></style>
