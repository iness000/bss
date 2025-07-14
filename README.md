# Battery Swapping Station (BSS) Management System

A comprehensive smart battery swapping station system built with modern web technologies, featuring real-time MQTT communication, IoT integration, and administrative dashboards.

## 🚀 System Overview

The BSS Management System is designed to automate and monitor electric vehicle battery swapping operations. It provides a complete solution for station management, user authentication, battery health monitoring, and swap activity tracking.

### Key Components

- **Backend API**: Flask-based REST API with MySQL database
- **Admin Dashboard**: React-based admin interface for system management
- **Frontend Dashboard**: User-facing interface for battery swap operations
- **MQTT Communication**: Real-time IoT communication for station hardware
- **Simulated Hardware**: Testing tools for development and demonstration

## 🏗️ Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │ Frontend Dash   │    │  MQTT Devices   │
│   (React/TS)    │    │   (React/TS)    │    │   (Python)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     Backend API         │
                    │   (Flask + SQLAlchemy)  │
                    │   + SocketIO + MQTT     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     MySQL Database      │
                    │   (Users, Batteries,    │
                    │   Stations, Swaps)      │
                    └─────────────────────────┘
```

## 📁 Project Structure

```text
bss/
├── AdminBoard/                 # Admin Dashboard (React + TypeScript)
│   ├── src/
│   │   ├── pages/             # Dashboard pages
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # React context providers
│   │   └── utils/            # Utility functions
│   └── package.json
├── frontendDashboard/         # User Dashboard (React + TypeScript)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── types/           # TypeScript type definitions
│   │   └── Hooks/           # Custom hooks
│   └── package.json
├── backend/                   # Flask API Server
│   ├── routes/               # API route handlers
│   ├── mqtt/                # MQTT communication handlers
│   ├── models.py            # Database models
│   ├── app.py              # Main Flask application
│   └── requirements.txt
└── mqtt_comm/                # MQTT simulation tools
    └── bss_simulated_card.py # RFID card simulator
```

## 🛠️ Technologies Used

### Backend

- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **Flask-SocketIO** - Real-time WebSocket communication
- **paho-mqtt** - MQTT client for IoT communication
- **MySQL** - Primary database
- **eventlet** - Asynchronous networking

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Lucide React** - Icon library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MySQL 8.0+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/iness000/bss.git
cd bss
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE bss_db;
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Run the Flask application
python app.py
```

The backend will start on `http://localhost:5000`

### 4. Admin Dashboard Setup

```bash
cd AdminBoard
npm install
npm run dev
```

The admin dashboard will start on `http://localhost:5173`

### 5. Frontend Dashboard Setup

```bash
cd frontendDashboard
npm install
npm run dev
```

The user dashboard will start on `http://localhost:5174`

### 6. MQTT Simulator (Optional)

```bash
cd mqtt_comm
python bss_simulated_card.py
```

## 📊 Features

### Admin Dashboard

- **User Management** - Create, update, and manage user accounts
- **Battery Management** - Monitor battery health, status, and assignments
- **Station Management** - Configure and monitor swap stations
- **Swap Activity Monitoring** - Track all battery swap transactions
- **Real-time Analytics** - Live system statistics and health metrics

### User Dashboard

- **Weather Integration** - Real-time weather data display
- **Battery Swap Flow** - Step-by-step swap process guidance
- **RFID Authentication** - Secure user authentication via RFID cards
- **Battery Health Monitoring** - Real-time battery status information
- **Session Management** - Complete swap session tracking

### Backend API

- **RESTful APIs** - Comprehensive CRUD operations
- **Real-time Communication** - WebSocket support for live updates
- **MQTT Integration** - IoT device communication
- **Authentication** - Secure user authentication system
- **Health Monitoring** - Battery and system health tracking

## 🔧 API Endpoints

### User Management

- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Battery Management

- `GET /api/batteries` - List all batteries
- `POST /api/batteries` - Add new battery
- `PUT /api/batteries/{id}` - Update battery
- `GET /api/batteries/{id}/health-logs` - Battery health history

### Station Management

- `GET /api/stations` - List all stations
- `POST /api/stations` - Create new station
- `GET /api/stations/{id}/batteries` - Station batteries

### Swap Operations

- `GET /api/swaps` - List all swaps
- `POST /api/swaps` - Create new swap record
- `PUT /api/swaps/{id}` - Update swap record

## 🔌 MQTT Communication

The system uses MQTT for real-time communication with IoT devices:

### Topics

- `bss/{station_id}/auth/request` - RFID authentication requests
- `bss/{station_id}/auth/response` - Authentication responses
- `bss/{station_id}/swap/initiate` - Battery swap initiation
- `bss/{station_id}/swap/result` - Swap completion results
- `bss/{station_id}/swap/refused` - Swap refusal notifications

### Message Format

```json
{
  "user_id": 123,
  "battery_in_id": "BAT001",
  "battery_out_id": "BAT002",
  "timestamp": "2025-07-14T10:30:00Z",
  "station_id": 1,
  "status": "success"
}
```

## 🧪 Testing

### Development Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd AdminBoard
npm test

cd frontendDashboard
npm test
```

### MQTT Simulation

Use the provided simulator to test MQTT communication:

```bash
cd mqtt_comm
python bss_simulated_card.py
```

## 📱 User Interface

### Admin Dashboard Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Live data refresh via WebSockets
- **Intuitive Navigation** - Easy-to-use interface design
- **Data Visualization** - Charts and graphs for system metrics

### User Dashboard Features

- **Glassmorphism Design** - Modern, translucent UI elements
- **Smooth Animations** - Framer Motion powered transitions
- **Weather Integration** - Real-time weather information
- **Step-by-step Guidance** - Clear battery swap process flow

## 🔐 Security Features

- **RFID Authentication** - Secure user identification
- **Session Management** - Secure session handling
- **Input Validation** - Comprehensive data validation
- **CORS Configuration** - Secure cross-origin requests
- **SSL/TLS Support** - Encrypted MQTT communication

## 🐳 Deployment

### Docker Support

The backend includes a Dockerfile for containerized deployment:

```bash
cd backend
docker build -t bss-backend .
docker run -p 5000:5000 bss-backend
```

### Environment Variables

Configure the following environment variables:

```env
DATABASE_URL=mysql+mysqlconnector://user:password@host:port/database
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
SECRET_KEY=your-secret-key
```

## 📈 Monitoring

### Health Checks

- Battery health monitoring with SOH (State of Health) tracking
- Station connectivity status
- System performance metrics
- Real-time error logging

### Analytics

- Swap frequency analysis
- Battery usage patterns
- User behavior insights
- Station utilization metrics

## 🤝 Contributing

We welcome contributions! See the [CONTRIBUTING](CONTRIBUTING.md) file for details.


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🔮 Future Enhancements

- **Mobile App** - Native iOS and Android applications
- **AI Integration** - Predictive maintenance and optimization
- **Payment Integration** - Multiple payment gateway support
- **Multi-language Support** - Internationalization
- **Advanced Analytics** - Machine learning insights
- **Blockchain Integration** - Decentralized transaction logging

---

Built with ❤️ by Ines Bourouissi
