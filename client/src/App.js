import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Projects from './pages/Projects';
import Accounts from './pages/Accounts';
import CRM from './pages/CRM';
import Team from './pages/Team';
import EmployeeHome from './pages/employee/Employee';
import Login from './pages/loginpage/Login';
import Home from './pages/Home';
import { useAuth } from './context/AuthContext'; // We'll create this context

function App() {
  const { isAuthenticated, userType } = useAuth();

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navigation />}
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={userType === 'admin' ? '/' : '/employee-home'} />} />
          <Route path="/" element={isAuthenticated && userType === 'admin' ? <Home /> : <Navigate to="/login" />} />
          <Route path="/projects" element={isAuthenticated && userType === 'admin' ? <Projects /> : <Navigate to="/login" />} />
          <Route path="/accounts" element={isAuthenticated && userType === 'admin' ? <Accounts /> : <Navigate to="/login" />} />
          <Route path="/crm" element={isAuthenticated && userType === 'admin' ? <CRM /> : <Navigate to="/login" />} />
          <Route path="/team" element={isAuthenticated && userType === 'admin' ? <Team /> : <Navigate to="/login" />} />
          <Route path="/employee-home" element={isAuthenticated && userType === 'employee' ? <EmployeeHome /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;