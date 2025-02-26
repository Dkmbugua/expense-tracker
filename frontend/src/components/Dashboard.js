import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import Tesseract from 'tesseract.js';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [budget, setBudget] = useState(1000);
  const [receipt, setReceipt] = useState(null);
  const [ocrResult, setOcrResult] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      const response = await axios.get('/dashboard/summary');
      setSummary(response.data);
    };
    fetchSummary();
  }, []);

  const handleReceiptUpload = (event) => {
    const file = event.target.files[0];
    setReceipt(file);
    Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => console.log(m),
      }
    ).then(({ data: { text } }) => {
      setOcrResult(text);
    });
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Welcome, {summary.username}</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Add Expense</li>
            <li>Categories</li>
            <li>Export</li>
          </ul>
        </nav>
        <button>Logout</button>
      </div>
      <div className="main-content">
        <div className="summary-stats">
          <div className="card">
            <h3>Total Spending This Month</h3>
            <p>${summary.total_spending_month}</p>
          </div>
          <div className="card">
            <h3>Today's Spending</h3>
            <p>${summary.total_spending_today}</p>
          </div>
          <div className="card">
            <h3>Average Daily Spend</h3>
            <p>${summary.average_daily_spend?.toFixed(2)}</p>
          </div>
        </div>
        <div className="expense-list">
          <h2>Expenses</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.expenses?.map(expense => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>{expense.description}</td>
                  <td>{expense.category}</td>
                  <td>${expense.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="spending-trend">
          <h2>Spending Trend</h2>
          <Line
            data={{
              labels: summary.spending_trend?.map(entry => entry.date),
              datasets: [{
                label: 'Daily Spending',
                data: summary.spending_trend?.map(entry => entry.total),
                fill: false,
                backgroundColor: 'rgba(75,192,192,1)',
                borderColor: 'rgba(75,192,192,1)',
              }],
            }}
          />
        </div>
        <div className="budget-goal">
          <h2>Budget Goal</h2>
          <div className="thermometer">
            <div 
              className="progress" 
              style={{ height: `${(summary.total_spending_month / budget) * 100}%`, backgroundColor: (summary.total_spending_month / budget) > 0.8 ? 'red' : 'green' }}>
            </div>
          </div>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
          />
        </div>
        <div className="receipt-scanner">
          <h2>Receipt Scanner</h2>
          <input type="file" accept="image/*" onChange={handleReceiptUpload} />
          <p>OCR Result: {ocrResult}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;