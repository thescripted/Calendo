from flask import Flask
from flask_restful import Resource, Api, reqparse
import hashlib
import base64
from typing import (
        MutableMapping
    )

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

app = Flask(__name__)
api = Api(app)


# Soon to be deprecated. Be sure to move over to Marshmallow soon!
wsparser = reqparse.RequestParser()

# RFC 6455 - 1.3 Opening Handshake
wsparser.add_argument('Host', type=str, required=True,
                      location='headers')
wsparser.add_argument('User-Agent', type=str, required=True,
                      location='headers')
wsparser.add_argument('Upgrade', type=str, required=True,
                      location='headers')
wsparser.add_argument('Connection', type=str, required=True,
                      location='headers')
wsparser.add_argument('Sec-WebSocket-Key', type=str, required=True,
                      location='headers')
wsparser.add_argument('Sec-WebSocket-Version', type=int, required=True,
                      location='headers')


class Headers(MutableMapping[str, str]):
    """
    Data Structure for creating HTTP Headers
    """
    def __init__(self, *args, **kwargs):
        self._dict = {}
        self.update(*args, **kwargs)

    # Methods on MutableMapping
    def __setitem__(self, key, value):
        self._dict.setdefault(key.lower(), []).append(value)

    def __getitem__(self, key):
        value = self._dict[key.lower()]
        return value

    def serialize(self):
        # Headers only contain ASCII characters
        return str(self).encode()

    pass


# -------------------- HANDSHAKE METHODS ------------------------- #
def process_request(restfulargs):
    """
    processes the request submitted from the client. Returns key if successful
    """
    pass


def process_origin(restfulargs):
    """
    minor security validations for origin
    """
    pass


def process_extensions(extensionargs):
    """
    subroutine to process optional extensions
    """
    pass


def build_response(sec_ws_key):
    """
    Builds a HTTP 101 Response with the key input. Establishes the connection
    """
    # Subroutine to properly encode key
    def accept(key):
        sha1key = hashlib.sha1((key + GUID).encode()).digest()
        return base64.b64encode(sha1key).decode()

    wsheaders = Headers()
    wsheaders["Upgrade"] = "websocket"
    wsheaders["Connection"] = "Upgrade"
    wsheaders["Sec-WebSocket-Accept"] = accept(sec_ws_key)
    return "", 101, wsheaders


class WebSocketEndpoint(Resource):
    def get(self):
        # Required: Check Origin header for security
        try:
            swk = process_request(wsparser.parse_args())
            return build_response(swk)
        except ValueError:
            return "", 400


api.add_resource(WebSocketEndpoint, '/')
if __name__ == "__main__":
    app.run(debug=True, port=5000)
