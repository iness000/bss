# BSS Backend API

A robust Flask-based REST API server for the Battery Swapping Station (BSS) management system with real-time MQTT communication, WebSocket support, and comprehensive database management.

## 🚀 Features

### 🔌 Core Technologies

- **Flask** - Web framework with RESTful API design
- **SQLAlchemy** - ORM for database operations with MySQL
- **Flask-SocketIO** - Real-time WebSocket communication
- **paho-mqtt** - MQTT client for IoT device communication
- **Eventlet** - Asynchronous networking for real-time features

### 📊 Database Management

- **User Management** - Complete user lifecycle with authentication
- **Battery Tracking** - Health monitoring and status management
- **Station Operations** - Multi-station support with slot management
- **Swap Transactions** - Complete transaction history and billing
- **RFID Integration** - Secure card-based authentication

### 🔄 Real-time Communication

- **MQTT Broker Integration** - Secure SSL/TLS communication
- **WebSocket Support** - Live updates to frontend clients
- **Event-driven Architecture** - Asynchronous message handling
- **IoT Device Communication** - Station hardware integration

## 🏗️ Project Structure

```text
backend/
├── app.py                          # Main Flask application
├── models.py                       # SQLAlchemy database models
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Container configuration
├── routes/                         # API route handlers
│   ├── user_routes.py             # User management endpoints
│   ├── battery_routes.py          # Battery operations
│   ├── station_routes.py          # Station management
│   ├── swap_routes.py             # Swap transactions
│   ├── rfid_card_routes.py        # RFID card operations
│   ├── slot_routes.py             # Station slot management
│   ├── battery_health_log_routes.py # Health monitoring
│   ├── subscription_plan_routes.py # Billing plans
│   └── monthly_billing_routes.py  # Billing operations
├── mqtt/                           # MQTT communication layer
│   ├── mqtt_auth_listener.py      # MQTT client setup
│   ├── mqtt_handlers.py           # Message handlers
│   └── mqtt_utils.py              # Utility functions
└── certs/                          # SSL certificates for MQTT
    ├── ca.crt                      # Certificate Authority
    ├── broker.crt                  # Broker certificate
    └── client.crt                  # Client certificate
```

## 🔧 Database Models

### Core Entities

#### Users

- Personal information and contact details
- License and motorcycle information
- Subscription plan associations
- Authentication and role management

#### Batteries

- Health status and capacity tracking
- Station and slot assignments
- Lifecycle management
- Real-time status updates

#### Stations

- Location and capacity information
- Operational status monitoring
- Slot management
- Maintenance scheduling

#### RFID Cards

- User associations
- Battery assignments
- Security and access control
- Transaction tracking

#### Swap Transactions

- Complete swap history
- Battery health logging
- Billing calculations
- Session management

## 📡 API Endpoints

### User Management

```text
GET    /api/users              # List all users
POST   /api/users              # Create new user
GET    /api/users/{id}          # Get user details
PUT    /api/users/{id}          # Update user
DELETE /api/users/{id}          # Delete user
```

### Battery Operations

```text
GET    /api/batteries          # List all batteries
POST   /api/batteries          # Add new battery
GET    /api/batteries/{id}      # Get battery details
PUT    /api/batteries/{id}      # Update battery status
GET    /api/batteries/{id}/health-logs  # Health history
```

### Station Management

```text
GET    /api/stations           # List all stations
POST   /api/stations           # Create new station
GET    /api/stations/{id}       # Get station details
PUT    /api/stations/{id}       # Update station
GET    /api/stations/{id}/batteries  # Station inventory
```

### Swap Operations

```text
GET    /api/swaps              # List all swaps
POST   /api/swaps              # Create swap record
GET    /api/swaps/{id}          # Get swap details
PUT    /api/swaps/{id}          # Update swap status
```

### RFID Management

```text
GET    /api/rfid-cards         # List all cards
POST   /api/rfid-cards         # Register new card
GET    /api/rfid-cards/{code}   # Lookup by RFID code
PUT    /api/rfid-cards/{id}     # Update card
DELETE /api/rfid-cards/{id}     # Deactivate card
```

## 🔌 MQTT Communication

