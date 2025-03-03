from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from . import create_app

app = create_app()

with app.app_context():
    db.create_all()
    print("Database initialized successfully.")