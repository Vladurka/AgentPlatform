# Build widget
FROM node:20-alpine AS widget-builder
WORKDIR /widget
COPY widget/package.json widget/package-lock.json* ./
RUN npm ci
COPY widget/ .
RUN npm run build

# Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=widget-builder /widget/dist/widget.js /usr/share/nginx/html/widget.js
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
