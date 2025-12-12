# Multi-stage build for smaller, more secure images
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Or for Next.js: COPY --from=builder /app/.next ./.next
# Or for other frameworks, adjust the build output directory

# Set proper ownership
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production

# Start the production server
CMD ["npm", "start"]