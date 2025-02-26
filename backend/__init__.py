import logging
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager
from flask_migrate import Migrate
import os


# Initialize the database
db = SQLAlchemy()

# Initialize Flask-Login globally
login_manager = LoginManager()
login_manager.login_view = 'auth.login'  # Redirect to login if not authenticated

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def load_user(user_id):
    from .models import User
    return User.query.get(int(user_id))

def create_app():
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='')  # Initialize the Flask app
    
    # Configuration for SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database/expense_tracker.db'  # Database path
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modification tracking (for performance)
    app.config['SECRET_KEY'] = 'your-secret-key-here'  # Replace with a secure secret key
    
    # Initialize Flask-Login with the app
    login_manager.init_app(app)
    
    CORS(app)  # Enable Cross-Origin Resource Sharing
    
    db.init_app(app)  # Connect the database with the app
    
    # Initialize Flask-Migrate
    migrate = Migrate(app, db)
    
    # Set up logging
    logging.basicConfig(level=logging.DEBUG)
    
    # Import and register blueprints from the routes directory
    from .routes.auth import auth_bp
    from .routes.ai import ai_bp
    from .routes.expenses import expenses_bp
    from .routes.dashboard import dashboard_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(ai_bp, url_prefix='/ai')
    app.register_blueprint(expenses_bp, url_prefix='/expenses')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    
    @app.route('/')
    def serve():
        return send_from_directory(app.static_folder, 'index.html')

    @app.errorhandler(404)
    def not_found(e):
        return send_from_directory(app.static_folder, 'index.html')

    return app