# Multi-stage Dockerfile for AI Operations Investigator Modular Monolith
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Cache Gradle dependencies
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN ./gradlew dependencies --no-daemon || true

# Copy source and compile
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Runtime stage (Minimal JRE distroless-like footprint)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for enterprise production security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

COPY --from=builder /workspace/build/libs/ops-investigator-*.jar app.jar

ENV SERVER_PORT=8080 \
    SPRING_PROFILES_ACTIVE=dev \
    TZ=UTC

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
