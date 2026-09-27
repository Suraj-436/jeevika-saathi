import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDemoData } from '../services/profileService';

const PortalContext = createContext();

export function PortalProvider({ children }) {
  const [userPortal, setUserPortalState] = useState(() => {
    return localStorage.getItem('userPortal') || 'beneficiary';
  });

  const [isLoggedIn, setIsLoggedInState] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // Simulated logged-in user ID
  const userId = 'ben-123'; 

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
    // Ensure DB tables exist
    initializeDemoData();

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
