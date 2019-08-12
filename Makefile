all:build

.PHONY: build
build: release/dry

.PHONY: start
start:
	go run cmd/streamhut/main.go server

.PHONY: listen
listen:
	go run cmd/streamhut/main.go listen --channel test

.PHONY: release
release:
	goreleaser release --rm-dist

.PHONY: release/dry
release/dry:
	goreleaser release --rm-dist --skip-publish

build/docker:
	docker build -t streamhut/streamhut .

push/docker:
	docker push streamhut/streamhut:latest

start/docker:
	docker run -e PORT=8080 -e NET_PORT=1337 -p 8080:8080 -p 1337:1337 streamhut/streamhut:latest

start/docker/prod:
	docker run -e NET_PORT=1337 -e PORT=8080 -e HOST_URL='https://stream.ht' -p 8080:8080 -p 1337:1337 --restart unless-stopped --detach streamhut/streamhut:latest

migrate:
	(cd migration && make migrate)

rollback:
	(cd migration && make rollback)

migrate/new:
	(cd migration && rake db:new_migration name=$(NAME))
