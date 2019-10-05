FROM node:8.10.0

ENV SLACK_TOKEN='' \
    SITE=''

RUN mkdir -p /srv
WORKDIR /srv

COPY package.json /srv/
COPY app /srv/app/

RUN npm install

EXPOSE 9000

CMD [ "node", "app/index.js" ]
