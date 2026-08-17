from a2wsgi import ASGIMiddleware

from server.main import app

application = ASGIMiddleware(app)
