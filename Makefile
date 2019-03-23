all: build

build: build/docker

bootstrap:
	@lerna bootstrap

test:
	@npm run test

cli:
	@node packages/client/cli.js --help

server:
	@(cd packages/server && HOST_URL='http://localhost:3000' PORT=3001 NET_PORT=1337 npm start)

web:
	@(cd packages/web && npm start)

build/web:
	@(cd packages/web && npm run build)

build/docker:
	@docker build -t miguelmota/streamhut .

push/docker:
	@docker push miguelmota/streamhut:latest

start/docker:
	@docker run NET_PORT=1337 -e PORT=8080 -p 8080:8080 -p 1337:1337 miguelmota/streamhut:latest

start/docker/prod:
	@docker run -e HOST_URL='https://streamhut.io' -e NET_PORT=1337 -e PORT=8080 -p 8080:8080 -p 1337:1337 --restart unless-stopped miguelmota/streamhut:latest
