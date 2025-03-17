import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference stored in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('finance-tracker-theme');
    // Also check system preference if no saved preference
    return savedTheme ? 
      savedTheme === 'dark' : 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('finance-tracker-theme', darkMode ? 'dark' : 'light');
    // Apply theme to document body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Toggle between dark and light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};