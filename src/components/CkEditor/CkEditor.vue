<template lang="pug">
div.ckeditor-wrapper(:class="{ 'is-invalid': isInvalid, 'is-valid': isValid }")
  div(ref="ckeditor")
</template>

<script lang="ts" src="./script.ts"></script>
<style scoped lang="scss" src="./style.scss"></style>
