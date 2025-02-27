from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .. import db
from ..models import Expense, Category

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/expenses', methods=['GET'])
@login_required
def get_expenses():
    expenses = Expense.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        "id": e.id,
        "name": e.name,
        "amount": e.amount,
        "date": e.date.strftime('%Y-%m-%d'),
        "category": e.category.name,
        "is_income": e.is_income
    } for e in expenses]), 200

@expenses_bp.route('/expenses', methods=['POST'])
@login_required
def create_expense():
    data = request.get_json()
    category = Category.query.filter_by(name=data['category'], user_id=current_user.id).first()
    if not category:
        category = Category(name=data['category'], user_id=current_user.id)
        db.session.add(category)
        db.session.commit()
    expense = Expense(
        name=data['name'],
        amount=float(data['amount']),
        date=datetime.strptime(data['date'], '%Y-%m-%d'),
        category_id=category.id,
        user_id=current_user.id,
        is_income=data.get('is_income', False)
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify({"message": "Created successfully", "id": expense.id}), 201

@expenses_bp.route('/expenses/<int:id>', methods=['PUT'])
@login_required
def update_expense(id):
    expense = Expense.query.get_or_404(id)
    if expense.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    category = Category.query.filter_by(name=data['category'], user_id=current_user.id).first()
    if not category:
        category = Category(name=data['category'], user_id=current_user.id)
        db.session.add(category)
        db.session.commit()
    expense.name = data['name']
    expense.amount = float(data['amount'])
    expense.date = datetime.strptime(data['date'], '%Y-%m-%d')
    expense.category_id = category.id
    expense.is_income = data.get('is_income', False)
    db.session.commit()
    return jsonify({"message": "Updated successfully"}), 200

@expenses_bp.route('/expenses/<int:id>', methods=['DELETE'])
@login_required
def delete_expense(id):
    expense = Expense.query.get_or_404(id)
    if expense.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Deleted successfully"}), 200

@expenses_bp.route('/categories', methods=['GET'])
@login_required
def get_categories():
    categories = Category.query.filter_by(user_id=current_user.id).all()
    return jsonify([c.name for c in categories]), 200