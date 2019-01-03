module.exports = {
  devServer: {
    proxy: {
      "/eperusteet-ylops-service": {
        target: "http://localhost:8080",
        secure: false
      }
    }
  }
}
