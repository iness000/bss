# 1. Base image
FROM python:3.11-slim

# 2. Create app directory
WORKDIR /app

# 3. Install dependencies
RUN pip install eventlet
COPY certs/ ./certs/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy app source
COPY . .

# 5. Expose the port your Flask app listens on
EXPOSE 5000

# 6. Run the app
#    - If you use app.py with Flask app named "app":
CMD ["python", "app.py"]


