FROM node:16

RUN apt-get update && apt-get install -y \
    ffmpeg

# install dependencies
WORKDIR /opt/app
COPY ./package.json ./yarn.lock ./
RUN yarn install

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY ./config /opt/app/config
COPY ./public /opt/app/public
COPY ./db /opt/app/db
COPY ./.sequelizerc /opt/app/.sequelizerc

COPY ./src/ /opt/app/src

CMD yarn sequelize db:migrate && yarn start
