FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o mid-server ./cmd/main.go

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/mid-server .
EXPOSE 8080
CMD ["./mid-server"]
