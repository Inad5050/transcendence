FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]