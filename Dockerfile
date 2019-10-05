FROM node:8.10.0

ENV SLACK_TOKEN='YOURS-DEFAULT-TOKEN' \
    SITE='https://google.com' \
    CHANNEL='random'

RUN mkdir -p /srv
WORKDIR /srv

COPY package.json /srv/
COPY app /srv/app/

RUN npm install

EXPOSE 9000

CMD [ "node", "app/index.js" ]
