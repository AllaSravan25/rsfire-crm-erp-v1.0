import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/login.css';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'https://rsfire-crm-erp-backend-v1-0.vercel.app'

const Login = () => {
  const [userType, setUserType] = useState('employee');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isCreatingPassword, setIsCreatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Attempting login with:', { userType, userId, password });
    if (userType === 'employee') {
      try {
        const response = await axios.post(`${API_URL}/employee/login`, { userId, password });
        console.log('Login response:', response.data);
        if (response.data.requiresPasswordCreation) {
          setIsCreatingPassword(true);
        } else {
          // Successful login
          login('employee', userId);
          navigate('/employee-home');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert(error.response?.data?.message || 'An error occurred during login');
      }
    } else if (userType === 'admin' && userId === 'admin1' && password === 'admin123') {
      login('admin', userId);
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/employee/create-password`, { userId, password });
      alert('Password created successfully. Please log in.');
      setIsCreatingPassword(false);
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred while creating the password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div>
      <div className="w-full flex flex-col justify-center px-16">
        <h1 className="text-6xl font-bold  text-black mb-4">RS <span style={{color: '#FF0000'}}>FIRE</span> PROTECTIONS</h1>
        <h2 className="text-6xl font-bold text-black mb-8">PVT.LTD</h2>
        <p className="text-4xl text-black mb-8">Your one-stop solution for <br></br> all your Fire and safety Needs.</p>
        <div className="flex space-x-4">
            <img src='/uploads/hdfc.png' alt='hdfc'></img>
            <img src='/uploads/zomato.png' alt='zomato'></img>
            <img src='/uploads/swiggy.png' alt='swiggy'></img>
            <img src='/uploads/fireside.png' alt='fireside'></img>
          <span className="text-white self-center">+25 more</span>
        </div>
      </div>
      </div>
      <form onSubmit={isCreatingPassword ? handleCreatePassword : handleLogin} className="login-form">
        {/* <h2>{isCreatingPassword ? 'Create Password' : 'Login'}</h2> */}
        {!isCreatingPassword && (
          <div className="form-group">
            {/* <label htmlFor="userType">User Type:</label> */}
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
        <div className="form-group">
          {/* <label htmlFor="userId">{userType === 'employee' ? 'User ID:' : 'Username:'}</label> */}
          <input
            type="text"
            id="userId"
            value={userId}
            placeholder={userType === 'employee' ? 'User ID:' : 'Username:'}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div className="form-group password-input-group">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            placeholder='Password'
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="button" 
            className="password-toggle-btn" 
            onClick={togglePasswordVisibility}
          >
            {showPassword ?<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
 :<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
 <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
</svg>
}
          </button>
        </div>
        <button type="submit">{isCreatingPassword ? 'Create Password' : 'Login'}</button>
      </form>
    </div>
  );
};

export default Login;