import axios from 'axios';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    category: '',
    amount: '',
    type: 'Expense', // Default type
    date: ''
  });

  // Fetch dashboard data on load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get('http://127.0.0.1:5000/dashboard/summary', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',   
          'Content-Type': 'application/json'  
        }
      });

      console.log("API Response:", response.data);
      setSummary(response.data);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error.response?.data || error);
      setError("Failed to load dashboard data. Please try again later.");
    }
  };

  // Handle input changes for new transaction
  const handleInputChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };

  // Handle form submission for adding transactions
  const handleAddTransaction = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.post('http://127.0.0.1:5000/transactions/add', newTransaction, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("Transaction added:", response.data);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error adding transaction:', error.response?.data || error);
      setError("Failed to add transaction. Please try again.");
    }
  };

  // Handle transaction deletion
  const handleDeleteTransaction = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        return;
      }

      await axios.delete(`http://127.0.0.1:5000/transactions/delete/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("Transaction deleted:", id);
      fetchDashboardData(); // Refresh transactions list
    } catch (error) {
      console.error('Error deleting transaction:', error.response?.data || error);
      setError("Failed to delete transaction. Please try again.");
    }
  };

  return (
    <div>
      <h1>Welcome back, {summary?.username || "User"}!</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Total Balance: {summary?.total_balance || "N/A"}</p>
      <p>Monthly Income: {summary?.total_income || "N/A"}</p>
      <p>Monthly Expenses: {summary?.total_expenses || "N/A"}</p>

      <h2>Add Transaction</h2>
      <form onSubmit={handleAddTransaction}>
        <input type="text" name="description" placeholder="Description" value={newTransaction.description} onChange={handleInputChange} required />
        <input type="text" name="category" placeholder="Category" value={newTransaction.category} onChange={handleInputChange} required />
        <input type="number" name="amount" placeholder="Amount" value={newTransaction.amount} onChange={handleInputChange} required />
        <input type="date" name="date" value={newTransaction.date} onChange={handleInputChange} required />
        <select name="type" value={newTransaction.type} onChange={handleInputChange}>
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
        </select>
        <button type="submit">Add</button>
      </form>

      <h2>Transactions</h2>
      <ul>
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <li key={t.id}>
              {t.date} - {t.description} ({t.category || "Uncategorized"}): {t.amount} ({t.type})
              <button onClick={() => handleDeleteTransaction(t.id)}>Delete</button>
            </li>
          ))
        ) : (
          <p>No transactions available.</p>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;