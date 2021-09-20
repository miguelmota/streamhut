FROM golang:1.12rc1-alpine3.9 AS build

RUN apk --no-cache add gcc musl-dev ca-certificates
COPY . /go/src/github.com/streamhut/streamhut
WORKDIR /go/src/github.com/streamhut/streamhut

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o streamhut cmd/streamhut/main.go

FROM alpine:3.9
COPY --from=build /etc/ssl/certs /etc/ssl/certs
COPY --from=build /go/src/github.com/streamhut/streamhut/streamhut /bin/streamhut
ENTRYPOINT ["streamhut"]
CMD ["server"]
