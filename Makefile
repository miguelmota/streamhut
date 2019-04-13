all: build

build: build/docker

link:
	@lerna link

bootstrap:
	@lerna bootstrap

test:
	@npm run test

cli:
	@node packages/client/cli.js --help

streamhut:
	@node packages/streamhut --help

server:
	@(cd packages/server && HOST_URL='http://localhost:3001' PORT=3001 NET_PORT=1337 npm start)
	#lerna run start --stream --scope "@streamhut/server"

web:
	@(cd packages/web && npm start)

build/web:
	@(cd packages/web && npm run build)

build/docker:
	@docker build -t miguelmota/streamhut .

push/docker:
	@docker push miguelmota/streamhut:latest

start/docker:
	@docker run NET_PORT=1337 -e PORT=8080 -p 8080:8080 -p 1337:1337 -p 8765:8765 miguelmota/streamhut:latest

start/docker/prod:
	@docker run -e HOST_URL='https://streamhut.io' -e NET_PORT=1337 -e PORT=8080 -p 8080:8080 -p 1337:1337 -p 8765:8765 --restart unless-stopped miguelmota/streamhut:latest

migrate:
	@(cd packages/server/migration && make migrate)

rollback:
	@(cd packages/server/migration && make rollback)

migrate/new:
	@(cd packages/server/migration && rake db:new_migration name=$(NAME))
