# Setup a development stage
# This can be used with the development and test flows 
FROM node:16.13.1 AS development

# Create required directories and add permissions to the node user
RUN mkdir /srv/backend-api && chown node:node /srv/backend-api

RUN chown node /srv/backend-api

USER node

WORKDIR /srv/backend-api

# copy over the package file to install dependencies
COPY --chown=node:node package.json ./

RUN npm install

# Start the production build stage 
# This stage can use the modules we installed in the last stage 
# copy over only the required files to make a smaller container
FROM node:16.13.1-slim AS production

# Create required directories and add permissions to the node user
RUN mkdir /srv/backend-api && chown node:node /srv/backend-api

USER node

WORKDIR /srv/backend-api

COPY --from=development --chown=node:node /srv/backend-api/node_modules ./node_modules

COPY --chown=node:node . .

CMD ["bash", "bin/entrypoint.production.sh"]