module.exports = {
  devServer: {
    port: 9040,
    proxy: {
      "/eperusteet-ylops-service": {
        target: "http://localhost:8080",
        secure: false
      }
    }
  }
}
