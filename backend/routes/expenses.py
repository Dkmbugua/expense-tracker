from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, Expense, Income, Category
from datetime import datetime

expenses_bp = Blueprint('expenses', __name__)

# Fetch All Transactions (Expenses & Income)
@expenses_bp.route('/', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    
    expenses = Expense.query.filter_by(user_id=user_id).all()
    incomes = Income.query.filter_by(user_id=user_id).all()
    
    transactions = [{
        "id": e.id,
        "name": e.name,
        "amount": e.amount,
        "date": e.date.strftime('%Y-%m-%d'),
        "category": e.category_expense.name if e.category_expense else "Uncategorized",
        "type": "Expense"
    } for e in expenses]

    transactions += [{
        "id": i.id,
        "name": i.name,
        "amount": i.amount,
        "date": i.date.strftime('%Y-%m-%d'),
        "category": "Income",
        "type": "Income"
    } for i in incomes]

    return jsonify(transactions), 200

# Add New Transaction (Expense or Income)
@expenses_bp.route('/add', methods=['POST'])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get("name") or not data.get("amount"):
        return jsonify({"message": "Name and amount are required"}), 400

    is_income = data.get("is_income", False)
    category_id = data.get("category_id") if not is_income else None

    if not is_income and not category_id:
        return jsonify({"message": "Category ID is required for expenses"}), 400

    if is_income:
        new_transaction = Income(
            user_id=user_id,
            name=data["name"],
            amount=data["amount"],
            date=datetime.utcnow()
        )
    else:
        new_transaction = Expense(
            user_id=user_id,
            name=data["name"],
            amount=data["amount"],
            date=datetime.utcnow(),
            category_id=category_id
        )

    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({
        "id": new_transaction.id,
        "name": new_transaction.name,
        "amount": new_transaction.amount,
        "date": new_transaction.date.strftime('%Y-%m-%d'),
        "category": category_id if not is_income else "Income",
        "type": "Income" if is_income else "Expense"
    }), 201

# Delete a Transaction
@expenses_bp.route('/delete/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(id):
    user_id = get_jwt_identity()

    expense = Expense.query.filter_by(id=id, user_id=user_id).first()
    income = Income.query.filter_by(id=id, user_id=user_id).first()

    if expense:
        db.session.delete(expense)
    elif income:
        db.session.delete(income)
    else:
        return jsonify({"message": "Transaction not found"}), 404

    db.session.commit()
    return jsonify({"message": "Transaction deleted successfully"}), 200

# Fetch Expenses by Category
@expenses_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_expenses_by_category():
    user_id = get_jwt_identity()

    category_expenses = db.session.query(
        Category.name, db.func.sum(Expense.amount)
    ).join(Expense).filter(
        Expense.user_id == user_id
    ).group_by(Category.name).all()

    category_data = {name: total for name, total in category_expenses}

    return jsonify(category_data), 200