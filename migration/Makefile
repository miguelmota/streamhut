DB_PATH = ../db/db.sqlite3

install:
	@gem install bundler
	@bundle install

help:
	@rake --tasks

create:
	@DB_PATH=$(DB_PATH) rake db:create

setup:
	@DB_PATH=$(DB_PATH) rake db:setup

migrate:
	@DB_PATH=$(DB_PATH) rake db:migrate

migrate/new:
	@rake db:new_migration name=$(NAME)

rollback:
	@DB_PATH=$(DB_PATH) rake db:rollback
