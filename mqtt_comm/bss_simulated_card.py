import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime

STATION_ID = "1"
BROKER = "localhost"
PORT = 8883



client = mqtt.Client(client_id="simulated_card", protocol=mqtt.MQTTv311)




def on_connect(client, userdata, flags, rc):
    print("✅ Connected to broker.")
    client.subscribe(f"bss/{STATION_ID}/user/auth/response")
    client.subscribe(f"bss/{STATION_ID}/swap/confirmation")
    client.subscribe(f"bss/{STATION_ID}/swap/error")

def on_message(client, userdata, msg):
    print(f"📥 Received from {msg.topic}: {msg.payload.decode()}")
    payload = json.loads(msg.payload.decode())
    
    if msg.topic.endswith("user/auth/response"):
        if payload.get("status") == "success":
            print("🔓 Access granted. Proceeding to swap.")
            simulate_swap(payload["user_id"])
        else:
            print(f"❌ Access denied: {payload.get('message')}")
    
    elif msg.topic.endswith("swap/confirmation"):
        if payload.get("status") == "success":
            print("✅ Swap successfully recorded!")
            print(f"✅ Swap ID: {payload.get('swap_id')}")
            print(f"✅ Timestamp: {payload.get('timestamp')}")
        else:
            print(f"⚠️ Unexpected confirmation status: {payload.get('status')}")
    
    elif msg.topic.endswith("swap/error"):
        print(f"❌ Swap recording failed: {payload.get('message')}")
        print(f"❌ Error: {payload.get('error')}")
        print(f"❌ Timestamp: {payload.get('timestamp')}")
    else:
        print("❌ Access denied.")

def simulate_auth_request():
    data = {
        "rfid": "A1B2C3D4",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    client.publish(f"bss/{STATION_ID}/user/auth/request", json.dumps(data), qos=1)
    print("📤 Sent auth/request")

def simulate_swap(user_id):
    # Simulate battery values
    soh = 80  # Simulate a weak battery for rejection test
    soc = 82
    temperature = 34.5

    if soh < 70:
        refused_data = {
            "user_id": user_id,
            "battery_id": "1",
            "status": "rejected",
            "reason": "Battery health below threshold",
            "soc": soc,
            "soh": soh,
            "temperature": temperature,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        client.publish(f"bss/{STATION_ID}/swap/refused", json.dumps(refused_data), qos=1)
        print("📤 Sent swap/refused")
        return

    # If accepted:
    swap_data = {
        "user_id": user_id,
        "battery_in_id": "7",
        "battery_in_health_status": "accepted",
        "soc": soc,
        "voltage": 52.3,
        "temperature": temperature,
        "soh": soh,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    client.publish(f"bss/{STATION_ID}/swap/initiate", json.dumps(swap_data), qos=1)
    print("📤 Sent swap/initiate")

    time.sleep(1)

    log_data = {
        "battery_in_id": "7",
        "battery_out_id": "3",
        "user_id": user_id,
        "battery_in_data": {"soc": soc, "soh": soh},
        "battery_out_data": {"soc": 95, "soh": 90},
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    client.publish(f"bss/{STATION_ID}/swap/activity", json.dumps(log_data), qos=2)
    print("📤 Sent swap/activity")





client.on_connect = on_connect
client.on_message = on_message
client.tls_set("C:/Program Files/mosquitto/certs/ca.crt")  # ✅ Correct path to ca.crt
client.tls_insecure_set(True)  # ✅ Skip strict cert verification (dev-safe)
client.connect(BROKER, PORT, 60)

client.loop_start()
simulate_auth_request()
time.sleep(10)
client.loop_stop()
