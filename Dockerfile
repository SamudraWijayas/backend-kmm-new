# Gunakan Node versi LTS terbaru
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json dulu untuk caching dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua source code
COPY . .

# Build TypeScript ke JavaScript
RUN npm run build

# Expose port server (ubah jika server pakai port lain)
EXPOSE 3000

# Jalankan hasil build
CMD ["node", "dist/index.js"]
