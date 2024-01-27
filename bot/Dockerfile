FROM node:latest
WORKDIR /puttantour-bot
COPY package*.json ./
RUN npm install
COPY . ./
# ARG TOKEN
# ARG TEST_TOKEN

# ENV TOKEN $TOKEN
# ENV TEST_TOKEN $TEST_TOKEN

CMD ["npm", "start"]