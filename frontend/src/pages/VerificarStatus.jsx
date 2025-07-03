import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const VerificarStatusInscricoes = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = jwtDecode(token);
    setUsuarioId(decoded.id);
  }, [navigate]);

  useEffect(() => {
    if (!usuarioId) return;

    const fetchInscricoes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/inscricoes/usuario/${usuarioId}`);
        setInscricoes(response.data);
      } catch (err) {
        console.error('Erro ao buscar inscrições do aluno:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInscricoes();
  }, [usuarioId]);

  if (loading)
    return <p className="text-center mt-10 text-gray-700">Carregando inscrições...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Minhas Inscrições</h1>

      {inscricoes.length === 0 ? (
        <p className="text-gray-600">Você ainda não realizou nenhuma inscrição.</p>
      ) : (
        <ul className="space-y-4">
          {inscricoes.map((inscricao) => (
            <li
              key={inscricao._id}
              className="border rounded p-4 shadow-sm bg-white"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {inscricao.editalId?.nome_bolsa || 'Edital não disponível'}
              </h3>
              <p>
                <strong>Status:</strong> {inscricao.status}
              </p>
              <p>
                <strong>Nota Final:</strong>{' '}
                {inscricao.pontuacaoFinal !== undefined
                  ? inscricao.pontuacaoFinal.toFixed(2)
                  : 'N/A'}
              </p>
              {inscricao.observacaoAvaliador && (
                <p>
                  <strong>Comentário do Avaliador:</strong>{' '}
                  {inscricao.observacaoAvaliador}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VerificarStatusInscricoes;
