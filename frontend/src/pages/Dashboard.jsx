import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  FaUserGraduate,
  FaClipboardList,
  FaFileAlt,
  FaTimesCircle,
  FaCheckCircle,
  FaUserCog,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaLock,
} from 'react-icons/fa';

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

  const Card = ({ title, icon: Icon, onClick, color = 'bg-blue-600' }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer ${color} text-white p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-200 flex flex-col items-center justify-center`}
    >
      <Icon className="text-3xl mb-2" />
      <h3 className="text-md font-semibold text-center">{title}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 items-center">
        <header className="w-full flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Bem-vindo(a), {nome}!</h1>
            <p className="text-gray-600 text-sm mt-1 capitalize">Tipo de usuário: {tipoUsuario}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        {/* Aluno */}
        {tipoUsuario === 'aluno' && (
          <>
            <h2 className="text-xl font-bold text-blue-700 mb-4">Ações do Aluno</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
              <Card title="Meu Perfil" icon={FaUserGraduate} onClick={() => navigate('/perfil')} />
              <Card title="Cadastrar Documentos" icon={FaFileAlt} onClick={() => navigate('/cadastrar-documentos')} />
              <Card title="Realizar Inscrição" icon={FaClipboardList} onClick={() => navigate('/realizar-inscricao')} />
              <Card title="Cancelar Inscrição" icon={FaTimesCircle} onClick={() => navigate('/cancelar-inscricao')} />
              <Card title="Verificar Status" icon={FaCheckCircle} onClick={() => navigate('/verificar-status')} />
            </div>
          </>
        )}

        {/* Funcionário */}
        {tipoUsuario === 'funcionario' && (
          <>
            <h2 className="text-xl font-bold text-green-700 mb-4 mt-8">Ações do Funcionário</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <Card title="Meu Perfil" icon={FaUserGraduate} onClick={() => navigate('/perfil')} />
              <Card
                title="Avaliar Documentos"
                icon={FaFileAlt}
                onClick={() => navigate('/avaliar-documentos')}
                color="bg-green-600"
              />
              <Card
                title="Avaliar Inscrição"
                icon={FaClipboardList}
                onClick={() => navigate('/avaliar-inscricao')}
                color="bg-green-600"
              />
            </div>
          </>
        )}

        {/* Administrador */}
        {tipoUsuario === 'administrador' && (
          <>
            <h2 className="text-xl font-bold text-purple-700 mb-4 mt-8">Ações do Administrador</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              <Card title="Meu Perfil" icon={FaUserGraduate} onClick={() => navigate('/perfil')} />
              <Card title="Criar Edital" icon={FaPlusCircle} onClick={() => navigate('/criar-edital')} color="bg-purple-600" />
              <Card title="Editar Edital" icon={FaEdit} onClick={() => navigate('/editar-edital')} color="bg-purple-600" />
              <Card title="Fechar Edital" icon={FaLock} onClick={() => navigate('/fechar-edital')} color="bg-purple-600" />
              <Card title="Excluir Edital" icon={FaTrash} onClick={() => navigate('/excluir-edital')} color="bg-purple-600" />
              <Card title="Cadastrar Usuário" icon={FaUserCog} onClick={() => navigate('/cadastrar-usuario')} color="bg-purple-600" />
              <Card title="Avaliar Documentos" icon={FaFileAlt} onClick={() => navigate('/avaliar-documentos')} color="bg-purple-600" />
              <Card title="Avaliar Inscrição" icon={FaClipboardList} onClick={() => navigate('/avaliar-inscricao')} color="bg-purple-600" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
