import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ListarEditais = () => {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.substring(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        // Obter o token do localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token não encontrado');
          return;
        }

        // Decodificar o token para obter o usuarioId
        const decodedToken = jwtDecode(token);
        const usuarioId = decodedToken.id;
        console.log(usuarioId)

        // Enviar o usuarioId como parte dos headers
        const response = await axios.get('http://localhost:5000/api/inscricoes/disponiveis', {
          headers: {
            'Authorization': `Bearer ${token}`, // Enviar o token para o backend
            'usuarioId': usuarioId, // Enviar o usuarioId se necessário
          }
        });
        setEditais(response.data);
      } catch (error) {
        console.error('Erro ao carregar editais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEditais();
  }, []);

  const handleInscricao = (id) => {
    navigate(`/realizar-inscricao/${id}`);
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h1>Editais Disponíveis</h1>
      {editais.length === 0 ? (
        <p>Nenhum edital disponível para inscrição no momento.</p>
      ) : (
        <ul>
          {editais.map((edital) => (
            <li key={edital._id}>
              <h2>{edital.nome_bolsa}</h2>
              <p>{edital.descricao}</p>
              <p>
                Período de Inscrição:{" "}
                {formatarData(edital.data_inicio_inscricao)} - {formatarData(edital.data_fim_inscricao)}
              </p>

              <p><strong>Documentos Obrigatórios:</strong></p>
              <ul>
                {edital.documentos_exigidos
                  .filter(doc => doc.obrigatorio)
                  .map(doc => (
                    <li key={doc.tipo}>{doc.tipo} - {doc.descricao}</li>
                  ))}
              </ul>

              <button onClick={() => handleInscricao(edital._id)}>Inscreva-se</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListarEditais;
