FROM node:14-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Set up backend
WORKDIR /app
COPY backend/package.json .
RUN npm install
COPY backend/ .

# Set up web
COPY . /usr/share/nginx/html

# Copy configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Create nginx run dir
RUN mkdir -p /run/nginx

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]