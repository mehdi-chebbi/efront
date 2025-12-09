FROM python:3.11-slim

WORKDIR /app

# Copy everything
COPY . /app

# Install Python deps you actually need
RUN pip install --no-cache-dir \
    flask \
    flask-cors \
    cohere

EXPOSE 5000

CMD ["python", "chatbot_api.py"]
