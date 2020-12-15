from flask import Flask
from flask_socketio import SocketIO, send, emit
import redis
import sys
from rejson import Client, Path
import json
DEV_CLIENT_URL = 'http://localhost:3000'

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret!'
r = redis.Redis(host='localhost', port=6379, db=0)
rj = Client(host='localhost', port=6379, decode_responses=True)
socketio = SocketIO(app, cors_allowed_origins=DEV_CLIENT_URL)
jsparser = json.JSONDecoder()
json_serializer = json.JSONEncoder()


@socketio.on("message")
def handle_message(msg):
    send("Howdy!", broadcast=True)


@socketio.on("event://calendar")
def handle_calendar(msg):
    json_msg = jsparser.decode(msg)
    rj.jsonset('blank', Path.rootPath(), json_msg)
    serialized_msg = json_serializer.encode(rj.jsonget('blank'))
    emit('event://calendar', serialized_msg, broadcast=True)
    print("fired off an event!")


@socketio.on("event://init")
def handle_init(msg):
    json_state = rj.jsonget('blank')
    print(json_state, file=sys.stderr)
    if json_state is not None:
        emit('event://init', json_serializer.encode(json_state))
        print("fired off an event!")


if __name__ == "__main__":
    print("running app!", file=sys.stderr)
    socketio.run(app)
