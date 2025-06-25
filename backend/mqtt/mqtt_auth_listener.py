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
    ca_certs = os.environ.get("CA_CERT_PATH", "certs/ca.crt")
    client.tls_set(ca_certs=ca_certs, tls_version=ssl.PROTOCOL_TLSv1_2)



    # --- Handlers ---
    client.on_connect = handle_connect
    client.on_message = lambda c, u, m: handle_message(c, u, m, app_instance, socketio)

    client.connect(os.getenv("BROKER_HOST", "localhost"), 8883, 60)

    client.loop_forever()
