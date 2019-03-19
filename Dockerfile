FROM node:10

WORKDIR /app
COPY . /app
RUN npm i

CMD ["node", "packages/client/bin/streamhut", "server"]
