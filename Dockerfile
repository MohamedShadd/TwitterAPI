# Use Puppeteer base image
FROM ghcr.io/puppeteer/puppeteer:23.6.0

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Expose the port the app will run on (3333)
EXPOSE 3333

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the app files
COPY . .

# Start the application
CMD ["node", "api.mjs"]
