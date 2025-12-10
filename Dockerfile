# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app



COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start Angular dev server via local CLI
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
