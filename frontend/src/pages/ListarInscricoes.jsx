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
    <div>
      <h1>Lista de Inscrições Pendentes</h1>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {inscricoes.map((inscricao) => (
          <li
            key={inscricao._id}
            style={{
              marginBottom: '1rem',
              border: '1px solid #ccc',
              padding: '1rem',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h3>Edital: {inscricao.editalId?.nome_bolsa || 'Edital não disponível'}</h3>
            <p><strong>Status:</strong> {inscricao.status || 'Sem status'}</p>
            <p><strong>Candidato:</strong> {
              inscricao.usuarioId
                ? `${inscricao.usuarioId.nome_completo || 'Nome não disponível'} (Matrícula: ${inscricao.usuarioId.numero_matricula || 'Não informado'})`
                : 'Nome não disponível'
            }</p>
            <p><strong>Data da Inscrição:</strong> {inscricao.createdAt ? new Date(inscricao.createdAt).toLocaleDateString() : 'Não informada'}</p>
            <p><strong>Nota:</strong> {inscricao.pontuacaoFinal?.toFixed(2)} / {inscricao.notaMaximaPossivel ?? '—'}</p>

            <button
              onClick={() => handleAvaliar(inscricao._id)}
              disabled={inscricao.status !== 'pendente'}
              style={{ cursor: inscricao.status === 'pendente' ? 'pointer' : 'not-allowed' }}
            >
              Avaliar Inscrição
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListarInscricoes;
