# Put this file in the root folder of your node project
FROM node:20

# Get the latest version of Playwright
#nFROM mcr.microsoft.com/playwright:focal

# RUN apt-get update && apt-get upgrade -y

# Install Playwright with Dependencies and Chromium only 
# This is where a normal Digital Ocean App Platform without Docker fails because you don't have root access
RUN npx -y playwright@latest install --with-deps chromium

# Set the working directory to /app
WORKDIR /app

# Bundle your app source inside the docker image
COPY . .

# Get the needed libraries to run Playwright
RUN apt-get update && apt-get -y install libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libatspi2.0-0 libxshmfence-dev


# Install all the dependencies
RUN npm ci

# Build step
RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "start" ]
