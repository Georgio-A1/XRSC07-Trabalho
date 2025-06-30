// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="flex justify-between items-center bg-blue-900 p-4 h-[15vh] shadow-md">
      <div className="text-lg font-bold text-white">🌟 Sistema Auxílio</div>
      <div className="flex space-x-6">
        <Link to="/" className="text-white hover:underline">Home</Link>
        <Link to="/ajuda" className="text-white hover:underline">Ajuda</Link>

      </div>
    </nav>
  );
};

export default NavBar;
