from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models import User, db
from flask_login import login_user, logout_user, login_required
import logging

logging.basicConfig(level=logging.DEBUG)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first():
        logging.debug(f"User {username} already exists.")
        return jsonify({'message': 'User already exists'}), 400

    try:
        new_user = User(username=username, password_hash=generate_password_hash(password))
        db.session.add(new_user)
        db.session.commit()
        logging.debug(f"User {username} registered successfully.")
        return jsonify({'message': 'User registered successfully', 'user_id': new_user.id}), 201
    except Exception as e:
        logging.exception("Error registering user.")
        return jsonify({'message': 'Error registering user'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        login_user(user)  # Log the user in
        return jsonify({'message': 'Login successful', 'user_id': user.id}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200