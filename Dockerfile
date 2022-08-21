FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

RUN mkdir public

COPY public/package*.json public/
RUN cd public && npm install

COPY . .

EXPOSE 7222
CMD ["node", "server.js"]