FROM python:3.11-slim

# System deps: espeak-ng for kokoro TTS, libsndfile1 for soundfile
RUN apt-get update && apt-get install -y \
    libgl1 \
    espeak-ng \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Source is mounted at runtime via docker-compose volume
# This COPY is a fallback for running the image standalone
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
