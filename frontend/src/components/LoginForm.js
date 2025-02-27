import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (username === '' || password === '') {
      setError('All fields are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/auth/login', { username, password }, {
        withCredentials: true // Allow cookies if using sessions
      });
      localStorage.setItem('token', response.data.token); // Store the token from backend
      alert('Login successful');
      console.log('Login response:', response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in', error);
      setError(error.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </form>
    </div>
  );
};

export default LoginForm;