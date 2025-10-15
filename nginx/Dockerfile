FROM nginx:1.27-alpine
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 8443
CMD ["nginx", "-g", "daemon off;"]
