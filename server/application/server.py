from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)


@app.route("/")
def hello():
    return "Hello, there!"


@socketio.on('message')
def handle_message(message):
    print("received Message: " + message)


if __name__ == "__main__":
    socketio.run(app)
