import React from 'react';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-tertiary hover:bg-opacity-80 transition-all duration-200 transform hover:scale-105 accent-glow"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        // Animated moon icon
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className="absolute w-4 h-4 rounded-full bg-yellow-300">
            <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-secondary"></div>
          </div>
          <div className="absolute w-1 h-1 rounded-full bg-yellow-300 top-0 right-1 animate-pulse"></div>
          <div className="absolute w-1 h-1 rounded-full bg-yellow-300 top-3 left-0 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
      ) : (
        // Animated sun icon
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          {/* Sun rays */}
          <div className="absolute w-1 h-1.5 bg-yellow-500 top-0 left-2.5 rounded-full"></div>
          <div className="absolute w-1 h-1.5 bg-yellow-500 bottom-0 left-2.5 rounded-full"></div>
          <div className="absolute w-1.5 h-1 bg-yellow-500 left-0 top-2.5 rounded-full"></div>
          <div className="absolute w-1.5 h-1 bg-yellow-500 right-0 top-2.5 rounded-full"></div>
          {/* Diagonal rays */}
          <div className="absolute w-1 h-1 bg-yellow-500 top-1 left-1 rounded-full"></div>
          <div className="absolute w-1 h-1 bg-yellow-500 bottom-1 left-1 rounded-full"></div>
          <div className="absolute w-1 h-1 bg-yellow-500 top-1 right-1 rounded-full"></div>
          <div className="absolute w-1 h-1 bg-yellow-500 bottom-1 right-1 rounded-full"></div>
        </div>
      )}
    </button>
  );
};

export default ThemeToggle;