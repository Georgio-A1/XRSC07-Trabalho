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

  if (loading) return <p>Carregando inscrições...</p>;

  return (
    <div>
      <h1>Minhas Inscrições</h1>
      {inscricoes.length === 0 ? (
        <p>Você ainda não realizou nenhuma inscrição.</p>
      ) : (
        <ul>
          {inscricoes.map(inscricao => (
            <li key={inscricao._id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
              <h3>{inscricao.editalId?.nome_bolsa}</h3>
              <p><strong>Status:</strong> {inscricao.status}</p>
              <p><strong>Nota Final:</strong> {inscricao.pontuacaoFinal !== undefined ? inscricao.pontuacaoFinal.toFixed(2) : 'N/A'}</p>
              {inscricao.observacaoAvaliador && (
                <p><strong>Comentário do Avaliador:</strong> {inscricao.observacaoAvaliador}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VerificarStatusInscricoes;
