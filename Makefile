all:build

.PHONY: build
build: release/dry

.PHONY: start
start:
	@go run cmd/streamhut/main.go server

.PHONY: release
release:
	goreleaser release --rm-dist

.PHONY: release/dry
release/dry:
	goreleaser release --rm-dist --skip-publish
