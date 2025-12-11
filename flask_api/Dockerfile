# Use the official Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements first to leverage caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the rest of the app
COPY . .

# Expose default Flask port (optional, in case you want to map it)
EXPOSE 5000

# Command to run the app
CMD ["python", "app.py"]
