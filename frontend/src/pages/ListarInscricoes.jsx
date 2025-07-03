import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ListarInscricoes = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInscricoes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/avaliacao/pendentes');
        setInscricoes(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar inscrições:', error);
        setErro('Erro ao carregar inscrições');
      } finally {
        setLoading(false);
      }
    };

    fetchInscricoes();
  }, []);

  const handleAvaliar = (inscricaoId) => {
    navigate(`/avaliar-inscricao/${inscricaoId}`);
  };

  if (loading) return <p>Carregando inscrições...</p>;

  if (erro) return <p style={{ color: 'red' }}>{erro}</p>;

  if (inscricoes.length === 0) return <p>Não há inscrições pendentes para avaliar.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Lista de Inscrições Pendentes</h1>

      {erro && <p className="text-red-600">{erro}</p>}
      {inscricoes.length === 0 ? (
        <p className="text-gray-700">Não há inscrições pendentes para avaliar.</p>
      ) : (
        <ul className="space-y-4">
          {inscricoes.map((inscricao) => (
            <li
              key={inscricao._id}
              className="border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Edital: {inscricao.editalId?.nome_bolsa || 'Edital não disponível'}
              </h3>
              <p className="text-sm text-gray-700">
                <strong>Status:</strong> {inscricao.status || 'Sem status'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Candidato:</strong>{' '}
                {inscricao.usuarioId
                  ? `${inscricao.usuarioId.nome_completo || 'Nome não disponível'} (Matrícula: ${inscricao.usuarioId.numero_matricula || 'Não informado'})`
                  : 'Nome não disponível'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Data da Inscrição:</strong>{' '}
                {inscricao.createdAt
                  ? new Date(inscricao.createdAt).toLocaleDateString()
                  : 'Não informada'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Nota:</strong>{' '}
                {inscricao.pontuacaoFinal?.toFixed(2)} / {inscricao.notaMaximaPossivel ?? '—'}
              </p>

              <button
                onClick={() => handleAvaliar(inscricao._id)}
                disabled={inscricao.status !== 'pendente'}
                className={`mt-3 inline-block px-4 py-2 rounded ${inscricao.status === 'pendente'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  } transition-colors`}
              >
                Avaliar Inscrição
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListarInscricoes;
