FROM node:21-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

RUN rm -rf src/ static/

USER node:node

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "build/index.js"]
