import paho.mqtt.client as mqtt
import ssl
from .mqtt_handlers import handle_connect, handle_message

app_instance = None
socketio = None

def start_mqtt_listener(app):
    global app_instance, socketio
    app_instance = app
    socketio = app.config.get("socketio")

    client = mqtt.Client(client_id="auth_backend", protocol=mqtt.MQTTv311)

    import os
    
    client.tls_set("C:/Program Files/mosquitto/certs/ca.crt")  # ✅ Correct path to ca.crt
    client.tls_insecure_set(True)



    # --- Handlers ---
    client.on_connect = handle_connect
    client.on_message = lambda c, u, m: handle_message(c, u, m, app_instance, socketio)

    client.connect("localhost", 8883, 60)

    client.loop_forever()
