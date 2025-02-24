<<<<<<< HEAD
from flask import Blueprint

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/expenses', methods=['GET'])
def expenses():
    return "Expenses route is working!"
=======
from backend import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
>>>>>>> 01c364de1f3bc80bce958b079b9157a338b53acd
