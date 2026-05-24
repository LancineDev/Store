FROM node:20-alpine

WORKDIR /app

# Copy only package manifest first for faster rebuilds
COPY package.json ./

# Install all dependencies needed for build
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
