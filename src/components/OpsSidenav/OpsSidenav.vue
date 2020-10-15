<template>
<ep-spinner v-if="isLoading" />
<div v-else class="sidebar d-flex flex-column flex-fill">
  <!-- Todo: toteutetaan yhteisen navigaatiokomponentin yhteydessä
  <div class="search">
    <ep-search v-model="query"/>
  </div>
  -->
  <ul class="navigation flex-fill">

    <li class="p-0">
      <router-link :to="{name: 'yleisnakyma'}">
        <div class="hallintapaneeli">
          <span>{{$t('yleisnakyma')}}</span>
        </div>
      </router-link>
    </li>

    <ep-recursive-nav :value="valikkoData">
      <template v-slot:previousLink="{ itemData, itemRoute, navigate }">
        <li class="previous-link align-items-start">
          <ops-sidenav-link class="back-btn" tag="span" :click="navigate" :clickParams="false">
            <fas icon="chevron-left" />
          </ops-sidenav-link>
          <ops-sidenav-link class="previous-link" tag="span" :to="itemRoute">
            <a class="btn btn-link btn-link-nav">
              {{ kaanna(itemData.item) }}
              <span class="code-field" v-if="haeKoodi(itemData.item)">({{ haeKoodi(itemData.item) }})</span>
             </a>
          </ops-sidenav-link>
        </li>
      </template>
      <template v-slot="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }">
        <ops-sidenav-link :to="itemRoute" :class="{ 'module-link': onkoModTaiOj(itemData.item) }" v-if="!isSubmenu && itemRoute">
          <a class="btn btn-link btn-link-nav" v-if="itemData.item.type === 'uusi-opintojakso'">
            <fas class="mr-2" icon="plussa" />
            <span>{{ $t('luo-uusi-opintojakso') }}</span>
          </a>
          <a class="btn btn-link btn-link-nav" v-else-if="itemData.item.type === 'uusi-paikallinen-oppiaine'">
            <fas class="mr-2" icon="plussa" />
            <span>{{ $t('luo-uusi-paikallinen-oppiaine') }}</span>
          </a>
          <a v-else class="btn btn-link btn-link-nav">
            <div class="d-inline-flex">
              <div v-if="onModuuli(itemData.item)">
                <ep-color-indicator class="mr-2" :kind="itemData.item.objref.pakollinen ? 'pakollinen': 'valinnainen'">
                </ep-color-indicator>
              </div>
              <div>
                <span>{{ kaanna(itemData.item) }}</span>
                <span class="code-field" v-if="haeKoodi(itemData.item)">({{ haeKoodi(itemData.item) }})</span>
              </div>
            </div>
          </a>
        </ops-sidenav-link>
        <li class="subheader" v-if="!isSubmenu && !itemRoute && kaanna(itemData.item)">
          <span>{{ kaanna(itemData.item) }}</span>
        </li>
        <ops-sidenav-link class="submenu" v-if="isSubmenu" :itemData="itemData" :to="itemRoute" :click="navigate">
          <a class="btn btn-link btn-link-nav ">
            {{ kaanna(itemData.item) }}
            <span class="code-field" v-if="haeKoodi(itemData.item)">({{ haeKoodi(itemData.item) }})</span>
          </a>
          <fas icon="chevron-right" v-if="!itemData.item.hideChevron" class="ml-2">
          </fas>
        </ops-sidenav-link>
      </template>
      <template v-slot:after="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }">
        <li v-if="itemData.item.type === 'tekstikappale'">
          <ep-tekstikappale-lisays
            :opetussuunnitelmaStore="store"
            :tekstikappaleet="tekstikappaleLapset(itemData)"
            v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"/>
        </li>

        <li v-if="itemData.item.type === 'koosteinen-oppiaine'">
          <ep-oppimaara-lisays
              :opetussuunnitelmaStore="store"
              :oppiaine="itemData.item.objref"
              :reset-navi="reset"
              v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"/>
        </li>
      </template>
    </ep-recursive-nav>
  </ul>

  <div class="muokkaa-kappaleita" v-sticky sticky-side="bottom" sticky-z-index="500">
    <router-link :to="{name: 'jarjesta'}">
      <div class="inner">
        <fas icon="jarjesta" fixed-width />
        <a class="btn btn-link btn-link-nav">{{$t('muokkaa-jarjestysta')}}</a>
      </div>
    </router-link>
  </div>
</div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
<script lang="ts" src="./script.ts"></script>
