from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from ..models import User, Expense
from .. import db
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@login_required
def get_dashboard_summary():
    user_id = current_user.id
    today = datetime.today()
    start_of_month = today.replace(day=1)
    start_of_week = today - timedelta(days=today.weekday())

    # Total spending this month
    total_spending_month = db.session.query(
        db.func.sum(Expense.amount)
    ).filter(
        Expense.user_id == user_id,
        Expense.date >= start_of_month
    ).scalar() or 0

    # Today's spending
    total_spending_today = db.session.query(
        db.func.sum(Expense.amount)
    ).filter(
        Expense.user_id == user_id,
        Expense.date >= today.replace(hour=0, minute=0, second=0, microsecond=0)
    ).scalar() or 0

    # Average daily spend
    days_in_month = (today - start_of_month).days + 1
    average_daily_spend = total_spending_month / days_in_month

    # Expense list
    expenses = Expense.query.filter_by(user_id=user_id).all()
    expense_list = [
        {
            "id": expense.id,
            "date": expense.date.strftime('%Y-%m-%d'),
            "description": expense.name,
            "category": expense.category,
            "amount": expense.amount
        }
        for expense in expenses
    ]

    # Spending trend (last 30 days)
    last_30_days = today - timedelta(days=30)
    spending_trend = db.session.query(
        db.func.date(Expense.date).label('date'),
        db.func.sum(Expense.amount).label('total')
    ).filter(
        Expense.user_id == user_id,
        Expense.date >= last_30_days
    ).group_by('date').order_by('date').all()
    spending_trend = [{"date": str(date), "total": total} for date, total in spending_trend]

    summary = {
        "total_spending_month": total_spending_month,
        "total_spending_today": total_spending_today,
        "average_daily_spend": average_daily_spend,
        "expenses": expense_list,
        "spending_trend": spending_trend
    }
    
    return jsonify(summary), 200