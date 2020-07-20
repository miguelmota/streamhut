FROM golang:1.12rc1-alpine3.9

RUN apk --no-cache add gcc musl-dev ca-certificates
COPY . /go/src/github.com/streamhut/streamhut
WORKDIR /go/src/github.com/streamhut/streamhut

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o streamhut cmd/streamhut/main.go
RUN mv streamhut /bin/streamhut
ENTRYPOINT ["streamhut"]
CMD ["server"]
