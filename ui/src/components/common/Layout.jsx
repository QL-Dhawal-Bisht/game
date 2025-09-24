import React from 'react';

const Layout = ({ children, darkMode }) => {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, ${darkMode ? '#374151' : '#e5e7eb'} 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-blue-400/50 rounded-full animate-bounce delay-200"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-400/50 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
