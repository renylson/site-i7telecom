FROM node:14-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx py3-supervisor imagemagick

# Set up backend
WORKDIR /app
COPY backend/package.json .
RUN npm install
COPY backend/ .

# Set up web
COPY . /usr/share/nginx/html

# Convert images to WebP
RUN cd /usr/share/nginx/html/assets/images && \
    convert header_app.png -resize 669x446 header_app_resized.png && mv header_app_resized.png header_app.png && \
    convert logo.png -resize 400x80 logo_resized.png && mv logo_resized.png logo.png && \
    convert shape-6.png -resize 334x168 shape-6_resized.png && mv shape-6_resized.png shape-6.png && \
    convert download.png -resize 400x300 download_resized.png && mv download_resized.png download.png && \
    for img in *.png; do \
        if [ -f "$img" ]; then \
            convert "$img" -quality 80 "${img%.png}.webp"; \
        fi \
    done

# Combine CSS files
RUN cd /usr/share/nginx/html/assets/css && \
    cat animate.css LineIcons.2.0.css bootstrap.4.5.2.min.css default.css style.css > all.css

# Combine JS files
RUN cd /usr/share/nginx/html/assets/js && \
    cat vendor/jquery-1.12.4.min.js vendor/modernizr-3.7.1.min.js popper.min.js bootstrap.4.5.2.min.js jquery.easing.min.js scrolling-nav.js wow.min.js main.js > all.js

# Copy configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Create nginx run dir
RUN mkdir -p /run/nginx

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]