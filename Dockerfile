
# Put this file in the root folder of your node project
FROM node:20

RUN apt-get update && apt-get upgrade -y

# Install Playwright with Dependencies and Chromium only 
# This is where a normal Digital Ocean App Platform without Docker fails because you don't have root access
RUN npx -y playwright@1.43.0 install --with-deps chromium

# Set the working directory to /app
WORKDIR /app

# Bundle your app source inside the docker image
COPY . .

# Install all the dependencies
RUN npm ci

# Build step
RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "start" ]