FROM node:14

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .

ENV NODE_ENV=production

RUN npm install --production && npm run build:prod

EXPOSE 8081

CMD [ "npm", "run", "start:azure" ]