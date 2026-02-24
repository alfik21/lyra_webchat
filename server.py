from os import environ

from flask import Flask

from api.routes_chat import create_app

app: Flask = create_app()

if __name__ == "__main__":
    host = environ.get("LYRA_WEB_HOST", "0.0.0.0")
    port = int(environ.get("LYRA_WEB_PORT", "11447"))
    app.run(host=host, port=port)
