import json
from datetime import datetime
import requests
from .mqtt_utils import extract_station_id
from models import db, RFIDCard


def handle_connect(client, userdata, flags, rc):
    print("✅ MQTT connected.")
    client.subscribe("bss/+/user/auth/request")
    client.subscribe("bss/+/swap/initiate")
    client.subscribe("bss/+/swap/activity")
    client.subscribe("bss/+/swap/refused")


def handle_message(client, userdata, msg, app, socketio):
    print(f"📥 Message received on {msg.topic}")
    data = json.loads(msg.payload.decode())
    station_id = extract_station_id(msg.topic)

    if msg.topic.endswith("user/auth/request"):
        handle_auth_request(client, station_id, data, app, socketio)

    elif msg.topic.endswith("swap/initiate"):
        handle_swap_initiate(station_id, data, socketio)

    elif msg.topic.endswith("swap/activity"):
        handle_swap_activity(client, station_id, data, socketio)

    elif msg.topic.endswith("swap/refused"):
        handle_swap_refused(station_id, data, socketio)


def handle_auth_request(client, station_id, data, app, socketio):
    rfid_code = data.get("rfid")
    with app.app_context():
        card = RFIDCard.query.filter_by(rfid_code=rfid_code).first()
        if card:
            payload = {
                "status": "success",
                "user_id": card.user_id,
                "message": "Access granted",
                "timestamp": data.get("timestamp")
            }
        else:
            payload = {
                "status": "failure",
                "message": "Card not found",
                "timestamp": data.get("timestamp")
            }
        topic = f"bss/{station_id}/user/auth/response"
        client.publish(topic, json.dumps(payload), qos=2)
        print(f"📤 Sent auth response to {topic}")
        socketio.emit("auth_response", payload, broadcast=True)


def handle_swap_initiate(station_id, data, socketio):
    print(f"🔄 Swap initiated by user {data['user_id']} at {station_id}")
    print(f"🔋 Battery in: {data['battery_in_id']} ({data['battery_in_health_status']})")

    payload = {
        "user_id": data["user_id"],
        "battery_id": data["battery_in_id"],
        "health_status": data["battery_in_health_status"],
        "soc": data.get("soc"),
        "soh": data.get("soh"),
        "temperature": data.get("temperature"),
        "timestamp": data.get("timestamp") or datetime.utcnow().isoformat()
    }
    socketio.emit("swap_initiated", payload, broadcast=True)


def handle_swap_activity(client, station_id, data, socketio):
    timestamp = data.get("timestamp")
    if timestamp and timestamp.endswith('Z'):
        timestamp = timestamp[:-1]

    swap_payload = {
        "user_id": data["user_id"],
        "issued_battery_id": data["battery_out_id"],
        "returned_battery_id": data["battery_in_id"],
        "pickup_station_id": station_id,
        "deposit_station_id": station_id,
        "start_time": timestamp,
        "end_time": timestamp,
        "battery_percentage_start": data["battery_in_data"]["soc"],
        "battery_percentage_end": data["battery_out_data"]["soc"],
        "ah_used": 0
    }

    try:
        response = requests.post("http://localhost:5000/api/swaps", json=swap_payload)
        if response.status_code == 201:
            print("📝 Swap successfully saved via API.")
            print(f"API Response: {response.json()}")
            confirmation = {
                "status": "success",
                "message": "Swap recorded successfully",
                "swap_id": response.json().get("swap_id"),
                "timestamp": datetime.utcnow().isoformat()
            }
            client.publish(f"bss/{station_id}/swap/confirmation", json.dumps(confirmation), qos=2)
            print("📤 Sent swap confirmation to simulator")
            socketio.emit("swap_result", confirmation, broadcast=True)
        else:
            print(f"⚠️ Swap API error: {response.status_code} - {response.text}")
            error_msg = {
                "status": "error",
                "message": "Failed to record swap",
                "error": response.text,
                "timestamp": datetime.utcnow().isoformat()
            }
            client.publish(f"bss/{station_id}/swap/error", json.dumps(error_msg), qos=2)
            print("📤 Sent swap error to simulator")
            socketio.emit("swap_result", error_msg, broadcast=True)
    except Exception as e:
        print(f"❌ Failed to call swap API: {e}")
        print(f"API URL: http://localhost:5000/api/swaps")
        print(f"Payload: {swap_payload}")


def handle_swap_refused(station_id, data, socketio):
    print(f"❌ Swap refused at {station_id} for user {data['user_id']}:")
    print(f"🔋 Battery ID: {data['battery_id']}")
    print(f"📉 Reason: {data['reason']}")
    print(f"📊 SOC={data['soc']}%, SOH={data['soh']}%, Temp={data['temperature']}°C")
    refused_payload = {
        "user_id": data['user_id'],
        "battery_id": data['battery_id'],
        "reason": data['reason'],
        "soc": data['soc'],
        "soh": data['soh'],
        "temperature": data['temperature'],
        "timestamp": datetime.utcnow().isoformat()
    }
    socketio.emit("swap_refused", refused_payload, broadcast=True)

