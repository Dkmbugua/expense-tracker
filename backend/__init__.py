from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager
from flask_migrate import Migrate
import os
from flask_jwt_extended import JWTManager

db = SQLAlchemy()  # ✅ Ensure this is the ONLY instance of SQLAlchemy
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
jwt = JWTManager()  # ✅ Initialize JWT

def create_app():
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

    # ✅ Correct JWT configuration
    
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour expiration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database/expense_tracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.urandom(24).hex()
    app.config['SESSION_TYPE'] = 'filesystem'

    db.init_app(app)  # ✅ Initialize DB first
    jwt.init_app(app)  # ✅ Initialize JWT AFTER setting configs
    login_manager.init_app(app)
    CORS(app, supports_credentials=True)
    migrate = Migrate(app, db)

    from .models import User  # ✅ Move User import after db.init_app(app)

    # ✅ Import Blueprints
    from .routes.auth import auth_bp
    from .routes.expenses import expenses_bp
    from .routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(expenses_bp, url_prefix='/expenses')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

    @app.route('/')
    def serve():
        return send_from_directory(app.static_folder, 'index.html')

    @app.errorhandler(404)
    def not_found(e):
        return send_from_directory(app.static_folder, 'index.html')

    return app

@login_manager.user_loader
def load_user(user_id):
    from .models import User  # Avoid top-level import
    return User.query.get(int(user_id))
