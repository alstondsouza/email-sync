# frontend/Dockerfile

FROM node:20.11.1

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npm", "start"]
