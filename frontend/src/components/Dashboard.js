import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    username: '',
    total_spending_month: 0,
    total_income_month: 0,
    total_spending_today: 0,
    total_income_today: 0,
    average_daily_spend: 0,
    items: [],
    spending_trend: []
  });
  const [budget, setBudget] = useState(1000);
  const [newItem, setNewItem] = useState({ description: '', amount: '', category: '', date: '', is_income: false });
  const [editItem, setEditItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        console.log('Fetching data with token:', token); // Debug token
        const [summaryRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:5000/dashboard/summary', { headers: { Authorization: token } }),
          axios.get('http://localhost:5000/expenses/categories', { headers: { Authorization: token } })
        ]);
        console.log('Summary response:', summaryRes.data); // Debug response
        console.log('Categories response:', categoriesRes.data); // Debug response
        setSummary(summaryRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Error loading data. Check console or login status.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.description || !newItem.amount || !newItem.category || !newItem.date) {
      setMessage('All fields are required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/expenses', { ...newItem, name: newItem.description }, {
        headers: { Authorization: token }
      });
      const response = await axios.get('http://localhost:5000/dashboard/summary', {
        headers: { Authorization: token }
      });
      setSummary(response.data);
      setNewItem({ description: '', amount: '', category: '', date: '', is_income: false });
      setMessage('Item added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding item:', error.response || error);
      setMessage('Error adding item. Check console.');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editItem.description || !editItem.amount || !editItem.category || !editItem.date) {
      setMessage('All fields are required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/expenses/${editItem.id}`, { ...editItem, name: editItem.description }, {
        headers: { Authorization: token }
      });
      const response = await axios.get('http://localhost:5000/dashboard/summary', {
        headers: { Authorization: token }
      });
      setSummary(response.data);
      setEditItem(null);
      setMessage('Item updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating item:', error.response || error);
      setMessage('Error updating item. Check console.');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/expenses/${id}`, {
        headers: { Authorization: token }
      });
      const response = await axios.get('http://localhost:5000/dashboard/summary', {
        headers: { Authorization: token }
      });
      setSummary(response.data);
      setMessage('Item deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting item:', error.response || error);
      setMessage('Error deleting item. Check console.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const renderTrend = () => {
    const trend = summary.spending_trend || [];
    if (!trend.length) return <p>No trend data yet</p>;
    const maxAmount = Math.max(...trend.map(t => t.total || 0), 1);
    const width = 300;
    const height = 100;
    const points = trend.map((entry, i) => {
      const x = (i / (trend.length - 1)) * width;
      const y = height - ((entry.total || 0) / maxAmount) * height;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={width} height={height} className="trend-svg">
        <polyline points={points} fill="none" stroke="#4CAF50" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Welcome, {summary.username || 'User'}</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Add Expense/Income</li>
            <li>Categories</li>
            <li>Export</li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="main-content">
        {loading && <div className="message">Loading...</div>}
        {message && <div className="message">{message}</div>}
        <div className="summary-stats">
          <div className="card">
            <h3>Month Spending</h3>
            <p>${summary.total_spending_month.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <h3>Month Income</h3>
            <p>${summary.total_income_month.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <h3>Today Spending</h3>
            <p>${summary.total_spending_today.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <h3>Today Income</h3>
            <p>${summary.total_income_today.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <h3>Avg Daily Spend</h3>
            <p>${summary.average_daily_spend.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        <div className="items-list">
          <h2>Expenses & Income</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {summary.items && summary.items.length > 0 ? (
                summary.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.description}</td>
                    <td>{item.category || 'Uncategorized'}</td>
                    <td>${item.amount.toFixed(2)}</td>
                    <td>{item.is_income ? 'Income' : 'Expense'}</td>
                    <td>
                      <button onClick={() => setEditItem(item)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteItem(item.id)} className="delete-btn">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6">No items yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="spending-trend">
          <h2>Spending Trend (Last 30 Days)</h2>
          {renderTrend()}
        </div>
        <div className="budget-goal">
          <h2>Budget Goal</h2>
          <div className="thermometer">
            <div
              className="progress"
              style={{
                height: `${Math.min((summary.total_spending_month / budget) * 100, 100)}%`,
                backgroundColor: (summary.total_spending_month / budget) > 0.8 ? 'red' : 'green'
              }}
            ></div>
          </div>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Math.max(1, e.target.value))}
            placeholder="Set Budget"
          />
          <p>${summary.total_spending_month.toFixed(2) || '0.00'} of ${budget}</p>
        </div>
        <div className="manual-item">
          <h2>{editItem ? 'Edit Item' : 'Add Expense/Income'}</h2>
          <form onSubmit={editItem ? handleUpdateItem : handleAddItem}>
            <input
              type="date"
              value={editItem ? editItem.date : newItem.date}
              onChange={(e) => (editItem ? setEditItem({ ...editItem, date: e.target.value }) : setNewItem({ ...newItem, date: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={editItem ? editItem.description : newItem.description}
              onChange={(e) => (editItem ? setEditItem({ ...editItem, description: e.target.value }) : setNewItem({ ...newItem, description: e.target.value }))}
              required
            />
            <select
              value={editItem ? editItem.category : newItem.category}
              onChange={(e) => (editItem ? setEditItem({ ...editItem, category: e.target.value }) : setNewItem({ ...newItem, category: e.target.value }))}
              required
            >
              <option value="">Select Category</option>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={editItem ? editItem.amount : newItem.amount}
              onChange={(e) => (editItem ? setEditItem({ ...editItem, amount: e.target.value }) : setNewItem({ ...newItem, amount: e.target.value }))}
              step="0.01"
              required
            />
            <label>
              <input
                type="checkbox"
                checked={editItem ? editItem.is_income : newItem.is_income}
                onChange={(e) => (editItem ? setEditItem({ ...editItem, is_income: e.target.checked }) : setNewItem({ ...newItem, is_income: e.target.checked }))}
              />
              Income
            </label>
            <button type="submit" className={editItem ? 'update-btn' : 'add-btn'}>{editItem ? 'Update' : 'Add'}</button>
            {editItem && <button type="button" onClick={() => setEditItem(null)} className="cancel-btn">Cancel</button>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;