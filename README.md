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

git submodule update --init --recursive
yarn install

cd eperusteet-frontend-utils/vue
yarn install
yarn gen:api

```

### Rajapintojen generoiminen

Aseta ympäristömuuttuja YLOPS\_SERVICE\_DIR osoittamaan
[eperusteet-ylops](https://github.com/Opetushallitus/eperusteet-ylops)\/eperusteet-ylops-service
hakemistoon.

```sh

# Generointi väliaikaisella apuskriptilla
yarn gen:api

# Generointi ilman
mkdir -p src/generated
cd src/generated
openapi-generator generate -i <specfile> -g typescript-axios

```

### Kehitysympäristön käynnistäminen

```sh

yarn serve

```

### Tuotantoversion rakentaminen

```sh

yarn build

```

### Testaaminen

```sh

# Run all tests
yarn test

# Run unit tests only
yarn test:unit

# Run e2e tests
yarn test:e2e

# Edit e2e tests
yarn dev:e2e

```

### Lähdekoodin analysoiminen

```sh

yarn lint

```

### Yksikkötestien ajaminen

```sh

yarn test:unit
yarn test:unit:dev # Pitää testit käynnissä

```

### Suositeltavat resurssit

- [Vue style guide](https://vuejs.org/v2/style-guide)

## ePerusteet-projektit

  Projekti | Build status | Maintainability | Test Coverage | Known Vulnerabilities
  -------- | ------------ | --------------- | ------------- | ----------------------
  [ePerusteet](https://github.com/Opetushallitus/eperusteet) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet)
  [ePerusteet-amosaa](https://github.com/Opetushallitus/eperusteet-amosaa) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-amosaa.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-amosaa)
  [ePerusteet-ylops](https://github.com/Opetushallitus/eperusteet-ylops) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ylops.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops)
  [ePerusteet-ylops-lukio](https://github.com/Opetushallitus/eperusteet-ylops-lukio) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio) | [![Maintainability](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-lukio/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-lukio/test_coverage) | [![Known Vulnerabilities](https://snyk.io/test/github/Opetushallitus/eperusteet-ylops-lukio/badge.svg)](https://snyk.io/test/github/Opetushallitus/eperusteet-ylops-lukio)
  [ePerusteet-opintopolku](https://github.com/Opetushallitus/eperusteet-opintopolku) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-opintopolku.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-opintopolku) | [![Maintainability](https://api.codeclimate.com/v1/badges/24fc0c3e2b968b432319/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-opintopolku/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/24fc0c3e2b968b432319/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-opintopolku/test_coverage)
  [ePerusteet-backend-utils](https://github.com/Opetushallitus/eperusteet-backend-utils) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-backend-utils.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-backend-utils)
  [ePerusteet-frontend-utils](https://github.com/Opetushallitus/eperusteet-frontend-utils) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-frontend-utils.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-frontend-utils) | [![Maintainability](https://api.codeclimate.com/v1/badges/f782a4a50622ae34a2bd/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-frontend-utils/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/f782a4a50622ae34a2bd/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-frontend-utils/test_coverage)
