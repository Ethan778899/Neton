FROM node:20.5.1-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

EXPOSE 3000

CMD [ "npm", "run", "start" ]