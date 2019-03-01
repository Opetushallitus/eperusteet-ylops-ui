<template lang="pug">
footer
  div.footer-content
    slot(name="footer-logo")
    slot(name="footer-content")
</template>

<style scoped lang="scss">
footer {
  border-top: 1px solid #ccc;
  padding: 20px 0;

  .footer-content {
    max-width: 1024px;
    margin: 0 auto;
    padding: 20px 0;
  }
}

</style>
