FROM node:latest

WORKDIR /app

COPY package.json /app/package.json

RUN apt update

RUN npm install

COPY . ./

EXPOSE 3000

ENTRYPOINT [ "bash", "entrypoint.sh" ]