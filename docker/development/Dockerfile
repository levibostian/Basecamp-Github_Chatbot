FROM node:10-alpine

RUN mkdir -p /home/app/app
ENV HOME=/home/app/app
WORKDIR ${HOME}

CMD npm run-script build && npm run-script run
