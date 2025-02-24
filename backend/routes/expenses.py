
from flask import Blueprint

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/expenses', methods=['GET'])
def expenses():
    return "Expenses route is working!"

