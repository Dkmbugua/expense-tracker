# In backend/__init__.py
from flask import Flask, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, login_user
from flask_migrate import Migrate
import os


db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_app():
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database/expense_tracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.urandom(24).hex()
    app.config['SESSION_TYPE'] = 'filesystem'

    login_manager.init_app(app)
    CORS(app, supports_credentials=True)
    db.init_app(app)
    migrate = Migrate(app, db)

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

    @app.before_request
    def verify_token():
        if request.path.startswith('/static/') or request.path == '/':
            return
        token = request.headers.get('Authorization')
        if token and token.startswith('token_'):
            username = token.split('_')[1]
            user = User.query.filter_by(username=username).first()
            if user and not current_user.is_authenticated:
                login_user(user)

    return app