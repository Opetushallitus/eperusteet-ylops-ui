<template lang="pug">
div.ckeditor-wrapper(:class="{ 'is-invalid': isInvalid, 'is-valid': isValid }")
  ckeditor(
    v-model="editorValue"
    :config="config"
    type="inline"
    @input="$emit('input', $event)")
</template>

<script lang="ts" src="./script.ts"></script>
<style scoped lang="scss" src="./style.scss"></style>
