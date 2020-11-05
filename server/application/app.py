from flask import Flask
app = Flask(__name__)


@app.route("/generate")
def hello():
    return "Hello, World!"
