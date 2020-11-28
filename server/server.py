from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")


@app.route("/")
def hello():
    return "Hello, there!"


@socketio.on('testing')
def handle_message(message):
    print("received Message: " + message)
    emit('testing', message)


if __name__ == "__main__":
    print("running app!")
    socketio.run(app)
