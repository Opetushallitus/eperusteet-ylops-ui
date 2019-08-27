const servicePort = process.env.YLOPS_SERVICE_PORT || 8081;

module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/eperusteet-ylops-app/uusi/' : '/',
  configureWebpack: {
    optimization: {
      providedExports: process.env.NODE_ENV === 'production',
    },
  },
  devServer: {
    overlay: {
      warnings: false,
      errors: true,
    },
    clientLogLevel: 'none',
    port: 9040,
    proxy: {
      '/eperusteet-ylops-service': {
        target: process.env.NODE_ENV === 'e2e' ? 'http://app:8080' : 'http://localhost:' + servicePort,
        secure: false,
      },
      '/virkailija-raamit': {
        target: process.env.NODE_ENV === 'e2e' ? 'http://app:8080' : 'http://localhost:' + servicePort,
        secure: false,
      },
    },
  },
};
