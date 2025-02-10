# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application (for Next.js, this creates the production build)
RUN npm run build

# Stage 2: Run the production server
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variable to production
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expose the port that your app runs on
EXPOSE 3000

# Start the application (for Next.js, this uses next start)
CMD ["npm", "start"]
