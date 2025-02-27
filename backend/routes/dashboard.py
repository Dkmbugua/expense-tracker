from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from ..models import Expense
from .. import db
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@login_required
def get_dashboard_summary():
    user_id = current_user.id
    today = datetime.today()
    start_of_month = today.replace(day=1)

    # Expenses and Income this month
    expenses_month = db.session.query(db.func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        Expense.date >= start_of_month,
        Expense.is_income == False
    ).scalar() or 0
    income_month = db.session.query(db.func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        Expense.date >= start_of_month,
        Expense.is_income == True
    ).scalar() or 0
    total_spending_month = expenses_month  # Only expenses count toward spending
    total_income_month = income_month

    # Today's expenses and income
    today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
    total_spending_today = db.session.query(db.func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        Expense.date >= today_start,
        Expense.is_income == False
    ).scalar() or 0
    total_income_today = db.session.query(db.func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        Expense.date >= today_start,
        Expense.is_income == True
    ).scalar() or 0

    # Average daily spend (expenses only)
    days_in_month = (today - start_of_month).days + 1
    average_daily_spend = total_spending_month / days_in_month if days_in_month else 0

    # Expense and income list
    items = Expense.query.filter_by(user_id=user_id).all()
    item_list = [{
        "id": i.id,
        "date": i.date.strftime('%Y-%m-%d'),
        "description": i.name,
        "category": i.category.name,
        "amount": i.amount,
        "is_income": i.is_income
    } for i in items]

    # Spending trend (last 30 days, expenses only)
    last_30_days = today - timedelta(days=30)
    spending_trend = db.session.query(
        db.func.date(Expense.date).label('date'),
        db.func.sum(Expense.amount).label('total')
    ).filter(
        Expense.user_id == user_id,
        Expense.date >= last_30_days,
        Expense.is_income == False
    ).group_by('date').order_by('date').all()
    spending_trend = [{"date": str(date), "total": total} for date, total in spending_trend]

    summary = {
        "username": current_user.username,
        "total_spending_month": total_spending_month,
        "total_income_month": total_income_month,
        "total_spending_today": total_spending_today,
        "total_income_today": total_income_today,
        "average_daily_spend": average_daily_spend,
        "items": item_list,
        "spending_trend": spending_trend
    }
    return jsonify(summary), 200