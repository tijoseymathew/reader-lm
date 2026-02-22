FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Source is mounted at runtime via docker-compose volume.
# node_modules lives in a named volume so the host mount doesn't shadow it.
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
