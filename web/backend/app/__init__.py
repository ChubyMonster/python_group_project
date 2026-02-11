from __future__ import annotations

import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///bibliotheque.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    cors_origins = os.getenv("CORS_ORIGINS", "*")
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

    db.init_app(app)
    migrate.init_app(app, db)

    from app.api.livres import bp as rabia_bp
    app.register_blueprint(rabia_bp, url_prefix="/api")

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    return app
