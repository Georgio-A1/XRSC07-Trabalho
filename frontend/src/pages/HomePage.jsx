// src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 text-center p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Bem-vindo ao Sistema de Auxílio Estudantil</h1>
        <p className="text-gray-700 mb-6">Por favor, faça login para acessar sua conta.</p>
        <button
          onClick={handleLoginRedirect}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
        >
          Ir para Login
        </button>
      </div>
    </div>
  );
};

export default HomePage;
