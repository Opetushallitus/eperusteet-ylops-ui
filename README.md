# eperusteet-ylops-lukio-ui

[![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio)
[![codecov](https://codecov.io/gh/Opetushallitus/eperusteet-ylops-lukio/branch/master/graph/badge.svg)](https://codecov.io/gh/Opetushallitus/eperusteet-ylops)


## Project setup
```sh
$ npm install
```

### Compiles and hot-reloads for development
```sh
$ npm run serve
```

### Compiles and minifies for production
```sh
$ npm run build
```

### Testing
```sh
# Run all tests
$ npm run test

# Run unit tests only
$ npm run test:unit

# Run e2e tests
$ npm run test:e2e

# Edit e2e tests
$ npm run dev:e2e
```

### Lints and fixes files
```sh
$ npm run lint
```

### Run your unit tests
```sh
$ npm run test:unit
$ npm run test:unit:dev # Pitää testit käynnissä
```

### Api SDK generation
```sh
# Generointi väliaikaisella apuskriptilla
$ npm run gen:api

# Generointi ilman
$ mkdir -p src/generated
$ cd src/generated
$ openapi-generator generate -i <specfile> -g typescript-axios
```

### Recommended resources
- [Vue style guide](https://vuejs.org/v2/style-guide)
