# Step 1: Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Step 2: Nginx serve stage
FROM nginx:alpine

# Hapus default halaman nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy hasil build dari tahap sebelumnya
COPY --from=build /app/dist /usr/share/nginx/html

# Jika pakai React Router, ini penting agar route selain "/" tidak error
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
