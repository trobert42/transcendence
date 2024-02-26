FROM node:latest

WORKDIR /app

COPY package.json /app/package.json

RUN apt update

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3333

CMD ["sh", "./entrypoint.sh"]

