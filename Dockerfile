# Multi-stage Dockerfile for AI Helpdesk Demo
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npx vite build

# Clean up node_modules to reduce image size
RUN rm -rf node_modules

# Stage 2: Setup Python backend
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Copy other necessary files
COPY sample_tickets.json ./
COPY knowledge_base/ ./knowledge_base/

# Create necessary directories
RUN mkdir -p backend/data

# Set environment variables
ENV FLASK_ENV=production
ENV PORT=8080
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start the application
WORKDIR /app/backend
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "--timeout", "120", "app:app"]