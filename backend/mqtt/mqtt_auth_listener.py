import paho.mqtt.client as mqtt
from .mqtt_handlers import handle_connect, handle_message

app_instance = None
socketio = None

def start_mqtt_listener(app):
    global app_instance, socketio
    app_instance = app
    socketio = app.config.get("socketio")

    client = mqtt.Client(client_id="auth_backend", protocol=mqtt.MQTTv311)
    client.on_connect = handle_connect
    client.on_message = lambda c, u, m: handle_message(c, u, m, app_instance, socketio)
    client.connect("localhost", 1883, 60)
    client.loop_forever()
