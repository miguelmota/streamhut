# streamhut migrations

## Getting started

Install dependencies

```bash
gem install bundler
bundle install
```

Set your database environment variables:

```bash
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DBNAME=streamhut
POSTGRES_USER=root
POSTGRES_PASS=
```

Create database

```bash
rake db:create
```

Initialize schema

```bash
rake db:migrate
```

## FAQ

- Q: Why are you using a ruby gem in a node application?

  - A: [standalone_migrations](https://github.com/thuss/standalone-migrations) is non-rails specific and by far the smoothest tool for database migrations I've come across.
