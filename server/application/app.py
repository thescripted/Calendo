from flask import Flask, request
import uwsgi


app = Flask(__name__)


@app.route("/")
def hello():
    return "<h1 style='color:blue'>Hello!</h1>"


@app.route("/websocket")
def ws():
    # Complete the handshake
    uwsgi.websocket_handshake(request.environ['HTTP_SEC_WEBSOCKET_KEY'],
                              request.environ.get('HTTP_ORIGIN', ''))
    uwsgi.websocket_send("Completed handshake!")
    # Holds the connection, and echos.
    while True:
        msg = uwsgi.websocket_recv()
        uwsgi.websocket_send(msg)
