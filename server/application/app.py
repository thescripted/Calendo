import os
import requests
from flask import Flask, request

api_port = os.environ['PORT_API']
api_url = f'http://slow_api_test:{api_port}/'

app = Flask(__name__)


@app.route('/')
def index():
    delay = float(request.args.get('delay') or 1)
    resp = requests.get(f'{api_url}?delay={delay}')
    return 'Hi there! ' + resp.text


# Only for debugging purposes
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=80)
