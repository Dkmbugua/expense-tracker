import axios from 'axios';
import { useEffect, useState } from 'react';

const Expenses = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({ name: '', amount: '', category_id: '', is_income: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/expenses/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError("Failed to load transactions. Try again later.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/expenses/add', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions(); // Refresh transaction list
      setFormData({ name: '', amount: '', category_id: '', is_income: false });
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError("Failed to add transaction.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/expenses/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions(); // Refresh transaction list
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError("Failed to delete transaction.");
    }
  };

  return (
    <div>
      <h1>Manage Expenses & Income</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
        <input
          type="number"
          placeholder="Category ID (Optional)"
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={formData.is_income}
            onChange={(e) => setFormData({ ...formData, is_income: e.target.checked })}
          />
          Is Income?
        </label>
        <button type="submit">Add Transaction</button>
      </form>

      <h2>Transactions</h2>
      <ul>
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <li key={t.id}>
              {t.date} - {t.name} ({t.category ? t.category : "Uncategorized"}): {t.amount} ({t.type})
              <button onClick={() => handleDelete(t.id)}>Delete</button>
            </li>
          ))
        ) : (
          <p>No transactions available.</p>
        )}
      </ul>

    </div>
  );
};

export default Expenses;