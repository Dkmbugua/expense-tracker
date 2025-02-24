from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask import render_template
from flask_login import LoginManager

# Initialize the database
db = SQLAlchemy()

# Initialize Flask-Login globally
login_manager = LoginManager()
login_manager.login_view = 'auth.login'  # Redirect to login if not authenticated

def load_user(user_id):
    from .models import User
    return User.query.get(int(user_id))

def create_app():
    app = Flask(__name__)  # Initialize the Flask app
    
    # Configuration for SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database/expenses.db'  # Database path
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modification tracking (for performance)
    app.config['SECRET_KEY'] = 'your-secret-key-here'  # Replace with a secure secret key
    
    # Initialize Flask-Login with the app
    login_manager.init_app(app)
    
    CORS(app)  # Enable Cross-Origin Resource Sharing
    
    db.init_app(app)  # Connect the database with the app
    
    # Import and register blueprints from the routes directory
    from .routes.auth import auth_bp
    from .routes.ai import ai_bp
    from .routes.expenses import expenses_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(ai_bp, url_prefix='/ai')
    app.register_blueprint(expenses_bp, url_prefix='/expenses')
    
    @app.route('/')
    def home():
        return "Expense Tracker Backend is Running!"
    
    @app.route('/landing')  # Changed to avoid conflict with home
    def landing_page():
        return render_template('landing.html')

    return app