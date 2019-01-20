#!/bin/sh
# Generoi SDK:n apikuvauksen perusteella.

if [ test -z $YLOPS_SERVICE_DIR ]
then
  printf "\x1b[1mYLOPS_SERVICE_DIR\x1b[0m is not set.\n"
  printf "For example, call export \x1b[1mYLOPS_SERVICE_DIR="
  printf $HOME
  printf "/eperusteet-ylops/eperusteet-ylops-service\x1b[0m\n"
  exit 1
fi

mkdir -p src/generated
cd src/generated
gendir=$(pwd)

specfile="$YLOPS_SERVICE_DIR/target/openapi/ylops.spec.json"
cd $YLOPS_SERVICE_DIR \
  && mvn clean compile \
  && cd $gendir \
  && npx openapi-generator generate -c ../../generator.config.json -i $specfile -g typescript-axios
