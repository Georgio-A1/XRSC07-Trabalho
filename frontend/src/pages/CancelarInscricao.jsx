import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const CancelarInscricao = () => {
  const [inscricoesPendentes, setInscricoesPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState(null);
  const [cancelandoId, setCancelandoId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decodedToken = jwtDecode(token);
    setUsuarioId(decodedToken.id);
  }, [navigate]);

  useEffect(() => {
    if (!usuarioId) return;

    const fetchInscricoes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/inscricoes/pendentes/${usuarioId}`);
        setInscricoesPendentes(response.data);
      } catch (error) {
        console.error('Erro ao carregar inscrições:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInscricoes();
  }, [usuarioId]);

  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.substring(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const handleCancelarInscricao = async (inscricaoId) => {
    const confirmar = window.confirm('Tem certeza que deseja cancelar esta inscrição?');
    if (!confirmar) return;

    try {
      setCancelandoId(inscricaoId);
      await axios.delete(`http://localhost:5000/api/inscricoes/${inscricaoId}`);
      setInscricoesPendentes((prev) => prev.filter((inscricao) => inscricao._id !== inscricaoId));
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      alert('Não foi possível cancelar a inscrição. Tente novamente.');
    } finally {
      setCancelandoId(null);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-700">Carregando inscrições...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Cancelar Inscrição</h1>

      {inscricoesPendentes.length === 0 ? (
        <p className="text-gray-600">Você não tem inscrições pendentes para cancelar.</p>
      ) : (
        <ul className="space-y-6">
          {inscricoesPendentes.map((inscricao) => (
            <li
              key={inscricao._id}
              className="border rounded p-4 shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold text-gray-800">{inscricao.editalId.nome_bolsa}</h2>
              <p className="text-gray-700 mb-1">{inscricao.editalId.descricao}</p>
              <p className="text-gray-600 mb-1"><strong>Período Letivo:</strong> {inscricao.editalId.periodo_letivo}</p>
              <p className="text-gray-600 mb-1">
                <strong>Período de Inscrição:</strong>{" "}
                {formatarData(inscricao.editalId.data_inicio_inscricao)} - {formatarData(inscricao.editalId.data_fim_inscricao)}
              </p>
              <p className="text-gray-600 mb-3"><strong>Status da Inscrição:</strong> {inscricao.status}</p>
              <button
                title="Cancelar inscrição permanentemente"
                onClick={() => handleCancelarInscricao(inscricao._id)}
                disabled={cancelandoId === inscricao._id}
                className={`px-4 py-2 rounded transition text-white ${
                  cancelandoId === inscricao._id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {cancelandoId === inscricao._id ? 'Cancelando...' : 'Cancelar Inscrição'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CancelarInscricao;
