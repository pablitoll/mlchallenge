FROM node:stretch-slim
RUN mkdir /melichallenge-processor
COPY . /melichallenge-processor
RUN ls -la /melichallenge-processor/*
WORKDIR /melichallenge-processor
RUN npm install
EXPOSE 3002
CMD node -r esm app.js