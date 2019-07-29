# eperusteet-ylops-lukio-ui

[![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio)
[![Maintainability](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-lukio/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-lukio/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/Opetushallitus/eperusteet-ylops-lukio/badge.svg)](https://snyk.io/test/github/Opetushallitus/eperusteet-ylops-lukio)

## Projektin asentaminen

### Kehitysympäristön vaatimukset

```
Node.js 10 LTS
```

### Riippuvuuksien asentaminen

```sh

npm install

```

### Rajapintojen generoiminen

Aseta ympäristömuuttuja YLOPS\_SERVICE\_DIR osoittamaan
[eperusteet-ylops](https://github.com/Opetushallitus/eperusteet-ylops)\/eperusteet-ylops-service
hakemistoon.

```sh

# Generointi väliaikaisella apuskriptilla
npm run gen:api

# Generointi ilman
mkdir -p src/generated
cd src/generated
openapi-generator generate -i <specfile> -g typescript-axios

```

### Kehitysympäristön käynistäminen

```sh

npm run serve

```

### Tuotantoversion rakentaminen

```sh

npm run build

```

### Testaaminen

```sh

# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run e2e tests
npm run test:e2e

# Edit e2e tests
npm run dev:e2e

```

### Lähdekoodin analysoiminen

```sh

npm run lint

```

### Yksikkötestien ajaminen

```sh

npm run test:unit
npm run test:unit:dev # Pitää testit käynnissä

```

### Suositeltavat resurssit

- [Vue style guide](https://vuejs.org/v2/style-guide)