### Topics Structure

```text
bss/{station_id}/auth/request     # RFID authentication requests
bss/{station_id}/auth/response    # Authentication responses
bss/{station_id}/swap/initiate    # Battery swap initiation
bss/{station_id}/swap/result      # Swap completion results
bss/{station_id}/swap/refused     # Swap refusal notifications
bss/{station_id}/battery/status   # Battery status updates
bss/{station_id}/station/status   # Station status updates
```

### Message Format

```json
{
  "user_id": 123,
  "battery_in_id": "BAT001",
  "battery_out_id": "BAT002",
  "timestamp": "2025-07-14T10:30:00Z",
  "station_id": 1,
  "status": "success",
  "health_data": {
    "soh": 85,
    "voltage": 72.5,
    "capacity": 45.2
  }
}
```

### SSL/TLS Security

- Certificate-based authentication
- Encrypted communication channels
- Secure device identity verification
- Protected message integrity

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- MySQL 8.0+
- MQTT Broker (Mosquitto recommended)
- SSL certificates for MQTT

### 1. Environment Setup

```bash
# Clone and navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Configuration

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE bss_db;

# Configure database connection in app.py
# Update SQLALCHEMY_DATABASE_URI with your credentials
```

### 3. MQTT Setup

```bash
# Configure MQTT broker settings
# Update mqtt_auth_listener.py with your broker details
# Ensure SSL certificates are in the certs/ directory
```

### 4. Run the Application

```bash
# Start the Flask application
python app.py
```

The API server will start on `http://localhost:5000`

## 🔐 Security Features

### Authentication & Authorization

- RFID-based user authentication
- Role-based access control
- Session management
- Secure password hashing

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- SSL/TLS encryption for MQTT

### Monitoring & Logging

- Real-time health monitoring
- Transaction logging
- Error tracking
- Performance metrics

## 🐳 Docker Deployment

### Build Container

```bash
docker build -t bss-backend .
```

### Run Container

```bash
docker run -p 5000:5000 \
  -e DATABASE_URL=mysql+mysqlconnector://user:pass@host:3306/db \
  -e MQTT_BROKER_HOST=your-broker-host \
  bss-backend
```

## 🧪 Development & Testing

### API Testing

```bash
# Test endpoints with curl
curl -X GET http://localhost:5000/api/users
curl -X POST http://localhost:5000/api/batteries \
  -H "Content-Type: application/json" \
  -d '{"battery_id":"BAT001","capacity":50}'
```

### MQTT Testing

```bash
# Subscribe to topics
mosquitto_sub -h localhost -p 8883 \
  --cafile certs/ca.crt \
  -t "bss/+/auth/request"

# Publish test messages
mosquitto_pub -h localhost -p 8883 \
  --cafile certs/ca.crt \
  -t "bss/1/auth/request" \
  -m '{"rfid_code":"ABC123","station_id":1}'
```

## 📊 Performance Features

### Asynchronous Operations

- Eventlet-based async processing
- Non-blocking MQTT communication
- Real-time WebSocket updates
- Background task processing

### Database Optimization

- Connection pooling
- Query optimization
- Index management
- Transaction management

### Scalability

- Horizontal scaling support
- Load balancing ready
- Microservice architecture
- Container orchestration ready

## 🔧 Configuration

### Environment Variables

```env
DATABASE_URL=mysql+mysqlconnector://user:password@host:port/database
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=8883
MQTT_CA_CERT_PATH=certs/ca.crt
SECRET_KEY=your-secret-key
DEBUG=False
```

### SSL Certificate Setup

1. Generate CA certificate
2. Create broker certificate
3. Generate client certificates
4. Configure MQTT client with certificates

## 📈 Monitoring & Analytics

### Health Checks

- Database connectivity
- MQTT broker status
- API endpoint health
- System resource usage

### Metrics Collection

- Swap transaction rates
- Battery health trends
- Station utilization
- User activity patterns

### Real-time Dashboards

- Live system status
- Performance metrics
- Error rates
- Capacity monitoring

This backend provides a robust, scalable foundation for the BSS management system with comprehensive API coverage, real-time communication, and enterprise-grade security features.
