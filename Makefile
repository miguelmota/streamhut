all:build

.PHONY: build
build: release-dry

.PHONY: run
run:
	go run cmd/streamhut/main.go

.PHONY: server
server:
	go run cmd/streamhut/main.go server

.PHONY: listen
listen:
	go run cmd/streamhut/main.go listen --channel test

.PHONY: release
release:
	goreleaser release --rm-dist

.PHONY: release-dry
release-dry:
	goreleaser release --rm-dist --skip-publish

.PHONY: build-docker
build-docker:
	docker build -t streamhut/streamhut .

.PHONY: push-docker
push-docker:
	docker push streamhut/streamhut:latest

.PHONY: start-docker
start-docker:
	docker run -e PORT=8080 -e TCP_PORT=1337 -p 8080:8080 -p 1337:1337 streamhut/streamhut:latest

.PHONY: start-docker-prod
start-docker-prod:
	docker run -e PORT=8080 -e TCP_PORT=1337 -e HOST_URL='https://stream.ht' -p 8080:8080 -p 1337:1337 --restart unless-stopped --detach streamhut/streamhut:latest

.PHONY: docker-compose-up
docker-compose-up:
	docker-compose up

.PHONY: docker-compose-up-build
docker-compose-up-build:
	docker-compose up --build

.PHONY: migrate
migrate:
	(cd migration && make migrate)

.PHONY: migrate-new
migrate-new:
	(cd migration && rake db:new_migration name=$(NAME))

.PHONY: rollback
rollback:
	(cd migration && make rollback)

.PHONY: schema
schema:
	sqlite3 data/sqlite3.db .schema > schema.sql

.PHONY: fix-server
fix-server:
	CGO_CFLAGS="-g -O2 -Wno-return-local-addr" go run -gccgoflags "-L /lib64 -l pthread" cmd/streamhut/main.go server $(args)

.PHONY: fix-listen
fix-listen:
	CGO_CFLAGS="-g -O2 -Wno-return-local-addr" go run -gccgoflags "-L /lib64 -l pthread" cmd/streamhut/main.go listen $(args)

.PHONY: fix-run
fix-run:
	CGO_CFLAGS="-g -O2 -Wno-return-local-addr" go run -gccgoflags "-L /lib64 -l pthread" cmd/streamhut/main.go $(args)

.PHONY: fix-build
fix-build:
	CGO_CFLAGS="-g -O2 -Wno-return-local-addr" go build -gccgoflags "-L /lib64 -l pthread" cmd/streamhut/main.go
