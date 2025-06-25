from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from models import db
from mqtt.mqtt_auth_listener import start_mqtt_listener
import threading
from flask_socketio import SocketIO




# Import Blueprints
from routes.user_routes import user_bp
from routes.rfid_card_routes import rfid_card_bp
from routes.battery_routes import battery_bp
from routes.battery_health_log_routes import battery_health_log_bp
from routes.monthly_billing_routes import monthly_billing_bp
from routes.subscription_plan_routes import subscription_plan_bp
from routes.station_routes import station_bp
from routes.slot_routes import slot_bp
from routes.swap_routes import swap_bp
from flask_migrate import Migrate
import eventlet
import eventlet.wsgi

eventlet.monkey_patch()  # 💡 Important: Needed for eventlet to work well with socketio



load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
# 🔌 Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# ✅ Pass socketio instance to your MQTT module later
app.config['socketio'] = socketio

# 🔧 Database Configuration
# 🔧 Database Configuration (Local MySQL)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+mysqlconnector://root:ines123@127.0.0.1:3306/bss_db"


db.init_app(app)

with app.app_context():
    db.create_all() # Create tables

# Register Blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(rfid_card_bp, url_prefix='/api')
app.register_blueprint(battery_bp, url_prefix='/api')
app.register_blueprint(battery_health_log_bp, url_prefix='/api')
app.register_blueprint(monthly_billing_bp, url_prefix='/api')
app.register_blueprint(subscription_plan_bp, url_prefix='/api')
app.register_blueprint(station_bp, url_prefix='/api')
app.register_blueprint(slot_bp, url_prefix='/api')
app.register_blueprint(swap_bp, url_prefix='/api')

@app.route('/')
def hello():
    return jsonify({"message": "Hello from Flask! Database connected."})

if __name__ == '__main__':
     # Only start MQTT when not in reloader process
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        threading.Thread(target=start_mqtt_listener, args=(app,), daemon=True).start()

        print("🚀 MQTT Listener started...")


    

    socketio.run(app, debug=True, port=5000)
    