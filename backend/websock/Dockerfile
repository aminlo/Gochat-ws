

FROM debian:stable-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY Gochat-ws .

CMD ["./Gochat-ws"]