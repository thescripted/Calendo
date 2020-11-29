from flask import Flask
from flask_socketio import SocketIO, send
import sys

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret!'


socketio = SocketIO(app, cors_allowed_origins='http://localhost:3000')
print(socketio, file=sys.stderr)


@app.route("/")
def hello():
    print("Howdy!", file=sys.stderr)
    return "Hello, there!"


@socketio.on("message")
def handleMessage(msg):
    print("Message: " + msg, file=sys.stderr)
    send("Howdy!", broadcast=True)


if __name__ == "__main__":
    print("running app!", file=sys.stderr)
    socketio.run(app)
