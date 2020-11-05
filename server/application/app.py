from flask import Flask, request
from flask_restful import Resource, Api, reqparse
import hashlib
import base64

app = Flask(__name__)
api = Api(app)
todos = {}


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


def generate_ws_header(ws_key):
    """generates a websocket acceptance header,
       creating a unique id with the key"""

    # RFC 6455 - 4.2.2
    key_to_hash = str.encode(ws_key) + b"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    print(key_to_hash)
    m = hashlib.sha1()
    m.update(key_to_hash)
    key_hash_bytes = m.digest()
    print(key_hash_bytes)

    return {"Upgrade": "websocket",
            "Connection": "Upgrade",
            "Sec-Socket-Accept": base64.b64encode(key_hash_bytes)}


class WebSocket(Resource):
    def get(self):
        # Required: Check Origin header for security
        try:
            args = wsparser.parse_args()
            upgrade = args['Upgrade']
            connection = args['Connection']
            ws_key = args['Sec-WebSocket-Key']
            print(upgrade, connection, args)
            ws_accepted_handshake_headers = generate_ws_header(ws_key)
            # Switching Protocol:
            return "", 101, ws_accepted_handshake_headers
        except ValueError:
            return 400


class HelloWorld(Resource):
    def get(self, todo_id):
        return {todo_id: todos[todo_id]}

    def put(self, todo_id):
        print(todo_id)
        todos[todo_id] = request.form['data']
        return {todo_id: todos[todo_id]}


api.add_resource(HelloWorld, '/<string:todo_id>')
api.add_resource(WebSocket, '/')


if __name__ == "__main__":
    app.run(debug=True, port=5000)
