FROM node:10

WORKDIR /
RUN npm install -g streamhut --unsafe-perm

CMD ["streamhut", "server"]
