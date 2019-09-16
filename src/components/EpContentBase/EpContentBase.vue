<template lang="pug" src="./template.pug"></template>

<style scoped lang="scss">
/deep/ abbr {
  border-bottom: 1px dotted #999;
  cursor: help;
}

.is-invalid {
  border-color: #dc3545;
}

.is-valid {
  border-color: #28a745;
}

// Piilotettu Bootstrapissa oletuksena
/deep/ .invalid-feedback,
/deep/ .valid-feedback {
  display: block;
}

</style>

<script lang="ts" src="./script.ts"></script>
