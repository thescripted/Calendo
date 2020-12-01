from flask import Flask
from flask_socketio import SocketIO, send, emit
import redis
import sys
DEV_CLIENT_URL = 'http://localhost:3000'

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret!'
r = redis.Redis(host='localhost', port=6379, db=0)
socketio = SocketIO(app, cors_allowed_origins=DEV_CLIENT_URL)


@socketio.on("message")
def handle_message(msg):
    send("Howdy!", broadcast=True)


@socketio.on("event://calendar")
def handle_calendar(msg):
    r.set('default', msg)
    emit('event://calendar', r.get('default').decode(), broadcast=True)
    print("fired off an event!")


@socketio.on("event://init")
def handle_init(msg):
    current_state = r.get('default')
    if current_state is not None:
        emit('event://init', current_state.decode())
        print("fired off an event!")


if __name__ == "__main__":
    print("running app!", file=sys.stderr)
    socketio.run(app)
