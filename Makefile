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
