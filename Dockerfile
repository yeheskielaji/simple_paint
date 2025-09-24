# Gunakan base image Nginx yang ringan
FROM nginx:alpine

# Copy konfigurasi custom nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy semua file project ke direktori default Nginx
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
