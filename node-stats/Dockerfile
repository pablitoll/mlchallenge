FROM node:stretch-slim
RUN mkdir /melichallenge-stats
COPY . /melichallenge-stats
RUN ls -la /melichallenge-stats/*
WORKDIR /melichallenge-stats
RUN npm install
EXPOSE 3001
CMD node -r esm app.js