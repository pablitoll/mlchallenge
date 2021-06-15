FROM node:stretch-slim
RUN mkdir /melichallenge-trace
COPY . /melichallenge-trace
RUN ls -la /melichallenge-trace/*
WORKDIR /melichallenge-trace
RUN npm install
EXPOSE 3000
CMD node -r esm app.js