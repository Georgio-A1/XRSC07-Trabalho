import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [nome, setNome] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setTipoUsuario(decodedToken.tipo_usuario);
      setNome(decodedToken.nome_completo || 'Usuário');
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Bem-vindo ao Dashboard, {nome}!</h1>

      <button onClick={handleLogout}>Logout</button>

      {tipoUsuario === 'aluno' && (
        <div>
          <button onClick={() => navigate('/cadastrar-documentos')}>Cadastrar Documentos</button>
          <button onClick={() => navigate('/realizar-inscricao')}>Realizar Inscrição</button>
          <button onClick={() => navigate('/cancelar-inscricao')}>Cancelar Inscrição</button>
          <button onClick={() => navigate('/verificar-status')}>Verificar Status</button>
        </div>
      )}

      {tipoUsuario === 'funcionario' && (
        <div>
          <button onClick={() => navigate('/avaliar-documentos')}>Avaliar Documentos</button>
          <button onClick={() => navigate('/avaliar-inscricao')}>Avaliar Inscrição</button>
        </div>
      )}

      {tipoUsuario === 'administrador' && (
        <div>
          <button onClick={() => navigate('/criar-edital')}>Criar Edital</button>
          <button onClick={() => navigate('/editar-edital')}>Editar Edital</button>
          <button onClick={() => navigate('/fechar-edital')}>Fechar Edital</button>
          <button onClick={() => navigate('/excluir-edital')}>Excluir Edital</button>
          <button onClick={() => navigate('/cadastrar-usuario')}>Cadastrar Usuário</button>
          <button onClick={() => navigate('/avaliar-documentos')}>Avaliar Documentos</button>
          <button onClick={() => navigate('/avaliar-inscricao')}>Avaliar Inscrição</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
