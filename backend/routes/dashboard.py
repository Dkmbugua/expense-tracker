from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload
from backend.models import User, Expense, Income, Category
from .. import db
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    user_id = get_jwt_identity()

    print(f"Fetching dashboard summary for user: {user_id}")

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    today = datetime.utcnow().date()
    start_of_month = today.replace(day=1)

    total_expenses = db.session.query(db.func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        Expense.date >= start_of_month
    ).scalar() or 0

    total_income = db.session.query(db.func.sum(Income.amount)).filter(
        Income.user_id == user_id,
        Income.date >= start_of_month
    ).scalar() or 0

    total_balance = total_income - total_expenses

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    today_expenses = db.session.query(db.func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        Expense.date >= today_start
    ).scalar() or 0

    today_income = db.session.query(db.func.sum(Income.amount)).filter(
        Income.user_id == user_id,
        Income.date >= today_start
    ).scalar() or 0

    category_expenses = db.session.query(
        Category.name, db.func.sum(Expense.amount)
    ).join(Expense).filter(
        Expense.user_id == user_id,
        Expense.date >= start_of_month
    ).group_by(Category.name).all()

    category_data = {name: total for name, total in category_expenses}

    transactions = (
        db.session.query(Expense)
        .filter_by(user_id=user_id)
        .options(joinedload(Expense.category_expense))
        .all()
    ) + (
        db.session.query(Income)
        .filter_by(user_id=user_id)
        .all()
    )

    transaction_list = [
        {
            "id": t.id,
            "date": t.date.strftime('%Y-%m-%d'),
            "description": t.name,
            "category": t.category_expense.name if isinstance(t, Expense) and t.category_expense else "Income",
            "amount": t.amount,
            "type": "Income" if isinstance(t, Income) else "Expense"
        }
        for t in transactions
    ]

    summary = {
        "username": user.username,
        "total_balance": f"Ksh {total_balance:.2f}",
        "total_expenses": f"Ksh {total_expenses:.2f}",
        "total_income": f"Ksh {total_income:.2f}",
        "today_expenses": f"Ksh {today_expenses:.2f}",
        "today_income": f"Ksh {today_income:.2f}",
        "category_expenses": category_data,
        "transactions": transaction_list
    }

    print(f"Dashboard Summary Data: {summary}")

    return jsonify(summary), 200