from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from .import create_app, db

app = create_app()

with app.app_context():
      
    db.create_all()  # Create all tables
    print("Database initialized successfully.")