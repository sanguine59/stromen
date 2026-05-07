FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3010

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://localhost:3010/health || exit 1

CMD ["npm", "run", "start:dev"]
