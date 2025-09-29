FROM node:20-alpine
RUN apk add --no-cache git sqlite-dev curl
WORKDIR /var/www/html
COPY package*.json ./
RUN npm ci
COPY . .
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
EXPOSE 9000
CMD ["npm", "start"]