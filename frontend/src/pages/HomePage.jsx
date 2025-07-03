import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const abrirModal = () => {
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 text-center p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-6xl mb-4">🎓</div> {/* Ícone simples */}
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          Bem-vindo ao Sistema de Auxílio Estudantil
        </h1>
        <p className="text-gray-700 mb-6">
          Gerencie suas inscrições para bolsas de forma simples, rápida e transparente.
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleLoginRedirect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
          >
            Ir para Login
          </button>
          <button
            onClick={abrirModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-full transition duration-300"
          >
            Conhecer o sistema
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Não possui cadastro? Entre em contato com a administração.
        </p>
      </div>

      {/* Footer simples */}
      <footer className="mt-8 text-gray-600 text-sm">
        © 2025 Universidade Fictícia - Sistema de Auxílio Estudantil |{' '}
        <a href="mailto:suporte@universidadeficticia.edu" className="underline hover:text-blue-600">
          Contato
        </a>
      </footer>

      {/* Modal */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={fecharModal}
        >
          <div
            className="bg-white p-8 rounded-lg max-w-lg w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()} // impede fechar clicando dentro
          >
            <h2 className="text-2xl font-bold mb-4">Sobre o Sistema</h2>
            <p className="mb-4 text-gray-700">
              Este sistema foi desenvolvido para facilitar o processo de inscrição e
              avaliação das bolsas de auxílio estudantil da universidade. Você pode:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700 text-left">
              <li>Visualizar editais disponíveis</li>
              <li>Realizar inscrições e enviar documentos</li>
              <li>Acompanhar o status da sua inscrição e documentos</li>
              <li>Receber notificações sobre resultados e avaliações</li>
            </ul>
            <button
              onClick={fecharModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-xl"
              aria-label="Fechar modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
