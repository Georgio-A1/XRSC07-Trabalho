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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">Bem-vindo ao Dashboard, {nome}!</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      {tipoUsuario === 'aluno' && (
        <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/cadastrar-documentos')}
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Cadastrar Documentos
          </button>
          <button
            onClick={() => navigate('/realizar-inscricao')}
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Realizar Inscrição
          </button>
          <button
            onClick={() => navigate('/cancelar-inscricao')}
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Cancelar Inscrição
          </button>
          <button
            onClick={() => navigate('/verificar-status')}
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Verificar Status
          </button>
        </section>
      )}

      {tipoUsuario === 'funcionario' && (
        <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/avaliar-documentos')}
            className="bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
          >
            Avaliar Documentos
          </button>
          <button
            onClick={() => navigate('/avaliar-inscricao')}
            className="bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
          >
            Avaliar Inscrição
          </button>
        </section>
      )}

      {tipoUsuario === 'administrador' && (
        <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/criar-edital')}
            className="bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
          >
            Criar Edital
          </button>
          <button
            onClick={() => navigate('/editar-edital')}
            className="bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
          >
            Editar Edital
          </button>
          <button
            onClick={() => navigate('/fechar-edital')}
            className="bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
          >
            Fechar Edital
          </button>
          <button
            onClick={() => navigate('/excluir-edital')}
            className="bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
          >
            Excluir Edital
          </button>
          <button
            onClick={() => navigate('/cadastrar-usuario')}
            className="bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
          >
            Cadastrar Usuário
          </button>
          <button
            onClick={() => navigate('/avaliar-documentos')}
            className="bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
          >
            Avaliar Documentos
          </button>
          <button
            onClick={() => navigate('/avaliar-inscricao')}
            className="bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
          >
            Avaliar Inscrição
          </button>
        </section>
      )}
    </div>

  );
};

export default Dashboard;
