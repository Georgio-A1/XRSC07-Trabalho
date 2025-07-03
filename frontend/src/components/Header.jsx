import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setTipoUsuario(decoded.tipo_usuario);
      setNome(decoded.nome_completo || 'Usuário');
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-blue-800 text-white flex justify-between items-center px-6 py-4 shadow-md">
      <div className="font-bold text-xl cursor-pointer" onClick={() => navigate('/dashboard')}>
        Auxílio Estudantil
      </div>

      <nav className="flex space-x-6">
        {tipoUsuario === 'administrador' && (
          <>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/cadastrar-usuario" className="hover:underline">Cadastrar Usuário</Link>
            <Link to="/criar-edital" className="hover:underline">Criar Edital</Link>
            <Link to="/excluir-edital" className="hover:underline">Excluir Edital</Link>
            <Link to="/fechar-edital" className="hover:underline">Fechar Edital</Link>
            <Link to="/responder-chamados" className="hover:underline">Chamados</Link>
          </>
        )}

        {tipoUsuario === 'funcionario' && (
          <>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/avaliar-documentos" className="hover:underline">Avaliar Documentos</Link>
            <Link to="/avaliar-inscricao" className="hover:underline">Avaliar Inscrição</Link>
          </>
        )}

        {tipoUsuario === 'aluno' && (
          <>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/realizar-inscricao" className="hover:underline">Inscrever-se</Link>
            <Link to="/cadastrar-documentos" className="hover:underline">Meus Documentos</Link>
            <Link to="/cancelar-inscricao" className="hover:underline">Cancelar Inscrição</Link>
            <Link to="/verificar-status" className="hover:underline">Status da Inscrição</Link>
          </>
        )}
      </nav>

      <div className="flex items-center space-x-4">
        <span>Olá, {nome}</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
          title="Sair"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
