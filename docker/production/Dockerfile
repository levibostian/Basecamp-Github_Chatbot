FROM node:10-alpine AS builder

WORKDIR /build
COPY package*.json .babelrc /build/
COPY app /build/app/
RUN npm install && npm run-script build

FROM node:10-alpine

ENV HOME=/home/app/app
WORKDIR ${HOME}

COPY package*.json templates.json ${HOME}/
COPY --from=builder /build/dist ${HOME}/dist
RUN npm install --production

CMD npm run-script --silent run
