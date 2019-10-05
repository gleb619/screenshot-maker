#FROM node:6.10.3
FROM node:8.10.0

# Create app directory
RUN mkdir -p /srv
WORKDIR /srv

# Bundle app source
#COPY . /srv/

# Install app dependencies
COPY package.json /srv/
#COPY node_modules /srv/node_modules/
COPY app /srv/app/

RUN npm install

EXPOSE 9000

CMD [ "node", "app/index.js" ]
