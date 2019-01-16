#!/bin/sh
# Generoi SDK:n apikuvauksen perusteella.

if [[ -z "${YLOPS_SERVICE_DIR}" ]]
then
  printf "\x1b[1m\$YLOPS_SERVICE_DIR ei ole asetettu.\n"
  printf "export YLOPS_SERVICE_DIR=\${HOME}/eperusteet-ylops/eperusteet-ylops-service\n"
  printf "\x1b[0m"
  exit 1
fi

mkdir -p src/generated
cd src/generated
curdir=$(pwd)

specfile="$YLOPS_SERVICE_DIR/target/openapi/ylops.spec.json"
cd ${YLOPS_SERVICE_DIR} \
  && mvn clean compile \
  && cd $curdir \
  && openapi-generator generate -c ../../generator.config.json -i "${specfile}" -g typescript-axios
