from flask import Flask, request
import eventlet
import eventlet.wsgi
import eventlet.green
import uwsgi


app = Flask(__name__)

host = '127.0.0.1'
port = '3030'


@app.route("/")
def hello():
    addresses = eventlet.green.socket.getaddrinfo(host, port)
    print(addresses[0][0])
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
