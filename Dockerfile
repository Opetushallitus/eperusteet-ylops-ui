FROM maven:3.5.4-jdk-8-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh nss

RUN git clone https://github.com/Opetushallitus/eperusteet-ylops app

WORKDIR /app/eperusteet-ylops-service
RUN mvn clean compile
RUN mkdir -p src/main/resources/fakedata
RUN curl "https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/1266381/kaikki" > src/main/resources/fakedata/varhaiskasvatus.json
