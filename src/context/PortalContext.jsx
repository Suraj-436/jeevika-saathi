import React, { createContext, useContext, useState, useEffect } from 'react';

const PortalContext = createContext();

export function PortalProvider({ children }) {
  const [userPortal, setUserPortalState] = useState(() => {
    return localStorage.getItem('userPortal') || 'beneficiary';
  });

  const [isLoggedIn, setIsLoggedInState] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // Dynamic logged-in user ID
  const userId = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('user_phone'))
    ? `ben_${sessionStorage.getItem('user_phone')}`
    : 'beneficiary_user'; 

  const setPortal = (portal) => {
    localStorage.setItem('userPortal', portal);
    setUserPortalState(portal);
  };

  const login = (portal = 'beneficiary') => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userPortal', portal);
    setIsLoggedInState(true);
    setUserPortalState(portal);
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userPortal');
    setIsLoggedInState(false);
    setUserPortalState('beneficiary');
  };

  useEffect(() => {
    const handleStorage = () => {
      setUserPortalState(localStorage.getItem('userPortal') || 'beneficiary');
      setIsLoggedInState(localStorage.getItem('isLoggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <PortalContext.Provider value={{ userPortal, setPortal, isLoggedIn, login, logout, userId }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
