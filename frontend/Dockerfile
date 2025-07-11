# Use Node.js alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including serve
RUN npm install && npm install -g serve

# Copy the rest of the application source code
COPY . .

# Add build argument for API URL
ARG VITE_API_URL=http://localhost:8001

# Set environment variable from ARG for Vite build
ENV VITE_API_URL=$VITE_API_URL

# Check environment and build the application
RUN echo "Building with VITE_API_URL=$VITE_API_URL" && npm run build

# Expose port 80
EXPOSE 80

# Serve the static files using serve
CMD ["serve", "-s", "dist", "-l", "80"]