import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUserType = localStorage.getItem('userType');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUserId(storedUserId);
    }
  }, []);

  const login = (type, id) => {
    setIsAuthenticated(true);
    setUserType(type);
    setUserId(id);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', type);
    localStorage.setItem('userId', id);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUserId(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);