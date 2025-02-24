from flask import Blueprint

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/ai', methods=['GET'])
def ai():
    return "AI route is working!"