all: build

build: build/docker

bootstrap:
	@lerna bootstrap

test:
	@npm run test

cli:
	@node packages/client/cli.js --help

server:
	@(cd packages/server && npm start)

web:
	@(cd packages/web && npm start)

build/docker:
	@docker build -t miguelmota/streamhut .

start/docker:
	@docker run -e PORT=3000 -p 3000:3000 miguelmota/streamhut:latest
