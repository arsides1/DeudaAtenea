FROM openjdk:11-jdk-slim-buster

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./

RUN \
    chmod +x mvnw && \
    ./mvnw dependency:go-offline

COPY src ./src

CMD ["./mvnw", "spring-boot:run"]

