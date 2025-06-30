// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem('token');
    // Se o token não existir, redireciona para a página de login
    return token ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
